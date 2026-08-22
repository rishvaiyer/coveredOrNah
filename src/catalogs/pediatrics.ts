import type { ClinicCatalog } from "./catalogTypes";

export const pediatricsCatalog: ClinicCatalog = {
  slug: "pediatrics",
  name: "Pediatrics Starter Catalog",
  specialty: "Pediatrics",
  status: "starter",
  medications: [
    ["Amoxicillin", "Amoxil, Moxatag", "Anti-infectives", "Acute otitis media, strep pharyngitis, and common pediatric bacterial infections", "High-dose otitis-media dosing relies on the oral suspension; 400 mg/5 mL vs 250 mg/5 mL strengths must be matched."],
    ["Cefdinir", "Omnicef", "Anti-infectives", "Otitis media, sinusitis, and skin infections", "Oral suspension and capsules differ; suspension strengths are 125 mg/5 mL and 250 mg/5 mL."],
    ["Azithromycin", "Zithromax", "Anti-infectives", "Respiratory and selected bacterial infections", "Oral suspension, packets, and tablets differ; pediatric use is suspension or packet products by weight band."],
    ["Oseltamivir", "Tamiflu", "Antivirals", "Influenza treatment and prophylaxis", "Oral suspension must be reconstituted correctly; 6 mg/mL concentration drives weight-band dosing; capsule use is limited to older children."],
    ["Albuterol nebulized", "AccuNeb, generic unit-dose vials", "Respiratory", "Asthma and reactive airway rescue", "Nebulized unit-dose vials come in 0.63 mg, 1.25 mg, and 2.5 mg pediatric strengths; each strength is a distinct product."],
    ["Budesonide nebulized", "Pulmicort Respules", "Respiratory", "Maintenance asthma control in young children", "Nebulized suspension ampules are 0.25 mg/2 mL and 0.5 mg/2 mL; device and ampule strength must be matched."],
    ["Montelukast", "Singulair", "Respiratory", "Asthma maintenance and allergic rhinitis", "Oral granule packets (4 mg), chewable tablets (4 mg and 5 mg), and adult tablets are distinct age-band products."],
    ["Cetirizine", "Zyrtec", "Allergy", "Allergic rhinitis and chronic urticaria", "Oral solution and syrup forms plus 5 mg and 10 mg chewables differ; one drug family with multiple pediatric dosage forms to match."],
    ["Loratadine", "Claritin", "Allergy", "Allergic rhinitis", "Syrup and chewable-tablet products are distinct from adult tablets; strength differs across the pediatric forms."],
    ["Lisdexamfetamine", "Vyvanse", "ADHD", "ADHD in patients six years and older", "Capsules and chewable tablets are distinct products; capsule contents can be mixed but strengths do not map one-to-one to chewables."],
    ["Methylphenidate extended-release (Concerta)", "Concerta", "ADHD", "ADHD", "Osmotic-release 18 mg, 27 mg, 36 mg, and 54 mg tablets are product-specific; generic osmotic and non-osmotic ER versions are not interchangeable."],
    ["Methylphenidate extended-release (Ritalin LA)", "Ritalin LA", "ADHD", "ADHD", "Capsule ER with 50/50 biphasic release is a distinct product line from Concerta tablets; capsule strengths and sprinkle handling matter."],
    ["Guanfacine extended-release", "Intuniv", "ADHD", "ADHD adjunct or monotherapy in children six and older", "Extended-release tablets only; immediate-release guanfacine and ER strengths are not interchangeable; tablet cannot be crushed."],
    ["Atomoxetine", "Strattera", "ADHD", "ADHD in children six and older", "Capsule strengths differ; an oral solution product exists as a distinct form; non-stimulant alternative when stimulants are not used."],
    ["Polyethylene glycol 3350", "Miralax", "Gastrointestinal", "Functional constipation in children", "Powder for oral solution; bottle size and flavorless vs flavored powder variants must be matched; dosing is off-label by weight."],
    ["Cholecalciferol infant drops", "D-Vi-Sol, Baby Ddrops", "Nutrition", "Infant vitamin D supplementation for breastfed infants", "Drop concentration units per drop vary by brand; product-specific dropper calibration must be matched."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
