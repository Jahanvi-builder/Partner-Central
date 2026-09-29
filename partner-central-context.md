# Partner Central — Product Context (Observable Data and Work Queues)

This document adds to “Partner Central — Mental Models & JTBD” and the MVP wireframes. Where this document and earlier wireframes or concept proposals disagree, **this document wins**.

## 1. Source-of-truth rule

Partner Central must only present facts Pine can reliably observe.

- A payment event proves the state of a payment attempt; it does not prove fulfilment, installation, activation, payout, or settlement.
- Instant access may be stated only when the offer is explicitly configured as **Instant access after payment** and payment succeeds.
- For **Partner-managed fulfilment**, Partner Central stops after confirming payment and sharing purchase details with the partner. Later progress happens outside Partner Central.
- Refunds appear only after the payment system confirms the refund event.
- Partner settlement is manual and is never displayed.
- Linked-bundle application and payment records are related but remain separate. Partner Central must not infer that the device was delivered or that the bundle is complete.

Any settlement hold/release, activation callback, or downstream status write-back described in the Direct Buy concept note is a possible future operating model, not a current product capability.

## 2. Offer types

| Type | Merchant CTA | What Pine can observe | What happens outside Partner Central |
|---|---|---|---|
| **Lead generation** | I’m interested | Form submission, consent, and partner-managed lead updates | Partner follow-up and service delivery |
| **Financial application** | Apply to [Regulated entity] | Application submission and integration-fed application states | KYC, underwriting, decisioning, and servicing by the regulated entity |
| **Direct Buy** | Buy now · ₹X | Payment attempts, successful payments, purchase-detail sharing, and confirmed refunds | Partner-managed fulfilment and any later activation, except instant access configured at purchase |
| **Linked bundle** | Reserve device + Apply | The application record and any payment attempt as separately observable records | Device fulfilment and any combined bundle outcome |

Coupon remains removed from the product.

## 3. Partner navigation and records

All partners use the same capability-based navigation so one account can run any combination of campaigns:

**Overview · Offers · Engagements · Orders · Revenue · Reports**

### Engagements

Engagements combines non-payment commitments and has **All · Leads · Applications** tabs.

| Record | ID | Owner of state | Notes |
|---|---|---|---|
| Lead | `LEAD-YYYY-NNNN` | Partner | Partner can mark Contacted, Converted, or Lost when consent permits contact |
| Application | `APP-YYYY-NNNN` | Bank/integration | Read-only in Partner Central |

### Orders

Orders is the Direct Buy payment-activity workspace. Every checkout attempt receives `PAY-YYYY-NNNN`. A successful purchase may additionally receive `ORD-YYYY-NNNN`.

Orders can show only these payment-grounded states:

- Authorised
- Successful
- Failed
- Abandoned
- Refunded, only after a confirmed refund event

The Orders workspace does not contain delivery, installation, activation, merchant-live, settlement, or payout states.

### Linked bundles

A linked bundle may cross-link an `APP-` application and a `PAY-` payment attempt through a `BND-` relationship. The relationship is useful for navigation only; it does not create a derived “bundle complete” state.

## 4. Canonical engagement states

### Lead

| Canonical | Partner label | Set by |
|---|---|---|
| SUBMITTED | New · not contacted | System |
| CONTACTED | Contacted | Partner |
| CONVERTED | Converted | Partner |
| CLOSED | Lost | Partner |

Anonymous interest is allowed for Lead generation. Without consent, the partner sees business category, city, and submitted answers, but no contact details. Contacted and Converted actions remain unavailable until consent is granted.

### Application

| Canonical | Bank-facing label |
|---|---|
| SUBMITTED | New application |
| UNDER_REVIEW | In review / KYC |
| INFO_NEEDED | Info requested |
| APPROVED | Approved |
| DECLINED | Declined |
| ACTIVE | Disbursed / Active |

Application states are supplied by the regulated entity’s integration and cannot be manually changed in Partner Central.

## 5. Direct Buy configuration

The partner chooses one fulfilment mode:

- **Instant access after payment** — when payment succeeds, the merchant can be told that access is immediately available. There is no separate activation callback or activation state.
- **Partner-managed fulfilment** — when payment succeeds, Pine shares the purchase details with the partner. Partner Central makes no promise about a tracked activation time and shows that later fulfilment happens outside the product.

The partner still supplies merchant-facing fulfilment information so the buyer understands what happens after payment. Partner Central does not collect a webhook endpoint or activation SLA for this flow.

## 6. Performance metrics

Mixed offer tables use the generic headings **Activity** and **Outcome**, with type-specific values:

| Offer type | Activity | Outcome |
|---|---|---|
| Direct Buy | Purchases | Revenue (confirmed collected value) |
| Lead generation | Leads | Converted |
| Financial application | Applications | Approved |
| Linked bundle | Applications | Approved |

Do not use Live, Activated, or Bundle complete as performance outcomes without a reliable source event.

Metric links route to the evidence behind the number:

- Direct Buy purchases and revenue → Orders filtered to successful purchases for that offer.
- Lead metrics → Engagements · Leads filtered to that offer.
- Financial and Linked metrics → Engagements · Applications filtered to that offer.

## 7. Work-queue content

### Offers

Offer · Type · Deal · Activity · Outcome · Status · Validity · Action

### Engagements · Leads

Lead ID · Merchant/anonymous identity · Offer · Submitted · State · SLA · Consent · Action

### Engagements · Applications

Application ID · Merchant · Offer · Submitted · State · SLA · Bundle relationship · Action

### Orders

Payment attempt / Order ID · Merchant · Offer · Amount · Payment status · Fulfilment mode · Time · Action

Order detail may show payment-event history, transaction facts, consented merchant information, data shared with the partner, instant-access confirmation, and confirmed refund information. It must not provide controls for fulfilment, activation, refunds, or settlement.

## 8. SLA and review health

- Lead contact SLA and financial decision windows can be monitored because their owning records have observable state updates.
- Direct Buy has no partner activation SLA in Partner Central.
- Review SLA for Pine remains separate from merchant fulfilment: Financial and Linked 48 hours; Lead generation and Direct Buy 24 hours.
- SLA escalation is operational and manual; the system applies no automatic penalty.

## 9. Out of scope for the current product

- Partner fulfilment, delivery, installation, or activation tracking
- Activation callbacks and webhook delivery status
- Settlement, payout, hold, or release information
- Partner controls for refunds or disputes
- Inferring bundle completion from unrelated records
- Automatic SLA penalties
