from __future__ import annotations

from collections import defaultdict

from .models import Evidence, Ledger, Product
from .normalize import comparable_keys, product_key


def match_products(candidates: list[Product], evidence: list[Evidence]) -> Ledger:
    by_key: dict[tuple[str, ...], list[Evidence]] = defaultdict(list)
    for record in evidence:
        by_key[product_key(record.product)].append(record)

    ledger = Ledger()
    for candidate in candidates:
        matches: list[Evidence] = []
        for key in comparable_keys(candidate):
            matches.extend(by_key.get(key, []))
        unique = {(row.source_id, row.source_row, row.tier, product_key(row.product)): row for row in matches}
        if not unique:
            ledger.add(Evidence(source_id="", plan_name="", product=candidate, state="unconfirmed", note="No exact source row matched the full product identity."))
            continue
        rows = list(unique.values())
        states = {row.state for row in rows}
        if len(states) > 1 or len({row.tier for row in rows}) > 1:
            ledger.add(Evidence(source_id=rows[0].source_id, plan_name=rows[0].plan_name, product=candidate, state="conflicting", note="Multiple exact source rows disagree; human review required."))
        else:
            ledger.add(rows[0])
    return ledger
