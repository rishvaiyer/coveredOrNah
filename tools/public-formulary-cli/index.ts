#!/usr/bin/env node
import {
  CliError,
  DEFAULT_TIMEOUT_MS,
  MarketplaceClient,
  RxNormClient,
  SOURCE_REGISTRY,
  marketplaceApiKey,
  type RxNormSearchMode,
} from "./client.js";
import { DEFAULT_QHP_MAX_BYTES, ingestQhpFormulary } from "./qhp.js";
import { verifyBundledDemo } from "./demo.js";

const VERSION = "0.1.0";

const HELP = `Public Formulary Data CLI ${VERSION}

Read-only access to official RxNorm and CMS Marketplace data.

Usage:
  npm run formulary-data -- <command> [options]

Commands:
  sources
      Print the official source registry and coverage boundaries.

  doctor [--timeout-ms 15000]
      Check RxNorm availability and CMS Marketplace key configuration.

  demo verify
      Run the bundled CMS QHP normalization demo offline and report its
      fixed source date, content hash, candidate, issue, and gap counts.

  rxnorm normalize --name <drug> [--mode <mode>] [--timeout-ms 15000]
      Normalize a medication name. Modes: exact, normalized,
      exact-or-normalized (default), approximate.

  rxnorm product --rxcui <id> [--include-ndcs] [--timeout-ms 15000]
      Inspect an exact RxNorm concept and optionally its active NDCs.

  marketplace years [--timeout-ms 15000]
      List supported Marketplace years.

  marketplace drugs search --query <drug> [--year <year>] [--timeout-ms 15000]
      Search Marketplace prescription drug concepts.

  marketplace drugs autocomplete --query <prefix> [--year <year>] [--timeout-ms 15000]
      Autocomplete a drug prefix of at least 3 characters.

  marketplace coverage --rxcui <id[,id]> --plan-id <id[,id]> --year <year>
      Check RxCUI coverage for specific ACA Marketplace plan IDs.

  marketplace plan --plan-id <id> --year <year> [--timeout-ms 15000]
      Validate a Marketplace plan ID and inspect plan details.

  qhp formulary normalize --input <path-or-https-url> [--max-bytes <bytes>]
      Validate and normalize a CMS QHP drugs.json file into candidate rows
      and a machine-readable gap summary. This command never writes to the database.

Global:
  --help       Show this help.
  --version    Show the CLI version.

Authentication:
  export CMS_MARKETPLACE_API_KEY="..."
  Request a key: https://developer.cms.gov/marketplace-api/key-request.html

Output:
  Successful results are JSON on stdout. Errors are JSON on stderr.
  The Marketplace API key is redacted from reported request URLs.
`;

type ParsedOptions = Map<string, string[] | boolean>;

function parseOptions(args: string[]) {
  const positionals: string[] = [];
  const options: ParsedOptions = new Map();
  const flags = new Set(["help", "version", "include-ndcs"]);

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith("--")) {
      positionals.push(value);
      continue;
    }
    const key = value.slice(2);
    if (!key) throw new CliError("Invalid empty option.", 2);
    if (flags.has(key)) {
      options.set(key, true);
      continue;
    }
    const next = args[index + 1];
    if (!next || next.startsWith("--")) throw new CliError(`Option --${key} requires a value.`, 2);
    const prior = options.get(key);
    options.set(key, [...(Array.isArray(prior) ? prior : []), next]);
    index += 1;
  }
  return { positionals, options };
}

function option(options: ParsedOptions, key: string, required = false) {
  const value = options.get(key);
  const resolved = Array.isArray(value) ? value.at(-1) : undefined;
  if (required && !resolved) throw new CliError(`--${key} is required.`, 2);
  return resolved;
}

function listOption(options: ParsedOptions, key: string) {
  const value = options.get(key);
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean);
}

function integerOption(options: ParsedOptions, key: string, required = false) {
  const raw = option(options, key, required);
  if (raw === undefined) return undefined;
  if (!/^\d+$/.test(raw)) throw new CliError(`--${key} must be an integer.`, 2);
  return Number(raw);
}

