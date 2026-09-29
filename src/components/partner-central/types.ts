export type PartnerId = "petpooja" | "hdfc";
export type OfferType = "direct-buy" | "financial" | "lead-gen" | "linked";
export type OfferStatus = "Draft" | "Under review" | "Live" | "Rejected" | "Paused" | "Ended";
export type ActivationMode = "immediate" | "webhook";
export type ActivationGate = "both" | "account" | "device";
export type QuestionType = "short-text" | "single-select";
export type OfferSectionId =
  | "overview"
  | "fulfilment"
  | "bundle-terms"
  | "compliance"
  | "assets"
  | "validity"
  | "interest-form";

export type AppView =
  | { kind: "overview" }
  | { kind: "offers" }
  | { kind: "offer-type" }
  | { kind: "offer-details"; offerType: OfferType; section?: OfferSectionId; field?: string }
  | { kind: "offer-preview"; offerType: OfferType }
  | { kind: "offer-status"; offerId: string; status: "under-review" | "live" | "rejected" }
  | { kind: "interests" }
  | { kind: "interest-detail"; interestId: string }
  | { kind: "orders" }
  | { kind: "order-detail"; orderId: string };

export interface PartnerProfile {
  id: PartnerId;
  name: string;
  legalName: string;
  role: string;
  initials: string;
  availableOfferTypes: OfferType[];
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  options: string[];
}

export interface OfferDraft {
  id: string;
  partnerId: PartnerId;
  type: OfferType;
  offerName: string;
  category: string;
  headline: string;
  benefit: string;
  productDescription: string;
  sku: string;
  price: string;
  fulfilment: string;
  activationMode: ActivationMode;
  webhookUrl: string;
  activationSla: string;
  regulatedEntity: string;
  licence: string;
  cin: string;
  productFamily: string;
  interestRange: string;
  creditCeiling: string;
  disclosures: string;
  dpdpConsent: boolean;
  mitcFile: string;
  mitcUrl: string;
  complianceSignoff: boolean;
  postTrialPrice: string;
  contactSla: string;
  deviceSku: string;
  devicePrice: string;
  inventory: string;
  deviceFulfilment: string;
  activationGate: ActivationGate;
  productMark: string;
  productMarkUrl: string;
  heroCreative: string;
  heroCreativeUrl: string;
  validFrom: string;
  validUntil: string;
  terms: string;
  questions: CustomQuestion[];
  rejectionNote?: string;
}

export interface OfferRecord {
  id: string;
  partnerId: PartnerId;
  draftType: OfferType;
  name: string;
  meta: string;
  typeLabel: string;
  category: string;
  deal: string;
  interests: number | null;
  activated: number | null;
  status: OfferStatus;
}

export type OrderStatus = "Order received" | "Installation scheduled" | "Merchant live" | "Declined";

export interface Order {
  id: string;
  partnerId: PartnerId;
  merchant: string;
  contactName: string;
  email: string;
  gstin: string;
  consentAt: string;
  offer: string;
  placed: string;
  status: OrderStatus;
  settlement: "Held" | "Released" | "—";
  amount: string;
  endpoint: string;
  deliveryResult: string;
  refund?: { reason: string; impact: string; status: string };
}

export type InterestStatus = "Interest captured" | "Contacted" | "Converted" | "Lost";

export interface Interest {
  id: string;
  partnerId: PartnerId;
  business: string;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
  city: string;
  category: string;
  offer: string;
  capturedAt: string;
  capturedOrder: number;
  consentShared: boolean;
  status: InterestStatus;
  answers: Array<{ question: string; answer: string }>;
  note: string;
}

export type DraftStore = Record<PartnerId, Partial<Record<OfferType, OfferDraft>>>;

export type PreviewRegion =
  | "card-copy"
  | "card-artwork"
  | "hero-copy"
  | "hero-artwork"
  | "about"
  | "facts"
  | "workflow"
  | "summary"
  | "commercial-terms"
  | "regulatory-terms"
  | "compliance"
  | "merchant-form";

export interface EditTarget {
  section: OfferSectionId;
  field?: string;
}

export interface PreviewFact {
  label: string;
  value: string;
  group?: "Device" | "Account";
  editTarget: EditTarget;
}

export interface PreviewStep {
  title: string;
  description: string;
  editTarget: EditTarget;
}

export interface PreviewLegalItem {
  title: string;
  body: string;
  href?: string;
  actionLabel?: string;
  editTarget?: EditTarget;
}

export interface MerchantCta {
  label: string;
  mode: "checkout" | "interest" | "application" | "bundle";
}

export interface PinePreviewTemplates {
  securePayment: string;
  platformTerms: string;
  privacyConsent: string;
  bundleProtection: string;
}

export interface MerchantOfferPreview {
  card: {
    partnerName: string;
    partnerInitials: string;
    typeLabel: string;
    category: string;
    headline: string;
    benefit: string;
    valueLine: string;
    heroUrl?: string;
    productMarkUrl?: string;
  };
  hero: {
    partnerName: string;
    partnerInitials: string;
    typeLabel: string;
    headline: string;
    benefit: string;
    availability: string;
    valueLine: string;
    heroUrl?: string;
    productMarkUrl?: string;
  };
  about: string;
  facts: PreviewFact[];
  howItWorks: PreviewStep[];
  summary: PreviewFact[];
  legalItems: PreviewLegalItem[];
  cta: MerchantCta;
  merchantForm?: {
    title: string;
    lockedFields: string[];
    questions: CustomQuestion[];
    consentText: string;
  };
  editTargets: Record<PreviewRegion, EditTarget>;
}
