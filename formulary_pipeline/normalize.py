from __future__ import annotations

import re
import unicodedata

from .models import Product


def clean(value: object) -> str:
    text = unicodedata.normalize("NFKC", str(value or "")).strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def digits(value: object) -> str:
    return re.sub(r"[^0-9]", "", str(value or ""))


def product_from_row(row: dict[str, object]) -> Product:
    medication = row.get("medication") or row.get("drug") or row.get("drug_name") or ""
    generic = row.get("generic") or row.get("generic_name") or medication
    return Product(
        medication=clean(medication),
        brand=clean(row.get("brand")),
        generic=clean(generic),
        strength=clean(row.get("strength")),
        dosage_form=clean(row.get("dosage_form") or row.get("form")),
        device=clean(row.get("device")),
        ndc=digits(row.get("ndc")),
        rxcui=digits(row.get("rxcui") or row.get("rxnorm")),
    )


def product_key(product: Product) -> tuple[str, ...]:
    """Exact identity key. Empty fields are intentionally retained as empty."""
    return (
        clean(product.generic or product.medication),
        clean(product.brand),
        clean(product.strength),
        clean(product.dosage_form),
        clean(product.device),
        digits(product.ndc),
        digits(product.rxcui),
    )


def comparable_keys(product: Product) -> set[tuple[str, ...]]:
    """Return only defensible exact keys, never therapeutic or fuzzy aliases."""
    full = product_key(product)
    keys = {full}
    if product.ndc:
        keys.add(("", "", "", "", "", digits(product.ndc), ""))
    if product.rxcui:
        keys.add((clean(product.generic or product.medication), "", clean(product.strength), clean(product.dosage_form), clean(product.device), "", digits(product.rxcui)))
    return keys
