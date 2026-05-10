# Legal Business Record Update

Use this runbook to align external accounts and compliance records with the official IRS business record before production payments, banking, or freight brokerage activity.

## Official Record

| Field | Value |
|---|---|
| Legal business name | INFAMOUS FREIGHT |
| IRS name control | INFA |
| IRS notice type | CP575G |
| Notice date | March 21, 2026 |
| Business address | 1134 W Chestnut Rd, Washington, OK 73093 |
| EIN handling | Keep the full EIN only in secure tax, banking, payment processor, and compliance systems. Do not commit the full EIN to this repository. |

The app-level source of truth for the legal name is `apps/web/src/lib/brand.ts`. Public marketing copy can continue using `Infamous Freight`, but legal, tax, banking, payment processor, insurance, and FMCSA surfaces should use `INFAMOUS FREIGHT`.

## Required Account Updates

### Stripe

- [ ] Confirm the active Stripe account is the production account for INFAMOUS FREIGHT.
- [ ] Update the Stripe tax and legal business profile to `INFAMOUS FREIGHT`.
- [ ] Confirm the business address matches the IRS notice.
- [ ] Confirm the business tax ID/EIN is entered only in Stripe Dashboard, not in source code or documentation.
- [ ] Confirm support, statement descriptor, invoice, and receipt details are still customer-appropriate after the legal-name update.
- [ ] Record non-sensitive completion evidence in `PRODUCTION_READINESS_EVIDENCE.md`.

### Bank Account

- [ ] Open or update the business bank account under `INFAMOUS FREIGHT`.
- [ ] Confirm the bank has the CP575 notice or equivalent EIN confirmation on file.
- [ ] Confirm account ownership details match the payment processor and accounting system records.
- [ ] Store bank documents in the secure business records vault, not in the repository.
- [ ] Record non-sensitive completion evidence in `PRODUCTION_READINESS_EVIDENCE.md`.

### DOT/FMCSA Records

- [ ] Use `INFAMOUS FREIGHT` on FMCSA registration, OP-1 broker authority, BOC-3, and BMC-84/BMC-85 records.
- [ ] Confirm the business address matches the IRS notice or document any approved mailing/physical address differences.
- [ ] Confirm the MC number and authority status after submission.
- [ ] Record the MC number, status, and verification date in `PRODUCTION_READINESS_EVIDENCE.md`.

### Insurance

- [ ] Update broker, general liability, cargo, and any other business insurance policy documents to `INFAMOUS FREIGHT`.
- [ ] Confirm certificates of insurance use the correct legal name and business address.
- [ ] Confirm any certificate-holder language used for carrier vetting remains accurate.
- [ ] Store policy documents and certificates in the secure insurance records vault, not in the repository.
- [ ] Record non-sensitive completion evidence in `PRODUCTION_READINESS_EVIDENCE.md`.

### Accounting Software

- [ ] Update the company profile to `INFAMOUS FREIGHT`.
- [ ] Enter the full EIN only inside the accounting system's secure tax settings.
- [ ] Confirm invoice, W-9, vendor, customer, and sales tax profile details use the official legal name.
- [ ] Confirm Stripe and bank feeds map to the same legal entity.
- [ ] Record non-sensitive completion evidence in `PRODUCTION_READINESS_EVIDENCE.md`.

### Tax Filings

- [ ] Use `INFAMOUS FREIGHT` and the official IRS name control `INFA` on federal tax filings.
- [ ] Prepare a W-9 using the official legal name and secure EIN handling.
- [ ] Confirm state and local registrations, if required, match the federal record.
- [ ] Store tax forms and filings in the secure tax records vault, not in the repository.
- [ ] Record non-sensitive completion evidence in `PRODUCTION_READINESS_EVIDENCE.md`.

## Evidence Rules

Do record completion status, responsible owner, verification date, system name, and non-sensitive confirmation notes.

Do not record full EINs, bank account numbers, routing numbers, tax document images, payment processor secrets, private insurance policy numbers, or credentials in this repository.
