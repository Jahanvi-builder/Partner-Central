"use client";

import * as React from "react";
import { BadgeIndianRupeeIcon, CircleAlertIcon, Clock3Icon, GiftIcon, ShoppingBagIcon, UsersRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cloneInitialDrafts, initialEngagements, initialOffers, initialPaymentAttempts, offerTypeMeta, partnerProfiles } from "./partner-central/data";
import { firstErrorSection, OfferDetails, OfferPreview, OfferTypeSelection, validateOfferDraft } from "./partner-central/offer-creation";
import { EngagementDetail, EngagementWorkspace, OffersWorkspace, OfferWorkspaceDetail, OrdersWorkspace, PartnerShell, PaymentAttemptDetail } from "./partner-central/management-workspaces";
import type { AppView, DraftStore, EditTarget, Engagement, EngagementListFilters, OfferDraft, OfferListFilters, OfferPerformance, OfferRecord, OfferStatus, OfferType, PartnerId } from "./partner-central/types";

const primary = "bg-[#1f3a22] text-white hover:bg-[#1f3a22]/90";

function Overview({ partnerId, offers, navigate }: { partnerId: PartnerId; offers: OfferRecord[]; navigate: (view: AppView) => void }) {
  const profile = partnerProfiles[partnerId];
  const own = offers.filter((offer) => offer.partnerId === partnerId);
  const purchaseCount = own.reduce((total, offer) => total + (offer.performance.kind === "direct-buy" ? offer.performance.purchaseCount : 0), 0);
  const engagementCount = own.reduce((total, offer) => total + (offer.performance.kind === "lead" ? offer.performance.leadCount : offer.performance.kind === "application" ? offer.performance.applicationCount : 0), 0);
  const revenueValue = own.reduce((total, offer) => total + (offer.performance.kind === "direct-buy" ? Number(offer.performance.revenue.replace(/[^0-9.]/g, "")) || 0 : 0), 0);
  const revenue = purchaseCount ? `₹${new Intl.NumberFormat("en-IN").format(revenueValue)}` : "—";
  const attention = partnerId === "petpooja"
    ? [
        ["Rejected", "Inventory Software — Diwali", "T&Cs need correction.", CircleAlertIcon, { kind: "offer-status", offerId: "offer-rejected", status: "rejected" } as AppView],
        ["Engagements", "Leads need follow-up", "Open the SLA-prioritised queue.", UsersRoundIcon, { kind: "engagements", engagementType: "lead" } as AppView],
        ["Payments", "Review payment activity", "Fulfilment after payment is not tracked.", ShoppingBagIcon, { kind: "orders" } as AppView],
      ]
    : [
        ["Under review", "POS + Business Line", "Submitted yesterday.", Clock3Icon, { kind: "offer-status", offerId: "hdfc-linked-review", status: "under-review" } as AppView],
        ["Applications", "Application updates", "Track bank-supplied states and SLA health.", UsersRoundIcon, { kind: "engagements", engagementType: "application" } as AppView],
      ];
  return <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-8">
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Welcome back, {profile.name}!</h1><p className="mt-1.5 text-sm text-muted-foreground">Monitor campaigns using only payment and engagement data Pine can verify.</p></div><Button className={primary} onClick={() => navigate({ kind: "offer-type" })}><GiftIcon />New offer</Button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Engagements", String(engagementCount), UsersRoundIcon], ["Purchases", String(purchaseCount), ShoppingBagIcon], ["Revenue", revenue, BadgeIndianRupeeIcon], ["Offers live", String(own.filter((offer) => offer.status === "Live").length), GiftIcon]].map(([label, value, Icon]) => <Card key={String(label)} className="shadow-none"><CardContent><div className="flex justify-between text-xs text-muted-foreground">{String(label)}{React.createElement(Icon as React.ComponentType<{ className?: string }>, { className: "size-4" })}</div><p className="mt-3 text-2xl font-semibold">{String(value)}</p></CardContent></Card>)}</div>
    <h2 className="mb-3 mt-7 text-sm font-semibold">Needs your attention</h2>
    <div className="grid gap-3 md:grid-cols-3">{attention.map(([label, title, copy, Icon, target]) => <button key={String(title)} className="text-left" onClick={() => navigate(target as AppView)}><Card className="h-full shadow-none hover:shadow-sm"><CardContent><div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-muted">{React.createElement(Icon as React.ComponentType<{ className?: string }>, { className: "size-4" })}</div><p className="text-[10px] uppercase text-muted-foreground">{String(label)}</p><p className="mt-1 text-sm font-medium">{String(title)}</p><p className="mt-1 text-xs text-muted-foreground">{String(copy)}</p></CardContent></Card></button>)}</div>
    <div className="mb-3 mt-8 flex justify-between"><div><h2 className="font-semibold">Your offers</h2><p className="text-xs text-muted-foreground">Activity and outcomes by offer type</p></div><Button variant="outline" onClick={() => navigate({ kind: "offers" })}>View all</Button></div>
    <Card className="overflow-x-auto py-0 shadow-none"><Table><TableHeader><TableRow><TableHead>Offer</TableHead><TableHead>Type</TableHead><TableHead>Activity</TableHead><TableHead>Outcome</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{own.slice(0, 4).map((offer) => { const performance = offer.performance; const activity = performance.kind === "direct-buy" ? `${performance.purchaseCount} purchases` : performance.kind === "lead" ? `${performance.leadCount} leads` : `${performance.applicationCount} applications`; const outcome = performance.kind === "direct-buy" ? `${performance.revenue} revenue` : performance.kind === "lead" ? `${performance.convertedCount} converted` : `${performance.approvedCount} approved`; return <TableRow key={offer.id}><TableCell><Button variant="link" className="h-auto p-0" onClick={() => navigate({ kind: "offer-status", offerId: offer.id, status: offer.status === "Rejected" ? "rejected" : offer.status === "Under review" ? "under-review" : "live" })}>{offer.name}</Button><small className="block text-muted-foreground">{offer.campaignId}</small></TableCell><TableCell>{offer.typeLabel}</TableCell><TableCell>{activity}</TableCell><TableCell>{outcome}</TableCell><TableCell>{offer.status}</TableCell></TableRow>; })}</TableBody></Table></Card>
  </div>;
}

export function PartnerCentralApp() {
  const [partnerId, setPartnerId] = React.useState<PartnerId>("petpooja");
  const [view, setView] = React.useState<AppView>({ kind: "overview" });
  const [selected, setSelected] = React.useState<OfferType>("direct-buy");
  const [drafts, setDrafts] = React.useState<DraftStore>(cloneInitialDrafts);
  const [offers, setOffers] = React.useState(initialOffers);
  const [paymentAttempts] = React.useState(initialPaymentAttempts);
  const [engagements, setEngagements] = React.useState<Engagement[]>(initialEngagements);
  const [offerFilters, setOfferFilters] = React.useState<OfferListFilters>({ search: "", status: "All", type: "all", category: "all" });
  const [engagementFilters, setEngagementFilters] = React.useState<EngagementListFilters>({ kind: "all", search: "", offerId: "all", state: "all", sla: "all", consent: "all" });
  const [editScroll, setEditScroll] = React.useState<Partial<Record<OfferType, number>>>({});

  const nav = (next: AppView, scroll = true) => { setView(next); if (scroll) window.scrollTo({ top: 0, behavior: "smooth" }); };
  const change = (nextPartner: PartnerId) => {
    setPartnerId(nextPartner);
    setSelected(nextPartner === "petpooja" ? "direct-buy" : "financial");
    setOfferFilters({ search: "", status: "All", type: "all", category: "all" });
    setEngagementFilters({ kind: "all", search: "", offerId: "all", state: "all", sla: "all", consent: "all" });
    nav({ kind: "overview" });
    toast.success(`Switched to ${partnerProfiles[nextPartner].name}.`);
  };
  const draft = view.kind === "offer-details" || view.kind === "offer-preview" ? drafts[partnerId][view.offerType] : undefined;
  const setDraft = (nextDraft: OfferDraft) => setDrafts((current) => ({ ...current, [partnerId]: { ...current[partnerId], [nextDraft.type]: nextDraft } }));

  const publish = (submitted: OfferDraft) => {
    const performance: OfferPerformance = submitted.type === "direct-buy" ? { kind: "direct-buy", purchaseCount: 0, revenue: "₹0" } : submitted.type === "lead-gen" ? { kind: "lead", leadCount: 0, convertedCount: 0 } : { kind: "application", applicationCount: 0, approvedCount: 0 };
    const record: OfferRecord = { id: submitted.id, campaignId: `CMP-2026-${String(1050 + offers.length).padStart(4, "0")}`, partnerId, draftType: submitted.type, name: submitted.offerName, meta: "Submitted just now", typeLabel: offerTypeMeta[submitted.type].title, category: submitted.category, deal: submitted.benefit, status: "Under review", performance, engagedCount: 0, convertedCount: 0, validFrom: submitted.validFrom, validUntil: submitted.validUntil, attentionPriority: 4 };
    setOffers((current) => current.some((offer) => offer.id === submitted.id) ? current.map((offer) => offer.id === submitted.id ? record : offer) : [record, ...current]);
    toast.success("Offer submitted for review.");
    nav({ kind: "offer-status", offerId: submitted.id, status: "under-review" });
  };
  const publishFromPreview = (submitted: OfferDraft) => {
    const errors = validateOfferDraft(submitted);
    if (Object.keys(errors).length) { toast.error("The draft needs attention before it can be published."); nav({ kind: "offer-details", offerType: submitted.type, section: firstErrorSection(errors), field: Object.keys(errors)[0] }); return; }
    publish(submitted);
  };
  const updateOfferStatus = (offer: OfferRecord, status: OfferStatus) => {
    setOffers((current) => current.map((item) => item.id === offer.id ? { ...item, status, attentionPriority: status === "Rejected" ? 0 : status === "Live" ? 5 : item.attentionPriority, attentionLabel: status === "Rejected" ? item.attentionLabel : undefined, meta: status === "Paused" ? "Paused just now" : status === "Live" ? "Resumed just now" : status === "Ended" ? "Ended just now" : item.meta } : item));
    toast.success(status === "Ended" ? "Campaign ended." : status === "Paused" ? "Campaign paused." : "Campaign resumed.");
  };
  const editOffer = (offer: OfferRecord) => {
    if (offer.status === "Rejected") {
      const base = drafts.petpooja["lead-gen"]!;
      setDrafts((current) => ({ ...current, petpooja: { ...current.petpooja, "lead-gen": { ...base, id: offer.id, offerName: offer.name, headline: "₹2,000 off annual subscription", rejectionNote: "Add redemption cap and refund clause 4.2." } } }));
      nav({ kind: "offer-details", offerType: "lead-gen", section: "validity", field: "terms" });
      return;
    }
    nav({ kind: "offer-details", offerType: offer.draftType });
  };
  const openOfferMetrics = (offer: OfferRecord, outcome: boolean) => {
    if (offer.performance.kind === "direct-buy") { nav({ kind: "orders", offerId: offer.id, paymentStatus: "successful" }); return; }
    const kind = offer.performance.kind === "lead" ? "lead" : "application";
    const state = outcome ? (kind === "lead" ? "CONVERTED" : "APPROVED") : "all";
    setEngagementFilters((current) => ({ ...current, kind, offerId: offer.id, state }));
    nav({ kind: "engagements", engagementType: kind, offerId: offer.id });
  };

  let content: React.ReactNode;
  if (view.kind === "overview") content = <Overview partnerId={partnerId} offers={offers} navigate={nav} />;
  else if (view.kind === "offers") content = <OffersWorkspace partnerId={partnerId} offers={offers} filters={offerFilters} setFilters={setOfferFilters} navigate={nav} onEdit={editOffer} onStatus={updateOfferStatus} onOpenMetrics={openOfferMetrics} />;
  else if (view.kind === "offer-type") content = <OfferTypeSelection partnerId={partnerId} selected={selected} setSelected={setSelected} onBack={() => nav({ kind: "overview" })} onContinue={(offerType) => nav({ kind: "offer-details", offerType })} />;
  else if (view.kind === "offer-details" && draft) content = <OfferDetails draft={draft} setDraft={setDraft} initialSection={view.section} initialField={view.field} restoreScrollY={editScroll[draft.type] ?? 0} onRememberScroll={(scrollY) => setEditScroll((current) => ({ ...current, [draft.type]: scrollY }))} onBack={() => nav({ kind: "offer-type" })} onContinue={() => nav({ kind: "offer-preview", offerType: draft.type })} />;
  else if (view.kind === "offer-preview" && draft) content = <OfferPreview draft={draft} onBack={() => nav({ kind: "offer-details", offerType: draft.type }, false)} onEdit={(target: EditTarget) => nav({ kind: "offer-details", offerType: draft.type, section: target.section, field: target.field })} onPublish={() => publishFromPreview(draft)} />;
  else if (view.kind === "offer-status") { const offer = offers.find((item) => item.id === view.offerId); content = offer ? <OfferWorkspaceDetail offer={offer} engagements={engagements} paymentAttempts={paymentAttempts} navigate={nav} onStatus={(status) => updateOfferStatus(offer, status)} onEdit={() => editOffer(offer)} onOpenMetrics={(outcome) => openOfferMetrics(offer, outcome)} /> : <Overview partnerId={partnerId} offers={offers} navigate={nav} />; }
  else if (view.kind === "engagements") { const kind = view.engagementType ?? engagementFilters.kind; const offerId = view.offerId ?? engagementFilters.offerId; content = <EngagementWorkspace partnerId={partnerId} kind={kind} rows={engagements} offers={offers} filters={{ ...engagementFilters, kind, offerId }} setFilters={setEngagementFilters} navigate={nav} />; }
  else if (view.kind === "engagement-detail") { const engagement = engagements.find((item) => item.id === view.engagementId); content = engagement ? <EngagementDetail engagement={engagement} navigate={nav} openPayment={(paymentAttemptId) => nav({ kind: "order-detail", paymentAttemptId })} update={(nextEngagement) => setEngagements((current) => current.map((item) => item.id === nextEngagement.id ? nextEngagement : item))} /> : <Overview partnerId={partnerId} offers={offers} navigate={nav} />; }
  else if (view.kind === "orders") content = <OrdersWorkspace key={`${view.offerId ?? "all"}-${view.paymentStatus ?? "all"}`} partnerId={partnerId} rows={paymentAttempts} offerId={view.offerId} initialStatus={view.paymentStatus} navigate={nav} />;
  else if (view.kind === "order-detail") { const payment = paymentAttempts.find((item) => item.id === view.paymentAttemptId); content = payment ? <PaymentAttemptDetail payment={payment} navigate={nav} /> : <OrdersWorkspace partnerId={partnerId} rows={paymentAttempts} navigate={nav} />; }
  else content = <Overview partnerId={partnerId} offers={offers} navigate={nav} />;

  return <PartnerShell partnerId={partnerId} view={view} change={change} navigate={nav}>{content}</PartnerShell>;
}
