export type CatalogMedication = {
  generic: string;
  brands: string;
  category: string;
  commonUses: string;
  productDetails: string;
};

export type ClinicCatalog = {
  slug: string;
  name: string;
  specialty: string;
  status: "starter" | "production";
  medications: CatalogMedication[];
};
