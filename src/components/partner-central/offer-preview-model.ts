import { offerTypeMeta } from "./data";
import type {
  EditTarget,
  MerchantOfferPreview,
  OfferDraft,
  PartnerProfile,
  PinePreviewTemplates,
  PreviewFact,
  PreviewLegalItem,
  PreviewStep,
} from "./types";

export const pinePreviewTemplates: PinePreviewTemplates = {
  securePayment: "Complete payment through Pine.",
  platformTerms: "Pine platform, payment, cancellation, and applicable refund terms apply.",
  privacyConsent: "Merchant details are shared with the partner only after consent is provided.",
  bundleProtection: "The account application and device payment are recorded separately. Later device fulfilment happens outside Partner Central.",
};

const lockedMerchantFields = [
  "Business name",
  "Contact person",
  "Mobile",
  "Email",
  "GST / PAN",
  "City",
];

const edit = (section: EditTarget["section"], field?: string): EditTarget => ({
  section,
  field,
});

const money = (value: string) =>
  Number(value) > 0 ? `₹${new Intl.NumberFormat("en-IN").format(Number(value))}` : "";

const compactMoney = (value: string) => {
  const amount = Number(value);
  if (amount >= 10_000_000) return `₹${amount / 10_000_000}Cr`;
  if (amount >= 100_000) return `₹${amount / 100_000}L`;
  return money(value);
};

