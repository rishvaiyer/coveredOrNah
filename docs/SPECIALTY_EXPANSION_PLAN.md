# Specialty expansion plan

The product should expand by reusing one workflow engine and adding specialty-specific medication sets, plan priorities, and source connectors. The exact sequence remains insurer, coverage type, exact plan or formulary, exact medication product, and source-backed result.

## Best next specialties

### 1. Primary care

Highest reuse and volume. Prioritize hypertension, diabetes, lipid management, anticoagulation, thyroid, gastrointestinal, and common antibiotics. The existing catalog already includes a starting set such as lisinopril, losartan, amlodipine, atorvastatin, metformin, apixaban, omeprazole, prednisone, doxycycline, and ibuprofen.

### 2. Endocrinology

Add insulin and GLP-1 product variants only with exact product, strength, and device. Restrictions and quantity limits must remain visible.

### 3. Rheumatology and gastroenterology

Add specialty pharmacy products after a payer source is validated. Do not infer specialty coverage from a general PDL row.

## Data model changes needed for every specialty

- Add a therapeutic-area tag to each medication family.
- Store product, strength, dosage form, device, RxCUI, and NDC when available.
- Keep payer, plan, formulary year, source date, and source URL with every result.
- Preserve “listed,” “not listed,” and “unconfirmed” as separate states.
- Add a source-refresh timestamp and connector status to every specialty view.

## Connector sequence

1. Reuse current full-feed connectors for all therapeutic areas.
2. Add the clinic’s top plan families by measured volume.
3. Expand partial PDF extracts only after a current structured source or validated parser is available.
4. Keep Oscar last until the NJ clinic confirms demand.

## Product positioning

Start with “medication formulary lookup for NJ clinics” and describe pulmonary as the first specialty, not the product’s permanent boundary. The same engine can serve primary care and additional specialties without creating separate applications.
