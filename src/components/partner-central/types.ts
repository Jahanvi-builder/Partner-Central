export type PartnerId = "petpooja" | "hdfc";
export type OfferType = "direct-buy" | "financial" | "lead-gen" | "linked";
export type OfferStatus = "Draft" | "Under review" | "Live" | "Rejected" | "Paused" | "Ended";
export type FulfilmentMode = "instant" | "partner-managed";
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
  | { kind: "offers"; offerId?: string }
  | { kind: "offer-type" }
  | { kind: "offer-details"; offerType: OfferType; section?: OfferSectionId; field?: string }
  | { kind: "offer-preview"; offerType: OfferType }
  | { kind: "offer-status"; offerId: string; status: "under-review" | "live" | "rejected" }
  | { kind: "engagements"; engagementType?: "all" | "lead" | "application"; offerId?: string }
  | { kind: "engagement-detail"; engagementId: string }
  | { kind: "orders"; offerId?: string; paymentStatus?: PaymentStatus }
  | { kind: "order-detail"; paymentAttemptId: string };

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
  fulfilmentMode: FulfilmentMode;
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
  campaignId: string;
  partnerId: PartnerId;
  draftType: OfferType;
  name: string;
  meta: string;
  typeLabel: string;
  category: string;
  deal: string;
  status: OfferStatus;
  performance: OfferPerformance;
  engagedCount: number;
  convertedCount: number;
  validFrom: string;
  validUntil: string;
  revenue?: string;
  attentionPriority: number;
  attentionLabel?: string;
}

export type OfferPerformance =
  | { kind: "direct-buy"; purchaseCount: number; revenue: string }
  | { kind: "lead"; leadCount: number; convertedCount: number }
  | { kind: "application"; applicationCount: number; approvedCount: number };

export type PaymentStatus = "authorised" | "successful" | "failed" | "abandoned" | "refunded";

export interface PaymentAttempt {
  id: string;
  orderId?: string;
  partnerId: PartnerId;
  offerId: string;
  merchant: string;
  contactName: string;
  email: string;
  gstin: string;
  consentAt: string;
  offer: string;
  eventAt: string;
  paymentStatus: PaymentStatus;
  fulfilmentMode: FulfilmentMode;
  amount: string;
  paymentReference?: string;
  dataSharedAt?: string;
  refund?: { confirmedAt: string; amount: string; reference: string };
  bundleId?: string;
}

export type LeadState = "SUBMITTED" | "CONTACTED" | "CONVERTED" | "CLOSED";
export type ApplicationState = "SUBMITTED" | "UNDER_REVIEW" | "INFO_NEEDED" | "APPROVED" | "DECLINED" | "ACTIVE";
export type SlaStatus = "healthy" | "due-soon" | "breached";

export interface EngagementHistoryItem {
  label: string;
  at: string;
  detail: string;
}

interface EngagementBase {
  id: string;
  partnerId: PartnerId;
  offerId: string;
  offer: string;
  business: string;
  submittedAt: string;
  submittedOrder: number;
  slaStatus: SlaStatus;
  slaLabel: string;
  consentShared: boolean;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
  city: string;
  category: string;
  answers: Array<{ question: string; answer: string }>;
  note: string;
  history: EngagementHistoryItem[];
}

export interface LeadEngagement extends EngagementBase {
  kind: "lead";
  state: LeadState;
}

export interface ApplicationEngagement extends EngagementBase {
  kind: "application";
  state: ApplicationState;
  regulatedEntity: string;
  bundleId?: string;
  paymentAttemptId?: string;
}

export type Engagement = LeadEngagement | ApplicationEngagement;

export interface OfferListFilters {
  search: string;
  status: "All" | OfferStatus;
  type: "all" | OfferType;
  category: string;
}

export interface EngagementListFilters {
  kind: "all" | Engagement["kind"];
  search: string;
  offerId: string;
  state: string;
  sla: "all" | SlaStatus;
  consent: "all" | "shared" | "not-shared";
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