const date = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[Number(month) - 1]} ${year}`;
};

const renderableUrl = (value: string) =>
  /^(blob:|data:|https?:\/\/)/.test(value) ? value : undefined;

function valueLine(draft: OfferDraft) {
  if (draft.type === "direct-buy") return money(draft.price);
  if (draft.type === "lead-gen") {
    if (!draft.postTrialPrice) return "Partner-assisted offer";
    const lead = draft.headline.toLowerCase().includes("free")
      ? draft.headline.split("·")[0].trim()
      : "Offer period";
    return `${lead} · then ${draft.postTrialPrice}`;
  }
  if (draft.type === "financial") {
    return `Up to ${compactMoney(draft.creditCeiling)} · ${draft.interestRange} p.a.`;
  }
  return `${money(draft.devicePrice)} device + credit line up to ${compactMoney(draft.creditCeiling)}`;
}

function factsFor(draft: OfferDraft): PreviewFact[] {
  if (draft.type === "direct-buy") {
    return [
      { label: "Offer price", value: money(draft.price), editTarget: edit("fulfilment", "price") },
      { label: "Fulfilment", value: draft.fulfilment, editTarget: edit("fulfilment", "fulfilment") },
      {
        label: "After payment",
        value:
          draft.fulfilmentMode === "instant"
            ? "Access is available immediately"
            : "Partner-managed outside Partner Central",
        editTarget: edit("fulfilment", "fulfilmentMode"),
      },
    ];
  }

  if (draft.type === "lead-gen") {
    return [
      ...(draft.postTrialPrice
        ? [{ label: "After the offer", value: draft.postTrialPrice, editTarget: edit("fulfilment", "postTrialPrice") }]
        : []),
      { label: "Partner follow-up", value: `Within ${draft.contactSla} hours`, editTarget: edit("fulfilment", "contactSla") },
    ];
  }

  if (draft.type === "financial") {
    return [
      { label: "Product", value: draft.productFamily, editTarget: edit("bundle-terms", "productFamily") },
      { label: "Indicative interest", value: `${draft.interestRange} p.a.`, editTarget: edit("bundle-terms", "interestRange") },
      { label: "Credit ceiling", value: `Up to ${compactMoney(draft.creditCeiling)}`, editTarget: edit("bundle-terms", "creditCeiling") },
      { label: "Decision", value: `Subject to ${draft.regulatedEntity} underwriting`, editTarget: edit("bundle-terms", "regulatedEntity") },
    ];
  }

  return [
    { label: "Device price", value: money(draft.devicePrice), group: "Device", editTarget: edit("fulfilment", "devicePrice") },
    { label: "Delivery", value: draft.deviceFulfilment, group: "Device", editTarget: edit("fulfilment", "deviceFulfilment") },
    { label: "Availability", value: Number(draft.inventory) > 0 ? "Available" : "Currently unavailable", group: "Device", editTarget: edit("fulfilment", "inventory") },
    { label: "Credit ceiling", value: `Up to ${compactMoney(draft.creditCeiling)}`, group: "Account", editTarget: edit("bundle-terms", "creditCeiling") },
    { label: "Indicative interest", value: `${draft.interestRange} p.a.`, group: "Account", editTarget: edit("bundle-terms", "interestRange") },
    { label: "Provider", value: draft.regulatedEntity, group: "Account", editTarget: edit("bundle-terms", "regulatedEntity") },
  ];
}

function workflowFor(draft: OfferDraft, templates: PinePreviewTemplates): PreviewStep[] {
  if (draft.type === "direct-buy") {
    return [
      { title: "Choose the offer", description: "Review the product, price, and fulfilment details.", editTarget: edit("overview", "headline") },
      { title: "Pay securely", description: templates.securePayment, editTarget: edit("fulfilment", "price") },
      draft.fulfilmentMode === "instant"
        ? { title: "Get instant access", description: "Access is available as soon as payment succeeds.", editTarget: edit("fulfilment", "fulfilmentMode") }
        : { title: "Partner fulfils your purchase", description: `${draft.fulfilment}. Later progress is managed by the partner outside Partner Central.`, editTarget: edit("fulfilment", "fulfilment") },
    ];
  }

  if (draft.type === "lead-gen") {
    return [
      { title: "Review the offer", description: "Check what is included and the price after the offer period.", editTarget: edit("overview", "productDescription") },
      { title: "Share your details", description: "Submit your business details and consent securely through Pine.", editTarget: edit("interest-form") },
      { title: "Partner follows up", description: `Expect contact within ${draft.contactSla} hours.`, editTarget: edit("fulfilment", "contactSla") },
    ];
  }

  if (draft.type === "financial") {
    return [
      { title: "Review indicative terms", description: `Review the ${draft.productFamily.toLowerCase()} terms before applying.`, editTarget: edit("bundle-terms", "productFamily") },
      { title: "Submit your application", description: "Share business details and DPDP consent securely through Pine.", editTarget: edit("interest-form") },
      { title: "Complete review", description: `${draft.regulatedEntity} completes KYC, underwriting, and the final decision.`, editTarget: edit("bundle-terms", "regulatedEntity") },
    ];
  }

  return [
    { title: "Submit both requests", description: "Send the account application and device request together.", editTarget: edit("interest-form") },
    { title: "Bank reviews the application", description: `${draft.regulatedEntity} manages KYC and its decision.`, editTarget: edit("bundle-terms", "regulatedEntity") },
    { title: "Payment is handled separately", description: "A device payment event appears only when Pine receives it from the payment system.", editTarget: edit("fulfilment", "devicePrice") },
    { title: "Partner manages fulfilment", description: templates.bundleProtection, editTarget: edit("fulfilment", "deviceFulfilment") },
  ];
}

function legalFor(draft: OfferDraft, templates: PinePreviewTemplates): PreviewLegalItem[] {
  const items: PreviewLegalItem[] = [
    {
      title: "Offer terms",
      body: draft.terms,
      editTarget: edit("validity", "terms"),
    },
  ];

  if (draft.type === "direct-buy") {
    items.push({
      title: "Pine secure checkout",
      body: templates.platformTerms,
    });
  }

  if (draft.type === "lead-gen") {
    items.push({
      title: "Privacy and consent",
      body: templates.privacyConsent,
    });
  }

  if (draft.type === "financial" || draft.type === "linked") {
    items.push(
      {
        title: "Regulated entity",
        body: `${draft.regulatedEntity} · ${draft.licence} · CIN ${draft.cin}`,
        editTarget: edit("bundle-terms", "regulatedEntity"),
      },
      {
        title: "RBI / LSP disclosures",
        body: draft.disclosures,
        editTarget: edit("bundle-terms", "disclosures"),
      },
    );
    if (draft.dpdpConsent) {
      items.push({
        title: "DPDP consent",
        body: "Consent is collected before business and KYC information is shared with the regulated entity.",
        editTarget: edit("compliance", "dpdpConsent"),
      });
    }
    items.push({
      title: "Minimum Important Terms and Conditions",
      body: "Review the regulated product’s MITC before submitting an application.",
      href: renderableUrl(draft.mitcUrl),
      actionLabel: "View MITC",
      editTarget: edit("compliance", "mitcFile"),
    });
  }

  if (draft.type === "linked") {
    items.push({
      title: "Pine bundle protection",
      body: templates.bundleProtection,
    });
  }

  return items;
}

export function buildMerchantOfferPreview(
  draft: OfferDraft,
  partner: PartnerProfile,
  templates: PinePreviewTemplates,
): MerchantOfferPreview {
  const commercialValue = valueLine(draft);
  const fulfilment =
    draft.type === "direct-buy"
      ? draft.fulfilment
      : draft.type === "linked"
        ? draft.deviceFulfilment
        : draft.type === "lead-gen"
          ? `Partner follow-up within ${draft.contactSla} hours`
          : `Application and underwriting by ${draft.regulatedEntity}`;
  const fulfilmentEdit =
    draft.type === "direct-buy"
      ? edit("fulfilment", "fulfilment")
      : draft.type === "linked"
        ? edit("fulfilment", "deviceFulfilment")
        : draft.type === "lead-gen"
          ? edit("fulfilment", "contactSla")
          : edit("bundle-terms", "regulatedEntity");
  const cta =
    draft.type === "direct-buy"
      ? { label: "Buy now", mode: "checkout" as const }
      : draft.type === "lead-gen"
        ? { label: "I’m interested", mode: "interest" as const }
        : draft.type === "financial"
          ? { label: "Apply · takes 2 min", mode: "application" as const }
          : { label: "Reserve device + Apply", mode: "bundle" as const };
  const overview = edit("overview", "headline");
  const assets = edit("assets", "heroCreative");
  const facts = factsFor(draft).filter((fact) => fact.value);

  return {
    card: {
      partnerName: partner.name,
      partnerInitials: partner.initials,
      typeLabel: offerTypeMeta[draft.type].title,
      category: draft.category,
      headline: draft.headline,
      benefit: draft.benefit,
      valueLine: commercialValue,
      heroUrl: renderableUrl(draft.heroCreativeUrl),
      productMarkUrl: renderableUrl(draft.productMarkUrl),
    },
    hero: {
      partnerName: partner.name,
      partnerInitials: partner.initials,
      typeLabel: offerTypeMeta[draft.type].title,
      headline: draft.headline,
      benefit: draft.benefit,
      availability: `Available until ${date(draft.validUntil)}`,
      valueLine: commercialValue,
      heroUrl: renderableUrl(draft.heroCreativeUrl),
      productMarkUrl: renderableUrl(draft.productMarkUrl),
    },
    about: draft.productDescription,
    facts,
    howItWorks: workflowFor(draft, templates),
    summary: [
      { label: "Category", value: draft.category, editTarget: edit("overview", "category") },
      { label: "Validity", value: `${date(draft.validFrom)} – ${date(draft.validUntil)}`, editTarget: edit("validity", "validFrom") },
      { label: draft.type === "financial" ? "Application journey" : "Fulfilment", value: fulfilment, editTarget: fulfilmentEdit },
      { label: "Offer value", value: commercialValue, editTarget: facts[0]?.editTarget ?? overview },
    ].filter((fact) => fact.value),
    legalItems: legalFor(draft, templates),
    cta,
    merchantForm:
      draft.type === "direct-buy"
        ? undefined
        : {
            title: draft.type === "financial" ? "Merchant application form" : draft.type === "linked" ? "Bundle application form" : "Merchant interest form",
            lockedFields: lockedMerchantFields,
            questions: draft.questions,
            consentText: `I agree to share my details with ${partner.name}.`,
          },
    editTargets: {
      "card-copy": overview,
      "card-artwork": assets,
      "hero-copy": overview,
      "hero-artwork": assets,
      about: edit("overview", "productDescription"),
      facts: facts[0]?.editTarget ?? edit("fulfilment"),
      workflow: workflowFor(draft, templates)[0]?.editTarget ?? edit("fulfilment"),
      summary: edit("overview", "category"),
      "commercial-terms": edit("validity", "terms"),
      "regulatory-terms": edit("bundle-terms", "disclosures"),
      compliance: edit("compliance", "mitcFile"),
      "merchant-form": edit("interest-form"),
    },
  };
}
