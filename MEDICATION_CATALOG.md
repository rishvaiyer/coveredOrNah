# Pulmonary Medication Catalog

This is the expansion checklist for Formulary Finder. It prevents a drug from being omitted simply because it was not in the initial MVP list.

Status labels:

- `Live` - searchable in the dashboard.
- `Next` - add product, device/form, and official formulary evidence.
- `Review` - relevant only for selected pulmonary subspecialty workflows; validate with a pulmonary clinician before adding.

Every new item requires product-level details where applicable: brand/generic, strength, device, inhaler versus nebulizer, and official payer source. Do not treat this document as a prescribing guide.

## Live catalog - 76 medications

| Area | Live medications |
| --- | --- |
| Rescue inhalers | Albuterol HFA; albuterol nebulizer solution; levalbuterol |
| Long-acting bronchodilators | Arformoterol; formoterol; salmeterol |
| Anticholinergics | Ipratropium; tiotropium generic capsule-inhaler; Spiriva HandiHaler / Respimat; Incruse Ellipta |
| Combination and triple inhalers | Ipratropium/albuterol; Anoro Ellipta; tiotropium/olodaterol; Trelegy Ellipta; Breztri Aerosphere |
| COPD oral/nebulized therapy | Roflumilast; ensifentrine |
| Inhaled corticosteroids | Budesonide inhalation; fluticasone furoate (Arnuity Ellipta); fluticasone propionate HFA; QVAR RediHaler; ciclesonide; mometasone |
| ICS/LABA combinations | Advair Diskus/HFA; Symbicort; mometasone/formoterol; fluticasone/vilanterol |
| Leukotriene modifiers | Montelukast; zafirlukast; zileuton ER |
| Systemic steroids | Prednisone; prednisolone |
| Asthma biologics | Dupilumab; benralizumab; mepolizumab; tezepelumab; omalizumab |
| Interstitial lung disease | Nintedanib; pirfenidone |
| Pulmonary hypertension | Ambrisentan; bosentan; sildenafil; tadalafil; inhaled treprostinil; selexipag; riociguat; sotatercept-csrk |
| CF / inhaled anti-infectives | Tobramycin inhalation; aztreonam inhalation; dornase alfa; elexacaftor/tezacaftor/ivacaftor |
| Pulmonary clinic adjuncts | Nasal fluticasone; azelastine; cetirizine; smoking-cessation medicines; respiratory antibiotics; cough/mucus medicines; reflux medicines; epinephrine; furosemide; apixaban; selected common primary-care medicines |

## Next catalog additions

### COPD and asthma inhalers

- [ ] Aclidinium (Tudorza Pressair) - `Next`
- [ ] Revefenacin (Yupelri nebulizer) - `Next`
- [ ] Glycopyrrolate inhaler - `Next`
- [ ] Olodaterol (Striverdi Respimat) - `Next`
- [ ] Indacaterol (Arcapta Neohaler) - `Review`
- [ ] Glycopyrrolate/formoterol (Bevespi Aerosphere) - `Next`
- [ ] Aclidinium/formoterol (Duaklir Pressair) - `Review`
- [ ] Fluticasone/salmeterol generic and Wixela Inhub as distinct products - `Next`
- [ ] Budesonide/formoterol generic and Breyna as distinct products - `Next`
- [ ] Airsupra - `Next`
- [ ] Flunisolide inhalation - `Review`
- [ ] Pulmicort Flexhaler as a product distinct from budesonide nebulizer - `Next`

### Severe asthma and allergy

- [ ] Reslizumab (Cinqair) - `Next`
- [ ] Epinephrine nasal spray / other rescue-anaphylaxis products - `Review`

### Pulmonary hypertension

- [ ] Macitentan (Opsumit) - `Next`
- [ ] Macitentan/tadalafil (Opsynvi) - `Next`
- [ ] Oral treprostinil (Orenitram) - `Next`
- [ ] IV/subcutaneous treprostinil (Remodulin) - `Review`
- [ ] Epoprostenol products - `Review`
- [ ] Iloprost (Ventavis) - `Review`
- [ ] Inhaled treprostinil DPI as a product distinct from solution - `Next`

### Cystic fibrosis, bronchiectasis, and airway clearance

- [ ] Ivacaftor (Kalydeco) - `Next`
- [ ] Lumacaftor/ivacaftor (Orkambi) - `Next`
- [ ] Tezacaftor/ivacaftor (Symdeko) - `Next`
- [ ] Vanzacaftor/tezacaftor/deutivacaftor (Alyftrek) - `Next`
- [ ] Hypertonic saline inhalation - `Next`
- [ ] Acetylcysteine inhalation - `Next`
- [ ] Colistimethate inhalation - `Review`

### Interstitial lung disease and pulmonary vascular adjuncts

- [ ] Mycophenolate mofetil - `Review`
- [ ] Azathioprine - `Review`
- [ ] Rituximab - `Review`
- [ ] Inhaled nitric oxide products - `Review`

## Catalog workflow

1. Add the medication product and device details.
2. Record an official payer formulary source for each plan family.
3. Add exact Medicare RxNorm/RxCUI product matching where CMS data exists.
4. Add a PA form or official criteria link when published.
5. Mark any unsourced plan/product combination `Unconfirmed`, never `Not covered`.

## Current priority

1. Complete all `Next` inhaler entries.
2. Complete PAH product-level entries.
3. Complete CF and airway-clearance product-level entries.
4. Fill current commercial and exact Medicare plan coverage one source at a time.
