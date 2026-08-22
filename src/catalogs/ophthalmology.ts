import type { ClinicCatalog } from "./catalogTypes";

export const ophthalmologyCatalog: ClinicCatalog = {
  slug: "ophthalmology",
  name: "Ophthalmology Starter Catalog",
  specialty: "Ophthalmology",
  status: "starter",
  medications: [
    ["Latanoprost", "Xalatan, generic latanoprost", "Glaucoma", "Open-angle glaucoma and ocular hypertension", "0.005% ophthalmic solution; some versions are preserved with BAK while preservative-free singles differ."],
    ["Bimatoprost", "Lumigan", "Glaucoma", "Open-angle glaucoma and ocular hypertension", "0.01% drops are distinct from Latisse cosmetic formulation; bottle size must be matched."],
    ["Timolol maleate", "Timoptic, Istalol", "Glaucoma", "Open-angle glaucoma and ocular hypertension", "Drops only: 0.25% vs 0.5%, maleate vs hemihydrate, gel-forming solution, and preservative-free presentations all differ."],
    ["Dorzolamide/timolol", "Cosopt, generic dorzolamide-timolol", "Glaucoma", "Open-angle glaucoma inadequately controlled on monotherapy", "Fixed-combination drops; preserved Cosopt and preservative-free PF version are distinct products."],
    ["Brimonidine", "Alphagan P", "Glaucoma", "Open-angle glaucoma and ocular hypertension", "0.1%, 0.15%, and 0.2% strengths differ; Alphagan P uses purite preservative while generics may use BAK."],
    ["Netarsudil/latanoprost", "Rocklatan", "Glaucoma", "Open-angle glaucoma and ocular hypertension", "Fixed-combination 0.02%/0.005% drops; brand-only product with distinct PA handling versus its components."],
    ["Cyclosporine 0.05%", "Restasis, Restasis Multidose, generic cyclosporine emulsion", "Dry eye disease", "Keratoconjunctivitis sicca in dry eye disease", "Single-use vials, multidose bottle, and compounded generics differ; emulsion vehicle requires shaking."],
    ["Cyclosporine 0.09%", "Cequa", "Dry eye disease", "Keratoconjunctivitis sicca in dry eye disease", "0.09% water-based nanomicellar solution; not interchangeable with 0.05% Restasis emulsion."],
    ["Lifitegrast", "Xiidra", "Dry eye disease", "Signs and symptoms of dry eye disease", "5% ophthalmic solution; single-use containers and multidose bottles are distinct NDCs."],
    ["Loteprednol etabonate", "Lotemax gel, Lotemax suspension, Alrex", "Ocular inflammation", "Postoperative inflammation and steroid-responsive inflammatory conditions", "Gel and suspension vehicles are distinct products with different NDCs; 0.5% gel versus suspension matters for coverage."],
    ["Moxifloxacin", "Vigamox, Moxeza", "Anti-infectives", "Bacterial conjunctivitis", "0.5% ophthalmic solution; preserved Vigamox and preservative-free Moxeza vehicles differ from older preserved generics."],
    ["Erythromycin ointment", "Ilotycin, generic erythromycin", "Anti-infectives", "Bacterial conjunctivitis and neonatal prophylaxis", "0.5% ophthalmic ointment; tube size is the only real variant but exact product is required on claims."],
    ["Prednisolone acetate", "Pred Forte, Omnipred", "Ocular inflammation", "Steroid-responsive inflammation of the palpebral and bulbar conjunctiva", "1% acetate suspension must be shaken; acetate 1% differs from sodium phosphate variants in strength and availability."],
    ["Ketorolac", "Acular LS, Acuvail", "NSAID", "Postoperative ocular inflammation and seasonal allergic conjunctivitis", "Acuvail is 0.45 percent preservative-free; Acular LS is 0.4 percent; original Acular was 0.5 percent; preserved versus preservative-free units matter."],
    ["Faricimab", "Vabysmo", "Retina medical benefit", "Neovascular AMD, diabetic macular edema, and diabetic retinopathy", "Intravitreal injection billed under the medical benefit via buy-and-bill; vial versus prefilled syringe presentation affects billing."],
    ["Ranibizumab", "Lucentis, Byooviz, Cimerli", "Retina medical benefit", "Neovascular AMD, diabetic macular edema, and retinal vein occlusion", "Intravitreal injection contrast row: biosimilar entrants (Byooviz, Cimerli) create preferred-product churn on the medical benefit."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
