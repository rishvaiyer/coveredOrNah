CREATE TABLE IF NOT EXISTS formulary_imports (
  id BIGSERIAL PRIMARY KEY,
  source_url TEXT NOT NULL,
  source_version TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  plan_count INTEGER NOT NULL DEFAULT 0,
  drug_count INTEGER NOT NULL DEFAULT 0,
  error TEXT
);

CREATE TABLE IF NOT EXISTS medicare_plans (
  id BIGSERIAL PRIMARY KEY,
  import_id BIGINT NOT NULL REFERENCES formulary_imports(id),
  contract_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  segment_id TEXT NOT NULL DEFAULT '000',
  contract_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  formulary_id TEXT NOT NULL,
  state TEXT,
  county_code TEXT,
  ma_region_code TEXT,
  pdp_region_code TEXT,
  UNIQUE(import_id, contract_id, plan_id, segment_id, state, county_code)
);

CREATE INDEX IF NOT EXISTS medicare_plans_lookup_idx ON medicare_plans (contract_name, plan_name, state);
CREATE INDEX IF NOT EXISTS medicare_plans_formulary_idx ON medicare_plans (formulary_id, import_id);

CREATE TABLE IF NOT EXISTS medicare_formulary_drugs (
  id BIGSERIAL PRIMARY KEY,
  import_id BIGINT NOT NULL REFERENCES formulary_imports(id),
  formulary_id TEXT NOT NULL,
  rxcui TEXT,
  ndc TEXT,
  tier_level SMALLINT,
  quantity_limit BOOLEAN NOT NULL DEFAULT false,
  quantity_limit_amount TEXT,
  quantity_limit_days TEXT,
  prior_authorization BOOLEAN NOT NULL DEFAULT false,
  step_therapy BOOLEAN NOT NULL DEFAULT false,
  selected_drug BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(import_id, formulary_id, rxcui, ndc)
);

CREATE INDEX IF NOT EXISTS medicare_formulary_drugs_rxcui_idx ON medicare_formulary_drugs (rxcui, formulary_id, import_id);
CREATE INDEX IF NOT EXISTS medicare_formulary_drugs_ndc_idx ON medicare_formulary_drugs (ndc, formulary_id, import_id);
