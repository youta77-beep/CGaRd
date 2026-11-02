# CGaRd

**Evidence behind every cosmetic label claim.**

[Open the app (Google AI Studio)](https://aistudio.google.com/apps/28b6982d-1874-4413-86af-c6fe15a8aa11)

## What it does

A shampoo says "anti-dandruff". It doesn't work. The active ingredient is supposed to work, so why didn't the product? The rules are public; the evidence for a specific product isn't.

CGaRd takes the exact words printed on a cosmetic product, such as *"Befreit von Schuppen & verhindert die Neubildung"*, and shows what stands behind them in five fixed sections:

1. **Regulatory basis**: what the law says about this claim, by jurisdiction
2. **Clinical data for this product**: trials run on this product itself
3. **Notified actives with established evidence**: what is known about its active ingredients
4. **Permissible claim language**: what wording is allowed
5. **Claim history**: when the claim appeared, changed or was challenged

Every line links to a public source. Anything not yet checked is labelled *under review*. CGaRd reports evidence; it never calls a brand a liar.

## Why the sentence, not the category

A category claim like "anti-dandruff" is hard to challenge. A specific sentence on a specific bottle is not. "Strengthens hair & soothes scalp" puts two different product functions on one label, and that is a question worth asking. CGaRd is organised around those exact sentences, transcribed from the pack.

## Who it is for

People who already ask this question for a living: lawyers who handle misleading-label cases, and consultants who advise brands on what they can claim.

## Current scope

Ten anti-dandruff shampoos sold in Europe (Alpecin, Ducray, Eucerin, Head & Shoulders, Kérastase, L'Oréal Elvive, NIVEA MEN, Schwarzkopf Professional, The Body Shop, Vichy) and their on-pack claims. Each claim is transcribed verbatim from the brand's official pack image, in the pack's language, with an English line below it. Product photos and ingredient lists come from the brands' own websites.

## Team

- **[Insung](https://github.com/insung-hw)**: data layer. Every product card reads live from a Google Sheet, so a product is added with rows, not code.
- **[Yousuf](https://github.com/youta77-beep)**: app and customer discovery.

## For developers

**Stack:** React 19, TypeScript, Vite, Tailwind, a small Express server. Built in Google AI Studio with the Gemini API.

**Data: Google Sheets.** Public pages read the CGaRd Google Sheet at runtime; product data is not stored in the code.

- Sheet ID `1QKGBJxDB_GngxSDz7-VjxHwX3Cf0W47khLTrsWepFow` (default in `src/data/publicSheets.ts`; override with `VITE_CGARD_SPREADSHEET_ID`). Sharing must be "Anyone with the link: Viewer". Everything in the sheet is public, including notes.
- Flow: `publicSheets.ts` (fetch + validate tabs) → `sheetCards.ts` (products, five-section cards) → `SheetShowcase` / `SheetClaimCard` / `SheetSourcesView`. Legacy registry views get product name, volume, actives and photo from the same sheet through `useSheetProducts()` (`src/data/sheetProductsContext.tsx`).
- `Claims.claim_text` is the verbatim on-pack text; for non-English packs it is `original` + line break + `(English)`.
- `Products.image_url` holds an https URL of the brand's official product image.
- A section shows as Verified only when CardReview marks it PUBLISHED and all its sources are VERIFIED. Otherwise it shows "Draft · under review". `notes` columns are for editors and are not rendered.
- After editing the sheet, press Refresh in the app; no redeploy is needed. If the sheet cannot be read or fails validation (missing tab or header, duplicate ID, broken reference), the app shows the error instead of old data.

**Run locally**

```
npm install --legacy-peer-deps   # plain npm install fails on a peer-dependency conflict
npm run dev     # http://localhost:3000
npm test
npm run lint    # tsc --noEmit
```
