import assert from "node:assert/strict";
import test from "node:test";
import {
  FIDELIS_NJ_FAMILYCARE_SOURCE_URL,
  autocompleteFidelisNjFamilyCare,
  fidelisNjFamilyCareDrugs,
  fidelisNjFamilyCareSource,
  lookupFidelisNjFamilyCare,
} from "./fidelis-nj-familycare.js";

test("exposes a dated NJ FamilyCare source and pulmonary extraction", () => {
  assert.equal(fidelisNjFamilyCareSource.url, FIDELIS_NJ_FAMILYCARE_SOURCE_URL);
  assert.equal(fidelisNjFamilyCareSource.effectiveDate, "2026-08-01");
  assert.equal(fidelisNjFamilyCareSource.extraction, "partial-pulmonary-pdf-extraction");
  assert.ok(fidelisNjFamilyCareDrugs.length >= 20);
});

test("supports product aliases, token matching, and common typos", () => {
  assert.equal(autocompleteFidelisNjFamilyCare("albuterol hfa")[0]?.id, "albuterol-hfa");
  assert.equal(autocompleteFidelisNjFamilyCare("symbicort")[0]?.id, "budesonide-formoterol");
  assert.equal(autocompleteFidelisNjFamilyCare("albutrol")[0]?.id, "albuterol-hfa");
  assert.equal(autocompleteFidelisNjFamilyCare("pulmonary hypertension")[0]?.id, "ambrisentan");
});

test("returns a source-backed result and keeps absence unconfirmed", () => {
  const found = lookupFidelisNjFamilyCare("budesonide-formoterol");
  const missing = lookupFidelisNjFamilyCare("not-a-fidelis-row");
  assert.equal(found.status, "listed");
  assert.equal(found.drug?.tier, "P");
  assert.equal(found.drug?.quantityLimit, true);
  assert.equal(missing.status, "not-listed-in-source");
  assert.match(missing.notice, /unconfirmed/i);
});
