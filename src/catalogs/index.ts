import type { ClinicCatalog } from "./catalogTypes";
import { familyMedicineCatalog } from "./familyMedicine";
import { dermatologyCatalog } from "./dermatology";
import { allergyImmunologyCatalog } from "./allergyImmunology";
import { cardiologyCatalog } from "./cardiology";
import { gastroenterologyCatalog } from "./gastroenterology";
import { endocrinologyCatalog } from "./endocrinology";
import { infectiousDiseaseCatalog } from "./infectiousDisease";
import { nephrologyCatalog } from "./nephrology";
import { neurologyCatalog } from "./neurology";
import { ophthalmologyCatalog } from "./ophthalmology";
import { oralOncologyCatalog } from "./oralOncology";
import { painManagementCatalog } from "./painManagement";
import { rheumatologyCatalog } from "./rheumatology";
import { urologyCatalog } from "./urology";
import { womensHealthCatalog } from "./womensHealth";
import { behavioralHealthCatalog } from "./behavioralHealth";

export const clinicCatalogs: ClinicCatalog[] = [
  familyMedicineCatalog,
  dermatologyCatalog,
  allergyImmunologyCatalog,
  cardiologyCatalog,
  gastroenterologyCatalog,
  endocrinologyCatalog,
  infectiousDiseaseCatalog,
  nephrologyCatalog,
  neurologyCatalog,
  ophthalmologyCatalog,
  oralOncologyCatalog,
  painManagementCatalog,
  rheumatologyCatalog,
  urologyCatalog,
  womensHealthCatalog,
  behavioralHealthCatalog,
];

export const getClinicCatalog = (slug: string) =>
  clinicCatalogs.find((catalog) => catalog.slug === slug) ?? null;
