import type { ClinicCatalog } from "./catalogTypes";

export const rheumatologyCatalog: ClinicCatalog = {
  slug: "rheumatology",
  name: "Rheumatology Starter Catalog",
  specialty: "Rheumatology",
  status: "starter",
  medications: [
    ["Methotrexate", "Trexall, Otrexup, Rasuvo", "conventional DMARD", "Rheumatoid arthritis and other inflammatory arthritides", "Oral tablets differ from autoinjector and vial products; weekly dosing strength must be matched."],
    ["Sulfasalazine", "Azulfidine", "conventional DMARD", "Rheumatoid arthritis", "Enteric-coated tablets differ from plain tablets; EN-tagged indication products are distinct."],
    ["Hydroxychloroquine", "Plaquenil", "antimalarial DMARD", "Rheumatoid arthritis and lupus", "Oral tablet strengths must be matched; lupus versus RA labeling affects coverage."],
    ["Leflunomide", "Arava", "conventional DMARD", "Rheumatoid arthritis and psoriatic arthritis", "Oral tablet strengths differ; loading-dose protocols do not change product identity."],
    ["Adalimumab biosimilars", "Hadlima, Hyrimoz, Amjevita; brand Humira", "TNF biologic", "Rheumatoid arthritis, psoriatic arthritis, and ankylosing spondylitis", "Biosimilar interchangeability, citrate-free versus standard presentations, and device type all matter."],
    ["Etanercept", "Enbrel, Erelzi, Eticovo", "TNF biologic", "Rheumatoid arthritis, psoriatic arthritis, and ankylosing spondylitis", "Prefilled syringe, SureClick autoinjector, and on-body enbrel mini devices are distinct products."],
    ["Infliximab IV", "Remicade, Inflectra, Avsola", "TNF biologic infusion", "Rheumatoid arthritis with methotrexate and ankylosing spondylitis", "Medical-benefit buy-and-bill contrast row; infusion-site billing differs from pharmacy benefit and biosimilar choice is plan directed."],
    ["Abatacept", "Orencia", "T-cell costimulation blocker", "Rheumatoid arthritis and psoriatic arthritis", "Orencia SC prefilled pen or syringe is a distinct product from Orencia IV infusion; SC and IV are not interchangeable at the claim level."],
    ["Tocilizumab", "Actemra, Tofidence, Tyenne", "IL-6 receptor biologic", "Rheumatoid arthritis and giant cell arteritis", "Actemra SC pen or syringe versus IV formulation differ; biosimilar entry makes preferred-product matching required."],
    ["Sarilumab", "Kevzara", "IL-6 receptor biologic", "Rheumatoid arthritis", "Prefilled pen versus syringe devices are distinct; RA-only labeled indication affects PA criteria."],
    ["Guselkumab", "Tremfya", "IL-23 biologic", "Psoriatic arthritis and plaque psoriasis", "One-patient-use prefilled pen device; PsA versus psoriasis indication split drives PA documentation."],
    ["Secukinumab", "Cosentyx", "IL-17A biologic", "Psoriatic arthritis, ankylosing spondylitis, and plaque psoriasis", "Sensoready pen, prefilled syringe, and on-body injector differ; AS versus PsA versus skin indication splits affect step therapy."],
    ["Ixekizumab", "Taltz", "IL-17A biologic", "Psoriatic arthritis, ankylosing spondylitis, and plaque psoriasis", "Autoinjector versus prefilled syringe devices are distinct; RA is not a labeled indication."],
    ["Upadacitinib", "Rinvoq", "oral JAK inhibitor", "Rheumatoid arthritis and psoriatic arthritis", "Extended-release tablets only; extended-release 15 mg indication split between RA and PsA matters for PA review."],
    ["Tofacitinib", "Xeljanz, Xeljanz XR", "oral JAK inhibitor", "Rheumatoid arthritis, psoriatic arthritis, and ankylosing spondylitis", "Immediate-release tablets versus XR tablets are distinct; boxed-warning criteria shape prior authorization."],
    ["Baricitinib", "Olumiant", "oral JAK inhibitor", "Rheumatoid arthritis", "Oral tablets; RA-labeled only so PsA or AS requests fall outside label."],
    ["Apremilast", "Otezla", "oral PDE4 inhibitor", "Psoriatic arthritis and plaque psoriasis", "Starter-dose blister titration packs versus maintenance bottles are distinct products; PsA not RA indication."],
    ["Prednisone", "Deltasone, Rayos", "systemic corticosteroid", "Rheumatoid arthritis flares and bridging therapy", "Immediate-release tablets, delayed-release Rayos, and dose packs differ."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
