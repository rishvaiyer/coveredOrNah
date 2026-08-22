# Clinic catalog expansion

Clinic catalogs are intentionally separate from payer plans:

- `src/catalogs/catalogTypes.ts` defines the reusable catalog contract.
- `src/catalogs/familyMedicine.ts` is the first starter catalog.
- `src/catalogs/index.ts` is the single registration point for future specialties.
- `GET /api/catalogs` lists available catalogs.
- `GET /api/catalogs/:slug/medications` returns a catalog's PHI-free medication intake list.

To add another specialty, add one catalog module, register it in `src/catalogs/index.ts`, add official source mappings through the existing formulary pipeline, and add a live smoke case. The starter catalog is intentionally labeled `starter` until its plan-specific source rows are verified.
