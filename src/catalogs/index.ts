import { familyMedicineCatalog } from "./familyMedicine";
import type { ClinicCatalog } from "./catalogTypes";

export const clinicCatalogs: ClinicCatalog[] = [familyMedicineCatalog];

export const getClinicCatalog = (slug: string) =>
  clinicCatalogs.find((catalog) => catalog.slug === slug) ?? null;
