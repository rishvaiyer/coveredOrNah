import { familyMedicineCatalog } from "./familyMedicine";
import { dermatologyCatalog } from "./dermatology";
import { allergyImmunologyCatalog } from "./allergyImmunology";
import { cardiologyCatalog } from "./cardiology";
import { gastroenterologyCatalog } from "./gastroenterology";
import { endocrinologyCatalog } from "./endocrinology";
import type { ClinicCatalog } from "./catalogTypes";

export const clinicCatalogs: ClinicCatalog[] = [
  familyMedicineCatalog,
  dermatologyCatalog,
  allergyImmunologyCatalog,
  cardiologyCatalog,
  gastroenterologyCatalog,
  endocrinologyCatalog,
];

export const getClinicCatalog = (slug: string) =>
  clinicCatalogs.find((catalog) => catalog.slug === slug) ?? null;
