import type { ClinicCatalog } from "./catalogTypes";

export const otolaryngologyCatalog: ClinicCatalog = {
  slug: "otolaryngology",
  name: "Otolaryngology Starter Catalog",
  specialty: "Otolaryngology (ENT)",
  status: "starter",
  medications: [
    ["Fluticasone propionate nasal", "Flonase, Flonase Sensimist", "Allergic rhinitis", "Seasonal and perennial allergic rhinitis", "OTC and Rx spray strengths differ; Sensimist is a different vehicle."],
    ["Mometasone nasal", "Nasonex", "Allergic rhinitis and nasal polyps", "Allergic rhinitis and nasal polyp maintenance", "Suspension spray vehicle; pediatric age bands differ by indication."],
    ["Budesonide respiratory sinus inhalation suspension", "Pulmicort Flexhaler, Respules", "Sinus inflammation", "Asthma plus off-label nebulized sinus therapy", "Nebulized suspension, dry-powder inhaler, and nasal pump products are distinct vehicles."],
    ["Azelastine nasal", "Astelin, Astepro", "Allergic rhinitis", "Allergic and vasomotor rhinitis", "Spray concentration differs by brand; bitter taste counseling applies."],
    ["Olopatadine nasal", "Patanase", "Allergic rhinitis", "Seasonal allergic rhinitis", "Age-band labeling differs between adult and pediatric presentations."],
    ["Ipratropium nasal", "Atrovent nasal", "Rhinorrhea", "Common-cold and vasomotor rhinorrhea", "0.03% and 0.06% are distinct strengths tied to age band and indication."],
    ["Pseudoephedrine", "Sudafed", "Congestion", "Nasal congestion from rhinitis or sinusitis", "Behind-counter immediate-release and extended-release products differ; framing stays neutral."],
    ["Phenylephrine oral", "Sudafed PE", "Congestion", "Oral decongestant use", "Oral effectiveness is label-questioned per current FDA review framing; topical forms differ."],
    ["Oxymetazoline nasal spray", "Afrin", "Congestion", "Short-term nasal congestion relief", "Rebound-congestion limitation limits continuous use days on the label."],
    ["Ciclesonide nasal", "Omnaris, Zetonna", "Allergic rhinitis", "Allergic rhinitis", "Omnaris suspension and Zetonna aerosol are distinct products with different ages."],
    ["Beclomethasone nasal", "Qnasl", "Allergic rhinitis", "Seasonal and perennial allergic rhinitis", "Qnasl aerosol differs from older aqueous beclomethasone suspensions."],
    ["Ofloxacin otic", "Floxin otic", "Otic anti-infective", "Otitis externa and selected middle-ear infections with tubes", "Solution vehicle; perforated-tympanum and tube age bands differ from other drops."],
    ["Ciprofloxacin-dexamethasone otic", "Ciprodex", "Otic anti-infective combination", "Otitis externa and acute otitis media with tubes", "Suspension vehicle with steroid component; dosing frequency differs from ofloxacin."],
    ["Acetic acid otic", "VoSoL, acetic acid 2%", "Otic acidifier", "Superficial otitis externa and swimmer's ear prevention", "Solution and drops differ; not for perforated tympanic membrane."],
    ["Amoxicillin", "Amoxil", "Anti-infective", "First-line acute otitis media", "High-dose AOM regimens depend on suspension concentration; 250/5 and 400/5 differ."],
    ["Clindamycin oral", "Cleocin", "Anti-infective", "Penicillin-allergy coverage for ENT infections", "Capsule and suspension products differ; taste limits suspension adherence."]
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
