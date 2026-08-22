import { familyMedicineCatalog } from "./familyMedicine";
import { dermatologyCatalog } from "./dermatology";
import type { ClinicCatalog } from "./catalogTypes";

export const clinicCatalogs: ClinicCatalog[] = [familyMedicineCatalog, dermatologyCatalog];

export const getClinicCatalog = (slug: string) =>
  clinicCatalogs.find((catalog) => catalog.slug === slug) ?? null;
