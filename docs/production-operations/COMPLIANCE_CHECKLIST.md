# Compliance Checklist

## Compliance Owner

| Field | Value |
|---|---|
| Internal compliance owner | *(assign before live freight activity)* |
| Owner email | |
| Date assigned | |

The compliance owner is responsible for confirming, maintaining, and updating all regulatory requirements below. No live freight brokerage activity may begin until this owner is assigned and all requirements are validated.

---

## Official Legal Business Record

**Source record:** IRS CP575G notice dated March 21, 2026.

**Legal business name:** INFAMOUS FREIGHT

**IRS name control:** INFA

Use [`LEGAL_BUSINESS_RECORD_UPDATE.md`](./LEGAL_BUSINESS_RECORD_UPDATE.md) to align Stripe, banking, DOT/FMCSA, insurance, accounting, and tax records. Do not commit the full EIN, bank details, tax documents, or processor credentials to this repository.

**Validation checklist:**
- [ ] Stripe legal/tax business profile updated to INFAMOUS FREIGHT
- [ ] Business bank account opened or updated under INFAMOUS FREIGHT
- [ ] DOT/FMCSA filings use INFAMOUS FREIGHT
- [ ] Insurance policy documents and certificates use INFAMOUS FREIGHT
- [ ] Accounting software company profile uses INFAMOUS FREIGHT
- [ ] Federal, state, and local tax filings use INFAMOUS FREIGHT and IRS name control INFA where required
- [ ] Non-sensitive completion evidence recorded in `PRODUCTION_READINESS_EVIDENCE.md`

---

## FMCSA Broker Authority

**Requirement:** A freight broker must hold active FMCSA Property Broker Authority (Form OP-1) before arranging the transportation of freight for compensation.

**Filing:** Submit Form OP-1 to the FMCSA. The filing fee is $300 (non-refundable). Processing typically takes 4–8 weeks after the protest period.

**Protest period:** After filing, there is a 10-day protest period during which existing licensees may object.

**Active status check:** Verify active status at https://safer.fmcsa.dot.gov using the MC number.

**Validation checklist:**
- [ ] FMCSA OP-1 application submitted
- [ ] MC number received
- [ ] Protest period elapsed with no objection
- [ ] Authority status confirmed as **Active** on FMCSA SAFER system
- [ ] MC number documented in `PRODUCTION_READINESS_EVIDENCE.md`
- [ ] Compliance owner has verified active status

---

## BOC-3 Process Agent Filing

**Requirement:** All FMCSA-licensed brokers must file a BOC-3 (Designation of Process Agent) before authority is activated. This designates a legal agent in each U.S. state to receive service of process on behalf of the company.

**Filing:** BOC-3 must be filed electronically through a blanket BOC-3 service provider (not filed directly with FMCSA by most brokers). The provider files on behalf of the broker and covers all 50 states and Washington D.C.

**Cost:** Blanket BOC-3 filing services typically cost $20–$50 (one-time or annual, depending on provider).

**Validation checklist:**
- [ ] BOC-3 service provider selected
- [ ] BOC-3 blanket filing submitted
- [ ] BOC-3 confirmation received from provider
- [ ] Filing reflected in FMCSA records (verify via SAFER or FMCSA portal)
- [ ] BOC-3 confirmation documented in `PRODUCTION_READINESS_EVIDENCE.md`
- [ ] Compliance owner has verified filing status

---

## BMC-84 Surety Bond or BMC-85 Trust Fund

**Requirement:** All FMCSA-licensed brokers must maintain a minimum $75,000 surety bond (BMC-84) or a $75,000 trust fund agreement (BMC-85) on file with the FMCSA. This protects shippers and carriers from broker non-payment.

### BMC-84 — Surety Bond

- Issued by a licensed surety company on behalf of the broker.
- Annual premium is typically 1–5% of the $75,000 bond amount (varies by credit).
- Bond must remain continuously active. A lapse cancels broker authority.
- Surety company files BMC-84 directly with the FMCSA.

### BMC-85 — Trust Fund Agreement

- An alternative to the surety bond.
- The broker deposits $75,000 into a trust account with an FMCSA-approved financial institution.
- The financial institution files BMC-85 directly with the FMCSA.
- The full $75,000 must be maintained at all times.

**Validation checklist:**
- [ ] BMC-84 or BMC-85 option selected
- [ ] Provider or financial institution identified
- [ ] Bond or trust agreement executed
- [ ] BMC-84 or BMC-85 filing confirmed with FMCSA (verify via SAFER or FMCSA portal)
- [ ] Expiration or renewal date logged (BMC-84 annual renewal required)
- [ ] Bond or trust details documented in `PRODUCTION_READINESS_EVIDENCE.md`
- [ ] Compliance owner has verified active filing

---

## Required Before Brokering Freight

- [ ] Business entity formed (LLC or corporation)
- [ ] EIN received from IRS
- [ ] External accounts aligned to official legal business name
- [ ] FMCSA broker authority — Active (see above)
- [ ] BOC-3 filed and confirmed (see above)
- [ ] BMC-84 surety bond or BMC-85 trust — Active (see above)
- [ ] Shipper agreement prepared and reviewed
- [ ] Broker-carrier agreement prepared and reviewed
- [ ] W-9 on file
- [ ] Business bank account opened
- [ ] Accounting system configured
- [ ] Document retention process defined
- [ ] Internal compliance owner assigned (see top of this file)

## Do Not Dispatch Until

- [ ] Authority is confirmed Active on FMCSA SAFER
- [ ] BOC-3 filing is confirmed
- [ ] BMC-84 bond or BMC-85 trust is confirmed Active
- [ ] Carrier agreement is signed
- [ ] Carrier W-9 is received
- [ ] Carrier insurance certificate is on file and valid
- [ ] Rate confirmation is signed
- [ ] Driver and dispatcher contacts are verified

---

## Change Management

If any regulatory requirement changes (new bond minimum, new filing process, authority lapse, or bond cancellation):

- [ ] Update this checklist immediately.
- [ ] Update `PRODUCTION_READINESS_EVIDENCE.md` with new status.
- [ ] Update `LAUNCH_CHECKLIST.md` if the change affects launch gate criteria.
- [ ] Notify the compliance owner and document the change with a date.
- [ ] Do not resume brokerage activity until the updated requirement is re-validated.
