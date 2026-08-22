import type { ClinicCatalog } from "./catalogTypes";
import { addictionMedicineCatalog } from "./addictionMedicine";
import { allergyImmunologyCatalog } from "./allergyImmunology";
import { anticoagulationCatalog } from "./anticoagulation";
import { behavioralHealthCatalog } from "./behavioralHealth";
import { benignHematologyCatalog } from "./benignHematology";
import { boneHealthCatalog } from "./boneHealth";
import { cardiologyCatalog } from "./cardiology";
import { cysticFibrosisCatalog } from "./cysticFibrosis";
import { dermatologyCatalog } from "./dermatology";
import { endocrinologyCatalog } from "./endocrinology";
import { familyMedicineCatalog } from "./familyMedicine";
import { fertilityCatalog } from "./fertility";
import { gastroenterologyCatalog } from "./gastroenterology";
import { geriatricsCatalog } from "./geriatrics";
import { hivPrepCatalog } from "./hivPrep";
import { infectiousDiseaseCatalog } from "./infectiousDisease";
import { medicalWeightManagementCatalog } from "./medicalWeightManagement";
import { multipleSclerosisCatalog } from "./multipleSclerosis";
import { nephrologyCatalog } from "./nephrology";
import { neurologyCatalog } from "./neurology";
import { ophthalmologyCatalog } from "./ophthalmology";
import { oralOncologyCatalog } from "./oralOncology";
import { otolaryngologyCatalog } from "./otolaryngology";
import { painManagementCatalog } from "./painManagement";
import { palliativeCareCatalog } from "./palliativeCare";
import { pediatricsCatalog } from "./pediatrics";
import { pmrCatalog } from "./pmr";
import { postAcuteLtcCatalog } from "./postAcuteLtc";
import { rheumatologyCatalog } from "./rheumatology";
import { sickleCellCatalog } from "./sickleCell";
import { sleepMedicineCatalog } from "./sleepMedicine";
import { sportsMedicineCatalog } from "./sportsMedicine";
import { transplantCatalog } from "./transplant";
import { urologyCatalog } from "./urology";
import { womensHealthCatalog } from "./womensHealth";
import { woundCareCatalog } from "./woundCare";

export const clinicCatalogs: ClinicCatalog[] = [
  addictionMedicineCatalog,
  allergyImmunologyCatalog,
  anticoagulationCatalog,
  behavioralHealthCatalog,
  benignHematologyCatalog,
  boneHealthCatalog,
  cardiologyCatalog,
  cysticFibrosisCatalog,
  dermatologyCatalog,
  endocrinologyCatalog,
  familyMedicineCatalog,
  fertilityCatalog,
  gastroenterologyCatalog,
  geriatricsCatalog,
  hivPrepCatalog,
  infectiousDiseaseCatalog,
  medicalWeightManagementCatalog,
  multipleSclerosisCatalog,
  nephrologyCatalog,
  neurologyCatalog,
  ophthalmologyCatalog,
  oralOncologyCatalog,
  otolaryngologyCatalog,
  painManagementCatalog,
  palliativeCareCatalog,
  pediatricsCatalog,
  pmrCatalog,
  postAcuteLtcCatalog,
  rheumatologyCatalog,
  sickleCellCatalog,
  sleepMedicineCatalog,
  sportsMedicineCatalog,
  transplantCatalog,
  urologyCatalog,
  womensHealthCatalog,
  woundCareCatalog,
];

export const getClinicCatalog = (slug: string) =>
  clinicCatalogs.find((catalog) => catalog.slug === slug) ?? null;