function timeoutOption(options: ParsedOptions) {
  const timeout = integerOption(options, "timeout-ms") ?? DEFAULT_TIMEOUT_MS;
  if (timeout < 100 || timeout > 120_000) throw new CliError("--timeout-ms must be between 100 and 120000.", 2);
  return timeout;
}

function output(value: unknown) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function doctor(options: ParsedOptions) {
  const timeout = timeoutOption(options);
  const result: Record<string, unknown> = {
    cli: { status: "ready", version: VERSION },
    rxnorm: { status: "checking" },
    marketplace: { status: "checking" },
  };

  try {
    const version = await new RxNormClient(fetch, timeout).version();
    result.rxnorm = { status: "available", version };
  } catch (error) {
    result.rxnorm = { status: "unavailable", error: error instanceof Error ? error.message : String(error) };
  }

  try {
    const key = marketplaceApiKey();
    const years = await new MarketplaceClient(key, fetch, timeout).marketYears();
    result.marketplace = { status: "available", keyConfigured: true, years };
  } catch (error) {
    if (error instanceof CliError && error.exitCode === 2) {
      result.marketplace = {
        status: "not_configured",
        keyConfigured: false,
        setup: "Set CMS_MARKETPLACE_API_KEY. Request a key at https://developer.cms.gov/marketplace-api/key-request.html",
      };
    } else {
      result.marketplace = { status: "unavailable", keyConfigured: true, error: error instanceof Error ? error.message : String(error) };
    }
  }

  const rxnormReady = (result.rxnorm as { status?: string }).status === "available";
  const marketplaceReady = (result.marketplace as { status?: string }).status === "available";
  result.status = rxnormReady && marketplaceReady ? "ready" : rxnormReady ? "partial" : "unavailable";
  output(result);
}

async function main() {
  const { positionals, options } = parseOptions(process.argv.slice(2));
  if (options.has("version")) return output({ name: "public-formulary-data-cli", version: VERSION });
  if (options.has("help") || positionals.length === 0) {
    process.stdout.write(HELP);
    return;
  }

  const timeout = timeoutOption(options);
  const [area, action, subaction] = positionals;

  if (area === "sources" && !action) return output({ sources: SOURCE_REGISTRY });
  if (area === "doctor" && !action) return doctor(options);
  if (area === "demo" && action === "verify" && !subaction) return output(await verifyBundledDemo());

  if (area === "qhp" && action === "formulary" && subaction === "normalize") {
    const maxBytes = integerOption(options, "max-bytes") ?? DEFAULT_QHP_MAX_BYTES;
    return output(await ingestQhpFormulary(option(options, "input", true)!, { timeoutMs: timeout, maxBytes }));
  }

  if (area === "rxnorm") {
    const client = new RxNormClient(fetch, timeout);
    if (action === "normalize" && !subaction) {
      const mode = (option(options, "mode") ?? "exact-or-normalized") as RxNormSearchMode;
      return output(await client.normalize(option(options, "name", true)!, mode));
    }
    if (action === "product" && !subaction) {
      return output(await client.product(option(options, "rxcui", true)!, options.has("include-ndcs")));
    }
  }

  if (area === "marketplace") {
    const client = new MarketplaceClient(marketplaceApiKey(), fetch, timeout);
    if (action === "years" && !subaction) return output(await client.marketYears());
    if (action === "drugs" && (subaction === "search" || subaction === "autocomplete")) {
      return output(await client.searchDrugs(
        option(options, "query", true)!,
        integerOption(options, "year"),
        subaction === "autocomplete",
      ));
    }
    if (action === "coverage" && !subaction) {
      return output(await client.drugCoverage(
        listOption(options, "rxcui"),
        listOption(options, "plan-id"),
        integerOption(options, "year", true)!,
      ));
    }
    if (action === "plan" && !subaction) {
      return output(await client.plan(option(options, "plan-id", true)!, integerOption(options, "year", true)!));
    }
  }

  throw new CliError(`Unknown command: ${positionals.join(" ")}`, 2, { help: "Run with --help." });
}

main().catch((error) => {
  const cliError = error instanceof CliError ? error : new CliError(error instanceof Error ? error.message : String(error));
  process.stderr.write(`${JSON.stringify({ error: cliError.message, details: cliError.details }, null, 2)}\n`);
  process.exitCode = cliError.exitCode;
});
