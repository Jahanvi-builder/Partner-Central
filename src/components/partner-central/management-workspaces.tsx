"use client";

import * as React from "react";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  Clock3Icon,
  FileTextIcon,
  FilterIcon,
  GiftIcon,
  HandCoinsIcon,
  HeadphonesIcon,
  LayoutDashboardIcon,
  MenuIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  SearchIcon,
  ShoppingBagIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { offerTypeMeta, partnerProfiles } from "./data";
import type {
  AppView,
  ApplicationEngagement,
  Engagement,
  EngagementListFilters,
  LeadEngagement,
  LeadState,
  OfferListFilters,
  OfferRecord,
  OfferStatus,
  OfferType,
  PartnerId,
  PaymentAttempt,
  PaymentStatus,
} from "./types";

const primary = "bg-[#1f3a22] text-white hover:bg-[#1f3a22]/90";

const statusTone = (value: string) =>
  /Live|Contacted|Converted|Approved|Active|healthy/i.test(value)
    ? "border-success/20 bg-success/10 text-success"
    : /Rejected|Declined|Lost|breached/i.test(value)
      ? "border-destructive/20 bg-destructive/10 text-destructive"
      : /Paused|due soon|Info requested/i.test(value)
        ? "border-warning/20 bg-warning/10 text-[#925500]"
        : "border-info/20 bg-info/10 text-info";

function StateBadge({ value }: { value: string }) {
  return <Badge variant="outline" className={cn("gap-1.5 whitespace-nowrap", statusTone(value))}><span className="size-1.5 rounded-full bg-current" />{value}</Badge>;
}

function SlaBadge({ engagement }: { engagement: Engagement }) {
  const Icon = engagement.slaStatus === "breached" ? AlertTriangleIcon : Clock3Icon;
  return <Badge variant="outline" className={cn("gap-1.5 whitespace-nowrap", statusTone(engagement.slaStatus))}><Icon className="size-3" />{engagement.slaLabel}</Badge>;
}

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[Number(month) - 1]} ${year}`;
};

const leadStateLabel: Record<LeadEngagement["state"], string> = {
  SUBMITTED: "New · not contacted",
  CONTACTED: "Contacted",
  CONVERTED: "Converted",
  CLOSED: "Lost",
};

const applicationStateLabel: Record<ApplicationEngagement["state"], string> = {
  SUBMITTED: "New application",
  UNDER_REVIEW: "In review / KYC",
  INFO_NEEDED: "Info requested",
  APPROVED: "Approved",
  DECLINED: "Declined",
  ACTIVE: "Disbursed / Active",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  authorised: "Payment authorised",
  successful: "Payment successful",
  failed: "Payment failed",
  abandoned: "Checkout abandoned",
  refunded: "Refund confirmed",
};

const engagementLabel = (engagement: Engagement) =>
  engagement.kind === "lead" ? leadStateLabel[engagement.state] : applicationStateLabel[engagement.state];

const offerMetrics = (offer: OfferRecord) => {
  if (offer.performance.kind === "direct-buy") return { activity: `${offer.performance.purchaseCount} purchases`, outcome: `${offer.performance.revenue} revenue`, activityValue: String(offer.performance.purchaseCount), activityLabel: "Purchases", outcomeValue: offer.performance.revenue, outcomeLabel: "Revenue", section: "Orders" };
  if (offer.performance.kind === "lead") return { activity: `${offer.performance.leadCount} leads`, outcome: `${offer.performance.convertedCount} converted`, activityValue: String(offer.performance.leadCount), activityLabel: "Leads", outcomeValue: String(offer.performance.convertedCount), outcomeLabel: "Converted", section: "Leads" };
  return { activity: `${offer.performance.applicationCount} applications`, outcome: `${offer.performance.approvedCount} approved`, activityValue: String(offer.performance.applicationCount), activityLabel: "Applications", outcomeValue: String(offer.performance.approvedCount), outcomeLabel: "Approved", section: "Applications" };
};

function PageHeading({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1><p className="mt-1.5 text-sm text-muted-foreground">{copy}</p></div>{action}</div>;
}

export function PartnerShell({ partnerId, view, change, navigate, children }: { partnerId: PartnerId; view: AppView; change: (partner: PartnerId) => void; navigate: (view: AppView) => void; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const profile = partnerProfiles[partnerId];
  const items: Array<[string, React.ComponentType<{ className?: string }>, AppView | null]> = [
    ["Overview", LayoutDashboardIcon, { kind: "overview" }],
    ["Offers", GiftIcon, { kind: "offers" }],
    ["Engagements", UsersRoundIcon, { kind: "engagements", engagementType: "all" }],
    ["Orders", ShoppingBagIcon, { kind: "orders" }],
    ["Revenue", HandCoinsIcon, null],
    ["Reports", FileTextIcon, null],
  ];
  const active = view.kind.startsWith("offer")
    ? "Offers"
    : view.kind === "engagement-detail"
      ? "Engagements"
      : view.kind === "engagements"
        ? "Engagements"
      : view.kind.startsWith("order") ? "Orders" : "Overview";

  return <div className="min-h-screen bg-[#fbfbf9]">
    <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-[#f4f3ee] px-3 py-5 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-2 pb-7"><div className="flex items-center gap-2.5"><div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-xs font-black text-background">O1</div><div><p className="text-sm font-semibold">Partner Central</p><p className="text-[10px] text-muted-foreground">by Pine Labs</p></div></div><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}><XIcon /><span className="sr-only">Close navigation</span></Button></div>
      <nav aria-label="Primary" className="space-y-1">{items.map(([label, Icon, target]) => <button key={label} type="button" onClick={() => { setOpen(false); if (target) navigate(target); else toast.info(`${label} is outside Partner J1–J7.`); }} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm", active === label ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:bg-background/70")} aria-current={active === label ? "page" : undefined}><Icon className="size-4" />{label}</button>)}</nav>
      <Card className="mt-auto border-0 bg-background/85 py-3 shadow-none"><CardContent className="px-3 text-xs"><p className="flex items-center gap-2 font-medium"><HeadphonesIcon className="size-4" />Need help?</p><p className="mt-2 text-muted-foreground">Support@pinelabs.com</p></CardContent></Card>
    </aside>
    {open ? <button className="fixed inset-0 z-40 bg-black/25 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" /> : null}
    <div className="lg:pl-60"><header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-7"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}><MenuIcon /><span className="sr-only">Open navigation</span></Button><button className="hidden h-9 w-full max-w-md items-center gap-2 rounded-lg border px-3 text-xs text-muted-foreground sm:flex"><SearchIcon className="size-4" />Search pages, offers, orders and engagements…</button><div className="ml-auto flex items-center gap-2"><Button variant="ghost" size="icon"><BellIcon /><span className="sr-only">Notifications</span></Button><DropdownMenu><DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted" />}><Avatar size="sm"><AvatarFallback className="bg-[#1f3a22] text-white">{profile.initials}</AvatarFallback></Avatar><span className="hidden text-left sm:block"><span className="block text-xs font-medium">{profile.name}</span><span className="block text-[10px] text-muted-foreground">{profile.role}</span></span><ChevronDownIcon className="size-3" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel>Switch demo account</DropdownMenuLabel>{Object.values(partnerProfiles).map((item) => <DropdownMenuItem key={item.id} onClick={() => change(item.id)} className="py-2"><Avatar size="sm"><AvatarFallback className="bg-[#1f3a22] text-white">{item.initials}</AvatarFallback></Avatar><span className="text-xs">{item.name}<small className="block text-muted-foreground">{item.role}</small></span>{item.id === partnerId ? <CheckIcon className="ml-auto" /> : null}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div></header><main>{children}</main></div>
  </div>;
}

function OfferActions({ offer, onOpen, onEdit, onStatus }: { offer: OfferRecord; onOpen: () => void; onEdit: () => void; onStatus: (status: OfferStatus) => void }) {
  const [confirm, setConfirm] = React.useState<"end" | null>(null);
  return <>
    <DropdownMenu><DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}><MoreHorizontalIcon /><span className="sr-only">Actions for {offer.name}</span></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-44"><DropdownMenuItem onClick={onOpen}>View details</DropdownMenuItem>{["Draft", "Rejected"].includes(offer.status) ? <DropdownMenuItem onClick={onEdit}>{offer.status === "Rejected" ? "Edit & resubmit" : "Edit draft"}</DropdownMenuItem> : null}{["Live", "Paused"].includes(offer.status) ? <DropdownMenuItem onClick={() => onStatus(offer.status === "Live" ? "Paused" : "Live")}>{offer.status === "Live" ? "Pause campaign" : "Resume campaign"}</DropdownMenuItem> : null}{!["Ended", "Rejected"].includes(offer.status) ? <DropdownMenuItem variant="destructive" onClick={() => setConfirm("end")}>End campaign</DropdownMenuItem> : null}</DropdownMenuContent></DropdownMenu>
    <Dialog open={confirm === "end"} onOpenChange={(next) => !next && setConfirm(null)}><DialogContent><DialogHeader><DialogTitle>End {offer.name}?</DialogTitle><DialogDescription>The campaign will stop accepting new merchant engagements. Existing records remain available.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirm(null)}>Keep campaign</Button><Button variant="destructive" onClick={() => { onStatus("Ended"); setConfirm(null); }}>End campaign</Button></DialogFooter></DialogContent></Dialog>
  </>;
}

export function OffersWorkspace({ partnerId, offers, filters, setFilters, navigate, onEdit, onStatus, onOpenMetrics }: { partnerId: PartnerId; offers: OfferRecord[]; filters: OfferListFilters; setFilters: (filters: OfferListFilters) => void; navigate: (view: AppView) => void; onEdit: (offer: OfferRecord) => void; onStatus: (offer: OfferRecord, status: OfferStatus) => void; onOpenMetrics: (offer: OfferRecord, converted: boolean) => void }) {
  const own = offers.filter((offer) => offer.partnerId === partnerId);
  const categories = Array.from(new Set(own.map((offer) => offer.category)));
  const statuses: Array<"All" | OfferStatus> = ["All", "Live", "Under review", "Rejected", "Draft", "Paused", "Ended"];
  const rows = own
    .filter((offer) => filters.status === "All" || offer.status === filters.status)
    .filter((offer) => filters.type === "all" || offer.draftType === filters.type)
    .filter((offer) => filters.category === "all" || offer.category === filters.category)
    .filter((offer) => `${offer.name} ${offer.campaignId} ${offer.deal}`.toLowerCase().includes(filters.search.toLowerCase()))
    .sort((a, b) => a.attentionPriority - b.attentionPriority || a.name.localeCompare(b.name));
  const clear = () => setFilters({ search: "", status: "All", type: "all", category: "all" });

  return <div className="mx-auto max-w-[1380px] px-4 py-8 md:px-8">
    <PageHeading title="Offers" copy="See campaign health, merchant response, and what needs action next." action={<Button className={primary} onClick={() => navigate({ kind: "offer-type" })}><GiftIcon />New offer</Button>} />
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filter offers by status">{statuses.map((status) => { const count = own.filter((offer) => status === "All" || offer.status === status).length; return <Button key={status} size="sm" variant={filters.status === status ? "default" : "outline"} onClick={() => setFilters({ ...filters, status })}>{status}<Badge variant="secondary" className="ml-1 px-1.5">{count}</Badge></Button>; })}</div>
    <div className="mb-4 hidden grid-cols-[minmax(240px,1fr)_220px_240px_auto] gap-3 md:grid">
      <div className="relative"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search offers" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search offer or campaign ID" className="pl-9" /></div>
      <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value as OfferListFilters["type"] })}><SelectTrigger aria-label="Filter by offer type" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All offer types</SelectItem>{(Object.keys(offerTypeMeta) as OfferType[]).filter((type) => partnerProfiles[partnerId].availableOfferTypes.includes(type)).map((type) => <SelectItem key={type} value={type}>{offerTypeMeta[type].title}</SelectItem>)}</SelectContent></Select>
      <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value ?? "all" })}><SelectTrigger aria-label="Filter by category" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select>
      <Button variant="ghost" onClick={clear}>Clear</Button>
    </div>
    <div className="mb-4 flex gap-2 md:hidden"><div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search offers" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search offers" className="pl-9" /></div><Sheet><SheetTrigger render={<Button variant="outline" />}><FilterIcon />Filters</SheetTrigger><SheetContent side="right"><SheetHeader><SheetTitle>Filter offers</SheetTitle><SheetDescription>Narrow the campaign work queue.</SheetDescription></SheetHeader><div className="space-y-4 px-4"><Label>Offer type</Label><Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value as OfferListFilters["type"] })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All offer types</SelectItem>{partnerProfiles[partnerId].availableOfferTypes.map((type) => <SelectItem key={type} value={type}>{offerTypeMeta[type].title}</SelectItem>)}</SelectContent></Select><Label>Category</Label><Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value ?? "all" })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select></div><SheetFooter><Button variant="outline" onClick={clear}>Clear all</Button></SheetFooter></SheetContent></Sheet></div>
    <p className="sr-only" aria-live="polite">{rows.length} offers shown</p>
    {rows.length ? <>
      <Card className="hidden overflow-x-auto py-0 shadow-none md:block"><Table><caption className="sr-only">Offers sorted by action urgency</caption><TableHeader><TableRow><TableHead>Offer</TableHead><TableHead>Type</TableHead><TableHead>Deal</TableHead><TableHead>Activity</TableHead><TableHead>Outcome</TableHead><TableHead>Status</TableHead><TableHead>Validity</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{rows.map((offer) => { const metrics = offerMetrics(offer); return <TableRow key={offer.id}><TableCell className="min-w-64"><button className="text-left font-medium hover:underline" onClick={() => navigate({ kind: "offer-status", offerId: offer.id, status: offer.status === "Rejected" ? "rejected" : offer.status === "Under review" ? "under-review" : "live" })}>{offer.name}</button><small className={cn("mt-1 block", offer.attentionLabel ? "font-medium text-destructive" : "text-muted-foreground")}>{offer.attentionLabel ?? offer.meta}</small><small className="mt-1 block text-muted-foreground">{offer.campaignId}</small></TableCell><TableCell>{offer.typeLabel}</TableCell><TableCell>{offer.deal}</TableCell><TableCell><Button variant="link" className="h-auto p-0" onClick={() => onOpenMetrics(offer, false)}>{metrics.activity}</Button></TableCell><TableCell><Button variant="link" className="h-auto p-0" onClick={() => onOpenMetrics(offer, true)}>{metrics.outcome}</Button></TableCell><TableCell><StateBadge value={offer.status} /></TableCell><TableCell className="whitespace-nowrap"><span>{formatDate(offer.validFrom)}</span><small className="block text-muted-foreground">to {formatDate(offer.validUntil)}</small></TableCell><TableCell><OfferActions offer={offer} onOpen={() => navigate({ kind: "offer-status", offerId: offer.id, status: offer.status === "Rejected" ? "rejected" : offer.status === "Under review" ? "under-review" : "live" })} onEdit={() => onEdit(offer)} onStatus={(status) => onStatus(offer, status)} /></TableCell></TableRow>; })}</TableBody></Table></Card>
      <div className="space-y-3 md:hidden">{rows.map((offer) => { const metrics = offerMetrics(offer); return <Card key={offer.id} className="shadow-none"><CardContent><div className="flex items-start justify-between gap-3"><div><button className="text-left font-semibold hover:underline" onClick={() => navigate({ kind: "offer-status", offerId: offer.id, status: offer.status === "Rejected" ? "rejected" : offer.status === "Under review" ? "under-review" : "live" })}>{offer.name}</button><p className="mt-1 text-[11px] text-muted-foreground">{offer.campaignId} · {offer.typeLabel}</p></div><OfferActions offer={offer} onOpen={() => navigate({ kind: "offer-status", offerId: offer.id, status: offer.status === "Rejected" ? "rejected" : offer.status === "Under review" ? "under-review" : "live" })} onEdit={() => onEdit(offer)} onStatus={(status) => onStatus(offer, status)} /></div>{offer.attentionLabel ? <p className="mt-3 flex gap-2 rounded-lg bg-destructive/5 p-2 text-xs text-destructive"><CircleAlertIcon className="size-4 shrink-0" />{offer.attentionLabel}</p> : null}<div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><span className="text-muted-foreground">Activity</span><button className="block font-medium underline-offset-4 hover:underline" onClick={() => onOpenMetrics(offer, false)}>{metrics.activity}</button></div><div><span className="text-muted-foreground">Outcome</span><button className="block font-medium underline-offset-4 hover:underline" onClick={() => onOpenMetrics(offer, true)}>{metrics.outcome}</button></div><div><span className="text-muted-foreground">Validity</span><p>{formatDate(offer.validUntil)}</p></div><div><span className="text-muted-foreground">Status</span><div className="mt-1"><StateBadge value={offer.status} /></div></div></div></CardContent></Card>; })}</div>
    </> : <Card className="shadow-none"><CardContent className="flex min-h-56 flex-col items-center justify-center text-center"><SearchIcon className="size-8 text-muted-foreground" /><h2 className="mt-4 font-semibold">No offers match these filters</h2><p className="mt-1 text-sm text-muted-foreground">Clear the filters to return to the complete campaign list.</p><Button variant="outline" className="mt-4" onClick={clear}>Clear filters</Button></CardContent></Card>}
  </div>;
}

function EngagementFilters({ filters, setFilters, offers, kind, mobile = false }: { filters: EngagementListFilters; setFilters: (filters: EngagementListFilters) => void; offers: OfferRecord[]; kind: EngagementListFilters["kind"]; mobile?: boolean }) {
  const states = kind === "lead" ? Object.entries(leadStateLabel) : kind === "application" ? Object.entries(applicationStateLabel) : [["SUBMITTED", "Submitted"], ["CONTACTED", "Contacted"], ["CONVERTED", "Converted"], ["CLOSED", "Lost"], ["UNDER_REVIEW", "In review / KYC"], ["INFO_NEEDED", "Info requested"], ["APPROVED", "Approved"], ["DECLINED", "Declined"], ["ACTIVE", "Disbursed / Active"]];
  const content = <><div className="relative"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={`Search ${kind === "lead" ? "leads" : kind === "application" ? "applications" : "engagements"}`} value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search ID, merchant, or offer" className="pl-9" /></div><Select value={filters.offerId} onValueChange={(value) => setFilters({ ...filters, offerId: value ?? "all" })}><SelectTrigger aria-label="Filter by offer" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All offers</SelectItem>{offers.map((offer) => <SelectItem key={offer.id} value={offer.id}>{offer.name}</SelectItem>)}</SelectContent></Select><Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value ?? "all" })}><SelectTrigger aria-label="Filter by state" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All states</SelectItem>{states.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Select value={filters.sla} onValueChange={(value) => setFilters({ ...filters, sla: value as EngagementListFilters["sla"] })}><SelectTrigger aria-label="Filter by SLA" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All SLA states</SelectItem><SelectItem value="breached">Breached</SelectItem><SelectItem value="due-soon">Due soon</SelectItem><SelectItem value="healthy">Healthy</SelectItem></SelectContent></Select>{kind === "lead" ? <Select value={filters.consent} onValueChange={(value) => setFilters({ ...filters, consent: value as EngagementListFilters["consent"] })}><SelectTrigger aria-label="Filter by consent" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All consent states</SelectItem><SelectItem value="shared">Shared</SelectItem><SelectItem value="not-shared">Not shared</SelectItem></SelectContent></Select> : null}</>;
  return mobile ? <div className="space-y-4">{content}</div> : <div className={cn("mb-4 hidden gap-3 md:grid", kind !== "application" ? "grid-cols-[minmax(220px,1fr)_220px_190px_180px_180px]" : "grid-cols-[minmax(220px,1fr)_240px_200px_180px]")}>{content}</div>;
}

export function EngagementWorkspace({ partnerId, kind, rows, offers, filters, setFilters, navigate }: { partnerId: PartnerId; kind: EngagementListFilters["kind"]; rows: Engagement[]; offers: OfferRecord[]; filters: EngagementListFilters; setFilters: (filters: EngagementListFilters) => void; navigate: (view: AppView) => void }) {
  const title = kind === "lead" ? "Leads" : kind === "application" ? "Applications" : "Engagements";
  const ownOffers = offers.filter((offer) => offer.partnerId === partnerId && (kind === "lead" ? offer.draftType === "lead-gen" : kind === "application" ? ["financial", "linked"].includes(offer.draftType) : offer.draftType !== "direct-buy"));
  const own = rows.filter((row) => row.partnerId === partnerId && (kind === "all" || row.kind === kind));
  const data = own
    .filter((row) => filters.offerId === "all" || row.offerId === filters.offerId)
    .filter((row) => filters.state === "all" || row.state === filters.state)
    .filter((row) => filters.sla === "all" || row.slaStatus === filters.sla)
    .filter((row) => filters.consent === "all" || (filters.consent === "shared" ? row.consentShared : !row.consentShared))
    .filter((row) => `${row.id} ${row.business} ${row.offer} ${row.city}`.toLowerCase().includes(filters.search.toLowerCase()))
    .sort((a, b) => ({ breached: 0, "due-soon": 1, healthy: 2 }[a.slaStatus] - { breached: 0, "due-soon": 1, healthy: 2 }[b.slaStatus] || b.submittedOrder - a.submittedOrder));
  const clear = () => setFilters({ kind, search: "", offerId: "all", state: "all", sla: "all", consent: "all" });
  const appliedCount = [filters.offerId !== "all", filters.state !== "all", filters.sla !== "all", filters.consent !== "all"].filter(Boolean).length;

  return <div className="mx-auto max-w-[1380px] px-4 py-8 md:px-8">
    <PageHeading title={title} copy={kind === "lead" ? "Contact consented merchants on time and move qualified leads forward." : kind === "application" ? "Track bank-supplied application states, SLA health, and linked bundles." : "Triage leads and applications in one operational queue."} />
    <div className="mb-4 flex gap-2" aria-label="Engagement type">{(["all", "lead", "application"] as const).map((value) => <Button key={value} size="sm" variant={kind === value ? "default" : "outline"} onClick={() => { setFilters({ ...filters, kind: value, state: "all", consent: "all" }); navigate({ kind: "engagements", engagementType: value }); }}>{value === "all" ? "All" : value === "lead" ? "Leads" : "Applications"}</Button>)}</div>
    <EngagementFilters filters={filters} setFilters={setFilters} offers={ownOffers} kind={kind} />
    <div className="mb-4 flex gap-2 md:hidden"><div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label={`Search ${title.toLowerCase()}`} value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder={`Search ${title.toLowerCase()}`} className="pl-9" /></div><Sheet><SheetTrigger render={<Button variant="outline" />}><FilterIcon />Filters{appliedCount ? <Badge>{appliedCount}</Badge> : null}</SheetTrigger><SheetContent><SheetHeader><SheetTitle>Filter {title.toLowerCase()}</SheetTitle><SheetDescription>Find the records that need action next.</SheetDescription></SheetHeader><div className="px-4"><EngagementFilters mobile filters={filters} setFilters={setFilters} offers={ownOffers} kind={kind} /></div><SheetFooter><Button variant="outline" onClick={clear}>Clear all</Button></SheetFooter></SheetContent></Sheet></div>
    <p className="sr-only" aria-live="polite">{data.length} {title.toLowerCase()} shown</p>
    {data.length ? <><Card className="hidden overflow-x-auto py-0 shadow-none md:block"><Table><caption className="sr-only">{title} sorted by SLA urgency</caption><TableHeader><TableRow><TableHead>{kind === "lead" ? "Lead ID" : kind === "application" ? "Application ID" : "Record ID"}</TableHead><TableHead>Merchant</TableHead><TableHead>Offer</TableHead><TableHead>Submitted</TableHead><TableHead>State</TableHead><TableHead>SLA</TableHead><TableHead>{kind === "lead" ? "Consent" : kind === "application" ? "Bundle" : "Type / link"}</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader><TableBody>{data.map((row) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.id}</TableCell><TableCell className="min-w-52"><button className="text-left font-medium hover:underline" onClick={() => navigate({ kind: "engagement-detail", engagementId: row.id })}>{row.consentShared ? row.business : `Anonymous · ${row.category} · ${row.city}`}</button>{row.consentShared ? <small className="block text-muted-foreground">{row.city}</small> : null}</TableCell><TableCell>{row.offer}</TableCell><TableCell className="whitespace-nowrap">{row.submittedAt}</TableCell><TableCell><StateBadge value={engagementLabel(row)} /></TableCell><TableCell><SlaBadge engagement={row} /></TableCell><TableCell>{row.kind === "lead" ? <span className={cn("text-xs font-medium", row.consentShared ? "text-success" : "text-muted-foreground")}>{kind === "all" ? "Lead · " : ""}{row.consentShared ? "Shared" : "Not shared"}</span> : row.bundleId ? <Button variant="link" className="h-auto p-0 font-mono text-xs" onClick={() => row.paymentAttemptId && navigate({ kind: "order-detail", paymentAttemptId: row.paymentAttemptId })}>{row.bundleId}</Button> : <span className="text-xs">{kind === "all" ? "Application" : "—"}</span>}</TableCell><TableCell><Button variant="outline" size="sm" onClick={() => navigate({ kind: "engagement-detail", engagementId: row.id })}>View</Button></TableCell></TableRow>)}</TableBody></Table></Card>
      <div className="space-y-3 md:hidden">{data.map((row) => <Card key={row.id} className="shadow-none"><CardContent><div className="flex items-start justify-between gap-3"><div><button className="text-left font-semibold hover:underline" onClick={() => navigate({ kind: "engagement-detail", engagementId: row.id })}>{row.consentShared ? row.business : `Anonymous · ${row.category} · ${row.city}`}</button><p className="mt-1 font-mono text-[10px] text-muted-foreground">{row.id}</p></div><StateBadge value={engagementLabel(row)} /></div><p className="mt-3 text-xs text-muted-foreground">{row.offer} · {row.submittedAt}</p><div className="mt-4 flex items-center justify-between"><SlaBadge engagement={row} /><Button variant="outline" size="sm" onClick={() => navigate({ kind: "engagement-detail", engagementId: row.id })}>View details</Button></div></CardContent></Card>)}</div></> : <Card className="shadow-none"><CardContent className="flex min-h-56 flex-col items-center justify-center text-center"><UsersRoundIcon className="size-8 text-muted-foreground" /><h2 className="mt-4 font-semibold">No {title.toLowerCase()} match these filters</h2><p className="mt-1 text-sm text-muted-foreground">Clear filters to return to the complete work queue.</p><Button variant="outline" className="mt-4" onClick={clear}>Clear filters</Button></CardContent></Card>}
  </div>;
}

export function OfferWorkspaceDetail({ offer, engagements, paymentAttempts, navigate, onStatus, onEdit, onOpenMetrics }: { offer: OfferRecord; engagements: Engagement[]; paymentAttempts: PaymentAttempt[]; navigate: (view: AppView) => void; onStatus: (status: OfferStatus) => void; onEdit: () => void; onOpenMetrics: (converted: boolean) => void }) {
  const metrics = offerMetrics(offer);
  const related = engagements.filter((row) => row.offerId === offer.id).slice(0, 4);
  const relatedPayments = paymentAttempts.filter((row) => row.offerId === offer.id).slice(0, 4);
  const [confirmEnd, setConfirmEnd] = React.useState(false);
  return <div className="mx-auto max-w-[1180px] px-4 py-8 md:px-8">
    <Button variant="ghost" onClick={() => navigate({ kind: "offers" })}><ArrowLeftIcon />Offers</Button>
    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold md:text-3xl">{offer.name}</h1><StateBadge value={offer.status} /></div><p className="mt-2 text-sm text-muted-foreground">{offer.campaignId} · {offer.typeLabel} · {formatDate(offer.validFrom)}–{formatDate(offer.validUntil)}</p></div><div className="flex flex-wrap gap-2">{["Draft", "Rejected", "Under review"].includes(offer.status) ? <Button className={primary} onClick={onEdit}>{offer.status === "Rejected" ? "Edit & resubmit" : offer.status === "Under review" ? "Withdraw and edit" : "Edit draft"}</Button> : null}{["Live", "Paused"].includes(offer.status) ? <Button variant="outline" onClick={() => onStatus(offer.status === "Live" ? "Paused" : "Live")}>{offer.status === "Live" ? "Pause" : "Resume"}</Button> : null}{!["Ended", "Rejected"].includes(offer.status) ? <Button variant="outline" onClick={() => setConfirmEnd(true)}>End campaign</Button> : null}</div></div>
    {offer.attentionLabel ? <div className={cn("mt-6 flex gap-3 rounded-xl border p-4 text-sm", offer.attentionPriority <= 2 ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-warning/30 bg-warning/10 text-[#7a4d00]")}><CircleAlertIcon className="size-5 shrink-0" /><div><b>{offer.attentionLabel}</b><p className="mt-1 text-xs opacity-80">Open the relevant queue or campaign editor to resolve the next action.</p></div></div> : null}
    <div className="mt-6 grid gap-3 sm:grid-cols-2"><button className="text-left" onClick={() => onOpenMetrics(false)}><Card className="h-full shadow-none transition hover:shadow-sm"><CardContent><span className="text-xs text-muted-foreground">{metrics.activityLabel}</span><p className="mt-2 text-2xl font-semibold">{metrics.activityValue}</p><p className="mt-1 text-xs text-muted-foreground">Open the related queue</p></CardContent></Card></button><button className="text-left" onClick={() => onOpenMetrics(true)}><Card className="h-full shadow-none transition hover:shadow-sm"><CardContent><span className="text-xs text-muted-foreground">{metrics.outcomeLabel}</span><p className="mt-2 text-2xl font-semibold">{metrics.outcomeValue}</p><p className="mt-1 text-xs text-muted-foreground">{offer.performance.kind === "direct-buy" ? "Confirmed collected value" : "Open the related queue"}</p></CardContent></Card></button></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]"><Card className="py-0 shadow-none"><CardHeader><CardTitle>Recent {metrics.section.toLowerCase()}</CardTitle></CardHeader><CardContent className="px-0">{offer.performance.kind === "direct-buy" ? (relatedPayments.length ? relatedPayments.map((row) => <button key={row.id} className="flex w-full items-center justify-between gap-4 border-t px-6 py-4 text-left hover:bg-muted/30" onClick={() => navigate({ kind: "order-detail", paymentAttemptId: row.id })}><span><b className="text-sm">{row.merchant}</b><small className="block font-mono text-muted-foreground">{row.orderId ?? row.id}</small></span><span className="text-right"><StateBadge value={paymentStatusLabel[row.paymentStatus]} /><small className="mt-1 block text-muted-foreground">{row.amount}</small></span></button>) : <p className="border-t px-6 py-8 text-sm text-muted-foreground">No payment activity yet.</p>) : (related.length ? related.map((row) => <button key={row.id} className="flex w-full items-center justify-between gap-4 border-t px-6 py-4 text-left hover:bg-muted/30" onClick={() => navigate({ kind: "engagement-detail", engagementId: row.id })}><span><b className="text-sm">{row.consentShared ? row.business : `Anonymous · ${row.category} · ${row.city}`}</b><small className="block font-mono text-muted-foreground">{row.id}</small></span><span className="text-right"><StateBadge value={engagementLabel(row)} /><small className="mt-1 block text-muted-foreground">{row.slaLabel}</small></span></button>) : <p className="border-t px-6 py-8 text-sm text-muted-foreground">No merchant records yet.</p>)}</CardContent></Card><div className="space-y-5"><Card className="shadow-none"><CardHeader><CardTitle>Offer summary</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">{[["Type", offer.typeLabel], ["Category", offer.category], ["Deal", offer.deal], ["Valid until", formatDate(offer.validUntil)]].map(([label, value]) => <div key={label}><span className="text-xs text-muted-foreground">{label}</span><p className="mt-1 font-medium">{value}</p></div>)}</CardContent></Card><Card className="shadow-none"><CardHeader><CardTitle>Campaign history</CardTitle></CardHeader><CardContent className="space-y-4 text-xs"><div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-success" /><div><b>Campaign created</b><p className="mt-1 text-muted-foreground">Configuration saved in Partner Central.</p></div></div><div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-info" /><div><b>{offer.meta}</b><p className="mt-1 text-muted-foreground">Latest recorded campaign event.</p></div></div></CardContent></Card></div></div>
    <Dialog open={confirmEnd} onOpenChange={setConfirmEnd}><DialogContent><DialogHeader><DialogTitle>End {offer.name}?</DialogTitle><DialogDescription>No new merchant engagements will be accepted. Existing records remain available.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmEnd(false)}>Keep campaign</Button><Button variant="destructive" onClick={() => { onStatus("Ended"); setConfirmEnd(false); }}>End campaign</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}

export function OrdersWorkspace({ partnerId, rows, offerId, initialStatus, navigate }: { partnerId: PartnerId; rows: PaymentAttempt[]; offerId?: string; initialStatus?: PaymentStatus; navigate: (view: AppView) => void }) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | PaymentStatus>(initialStatus ?? "all");
  const own = rows
    .filter((row) => row.partnerId === partnerId)
    .filter((row) => !offerId || row.offerId === offerId)
    .filter((row) => status === "all" || row.paymentStatus === status)
    .filter((row) => `${row.id} ${row.orderId ?? ""} ${row.merchant} ${row.offer}`.toLowerCase().includes(search.toLowerCase()));
  const statuses: Array<"all" | PaymentStatus> = ["all", "successful", "authorised", "failed", "abandoned", "refunded"];
  return <div className="mx-auto max-w-[1380px] px-4 py-8 md:px-8">
    <PageHeading title="Orders" copy="Payment activity Pine can verify. Partner-managed fulfilment is not tracked here." action={<Button variant="outline" onClick={() => toast.success("Payment activity export prepared.")}>Export CSV</Button>} />
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filter orders by payment status">{statuses.map((value) => <Button key={value} size="sm" variant={status === value ? "default" : "outline"} onClick={() => setStatus(value)}>{value === "all" ? "All" : paymentStatusLabel[value]}</Button>)}</div>
    <div className="relative mb-4 max-w-md"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search orders" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search merchant, order, or payment ID" className="pl-9" /></div>
    <p className="sr-only" aria-live="polite">{own.length} payment records shown</p>
    {own.length ? <><Card className="hidden overflow-x-auto py-0 shadow-none md:block"><Table><caption className="sr-only">Orders and payment attempts</caption><TableHeader><TableRow><TableHead>Order / attempt</TableHead><TableHead>Merchant</TableHead><TableHead>Offer</TableHead><TableHead>Amount</TableHead><TableHead>Payment</TableHead><TableHead>Fulfilment</TableHead><TableHead>Time</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader><TableBody>{own.map((row) => <TableRow key={row.id}><TableCell><span className="font-mono text-xs">{row.orderId ?? row.id}</span>{row.orderId ? <small className="block font-mono text-muted-foreground">{row.id}</small> : null}</TableCell><TableCell className="font-medium">{row.merchant}</TableCell><TableCell>{row.offer}</TableCell><TableCell>{row.amount}</TableCell><TableCell><StateBadge value={paymentStatusLabel[row.paymentStatus]} /></TableCell><TableCell>{row.fulfilmentMode === "instant" ? "Instant after payment" : "Partner-managed"}</TableCell><TableCell>{row.eventAt}</TableCell><TableCell><Button variant="outline" size="sm" onClick={() => navigate({ kind: "order-detail", paymentAttemptId: row.id })}>View</Button></TableCell></TableRow>)}</TableBody></Table></Card><div className="space-y-3 md:hidden">{own.map((row) => <Card key={row.id} className="shadow-none"><CardContent><div className="flex items-start justify-between gap-3"><div><button className="text-left font-semibold hover:underline" onClick={() => navigate({ kind: "order-detail", paymentAttemptId: row.id })}>{row.merchant}</button><p className="mt-1 font-mono text-[10px] text-muted-foreground">{row.orderId ?? row.id}</p></div><StateBadge value={paymentStatusLabel[row.paymentStatus]} /></div><p className="mt-3 text-xs text-muted-foreground">{row.offer} · {row.amount} · {row.eventAt}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs">{row.fulfilmentMode === "instant" ? "Instant access" : "Partner-managed"}</span><Button variant="outline" size="sm" onClick={() => navigate({ kind: "order-detail", paymentAttemptId: row.id })}>View details</Button></div></CardContent></Card>)}</div></> : <Card className="shadow-none"><CardContent className="flex min-h-56 flex-col items-center justify-center text-center"><ShoppingBagIcon className="size-8 text-muted-foreground" /><h2 className="mt-4 font-semibold">No payment records match</h2><p className="mt-1 text-sm text-muted-foreground">Try another status or clear the search.</p><Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setStatus("all"); }}>Clear filters</Button></CardContent></Card>}
  </div>;
}

export function PaymentAttemptDetail({ payment, navigate }: { payment: PaymentAttempt; navigate: (view: AppView) => void }) {
  const successful = payment.paymentStatus === "successful" || payment.paymentStatus === "refunded";
  return <div className="mx-auto max-w-[1120px] px-4 py-8 md:px-8">
    <Button variant="ghost" onClick={() => navigate({ kind: "orders" })}><ArrowLeftIcon />Orders</Button>
    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold md:text-3xl">{payment.merchant}</h1><StateBadge value={paymentStatusLabel[payment.paymentStatus]} /></div><p className="mt-2 font-mono text-xs text-muted-foreground">{payment.orderId ? `${payment.orderId} · ${payment.id}` : payment.id}</p></div></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Amount", payment.amount], ["Payment event", payment.eventAt], ["Offer", payment.offer], ["Fulfilment", payment.fulfilmentMode === "instant" ? "Instant after payment" : "Partner-managed"]].map(([label, value]) => <Card key={label} className="shadow-none"><CardContent><span className="text-xs text-muted-foreground">{label}</span><p className="mt-2 text-sm font-medium">{value}</p></CardContent></Card>)}</div>
    <div className={cn("mt-6 rounded-xl border p-4 text-sm", successful ? "border-info/20 bg-info/5" : "bg-muted/40")}><b>{payment.fulfilmentMode === "instant" && successful ? "Access is available immediately" : successful ? "Partner-managed fulfilment" : "No fulfilment was triggered"}</b><p className="mt-1 text-xs text-muted-foreground">{payment.fulfilmentMode === "instant" && successful ? "Successful payment is the observable access event; no later activation callback is expected." : successful ? "Purchase details were shared with the partner. Later fulfilment and activation happen outside Partner Central." : "Only the payment attempt is recorded. No order or fulfilment outcome is implied."}</p></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]"><div className="space-y-5"><Card className="shadow-none"><CardHeader><CardTitle>Payment event history</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-muted-foreground/40" /><div><b className="text-xs">Checkout started</b><p className="mt-1 text-[11px] text-muted-foreground">Payment attempt {payment.id} was created.</p></div></div><div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-[#1f3a22]" /><div><b className="text-xs">{paymentStatusLabel[payment.paymentStatus]}</b><p className="mt-1 text-[11px] text-muted-foreground">{payment.eventAt}{payment.paymentReference ? ` · ${payment.paymentReference}` : ""}</p></div></div>{payment.dataSharedAt ? <div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-info" /><div><b className="text-xs">Purchase details shared</b><p className="mt-1 text-[11px] text-muted-foreground">Shared with the partner at {payment.dataSharedAt}. Later progress is not tracked.</p></div></div> : null}{payment.refund ? <div className="flex gap-3"><span className="mt-1 size-2 rounded-full bg-success" /><div><b className="text-xs">Refund confirmed</b><p className="mt-1 text-[11px] text-muted-foreground">{payment.refund.amount} · {payment.refund.confirmedAt} · {payment.refund.reference}</p></div></div> : null}</CardContent></Card><Card className="shadow-none"><CardHeader><CardTitle>Merchant and shared data</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{[["Business", payment.merchant], ["Contact", payment.contactName], ["Email", payment.email], ["GSTIN", payment.gstin], ["Consent recorded", payment.consentAt], ["Shared with partner", payment.dataSharedAt ?? "Not shared"]].map(([label, value]) => <div key={label}><span className="text-xs text-muted-foreground">{label}</span><p className="mt-1 text-sm font-medium">{value}</p></div>)}</CardContent></Card></div><Card className="self-start shadow-none"><CardHeader><CardTitle>What Pine knows</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>Payment status and references come from Pine’s payment system.</p><p className="text-muted-foreground">Partner fulfilment, activation, and settlement are not available in Partner Central.</p>{payment.refund ? <p className="rounded-lg bg-success/10 p-3 text-xs">This refund is shown because the payment system confirmed it.</p> : <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">Refund or dispute handling appears only after a confirmed payment event.</p>}</CardContent></Card></div>
  </div>;
}

export function EngagementDetail({ engagement, navigate, update, openPayment }: { engagement: Engagement; navigate: (view: AppView) => void; update: (engagement: Engagement) => void; openPayment: (paymentAttemptId: string) => void }) {
  const [note, setNote] = React.useState(engagement.note);
  const isLead = engagement.kind === "lead";
  const title = engagement.consentShared ? engagement.business : `Anonymous · ${engagement.category} · ${engagement.city}`;
  const transition = (state: LeadState, label: string) => {
    if (engagement.kind !== "lead") return;
    update({ ...engagement, state, history: [...engagement.history, { label, at: "Just now", detail: "Updated in Partner Central." }] });
    toast.success(`Lead updated to ${leadStateLabel[state]}.`);
  };
  return <div className="mx-auto max-w-[1120px] px-4 py-8 md:px-8">
    <Button variant="ghost" onClick={() => navigate({ kind: "engagements", engagementType: engagement.kind })}><ArrowLeftIcon />Engagements</Button>
    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold md:text-3xl">{title}</h1><StateBadge value={engagementLabel(engagement)} /></div><p className="mt-2 font-mono text-xs text-muted-foreground">{engagement.id}</p></div>{isLead ? <div className="flex flex-wrap gap-2">{engagement.state === "SUBMITTED" ? <><Button className={primary} disabled={!engagement.consentShared} onClick={() => transition("CONTACTED", "Marked contacted")}>Mark contacted</Button><Button variant="outline" onClick={() => transition("CLOSED", "Marked lost")}>Mark lost</Button></> : engagement.state === "CONTACTED" ? <><Button className={primary} onClick={() => transition("CONVERTED", "Marked converted")}>Mark converted</Button><Button variant="outline" onClick={() => transition("CLOSED", "Marked lost")}>Mark lost</Button></> : null}</div> : <Badge variant="outline"><PackageCheckIcon />State supplied by bank integration</Badge>}</div>
    {!engagement.consentShared ? <div className="mt-6 flex gap-3 rounded-xl border bg-muted/40 p-4"><CircleAlertIcon className="size-5 shrink-0" /><div><b className="text-sm">Merchant did not share contact details</b><p className="mt-1 text-xs text-muted-foreground">Contacted and Converted remain unavailable until the merchant grants consent.</p></div></div> : null}
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Card className="shadow-none"><CardContent><span className="text-xs text-muted-foreground">State</span><div className="mt-2"><StateBadge value={engagementLabel(engagement)} /></div></CardContent></Card><Card className="shadow-none"><CardContent><span className="text-xs text-muted-foreground">SLA</span><div className="mt-2"><SlaBadge engagement={engagement} /></div></CardContent></Card><Card className="shadow-none"><CardContent><span className="text-xs text-muted-foreground">Submitted</span><p className="mt-2 text-sm font-medium">{engagement.submittedAt}</p></CardContent></Card><Card className="shadow-none"><CardContent><span className="text-xs text-muted-foreground">Consent</span><p className="mt-2 text-sm font-medium">{engagement.consentShared ? "Shared" : "Not shared"}</p></CardContent></Card></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_330px]"><div className="space-y-5"><Card className="shadow-none"><CardHeader><CardTitle>{isLead ? "Merchant details" : "Application details"}</CardTitle></CardHeader><CardContent>{engagement.consentShared ? <div className="grid gap-4 sm:grid-cols-2">{[["Business", engagement.business], ["Contact", engagement.contactName], ["Mobile", engagement.phone], ["Email", engagement.email], ["GST / PAN", engagement.taxId], ["City", engagement.city], ["Offer", engagement.offer], ...(engagement.kind === "application" ? [["Regulated entity", engagement.regulatedEntity]] : [])].map(([label, value]) => <div key={label}><span className="text-xs text-muted-foreground">{label}</span><p className="mt-1 text-sm font-medium">{value}</p></div>)}</div> : <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">Only {engagement.category} and {engagement.city} are available. Contact fields stay locked.</div>}{engagement.kind === "application" && engagement.bundleId ? <div className="mt-5 rounded-lg border p-3 text-xs"><b>Part of bundle {engagement.bundleId}</b><p className="mt-1 text-muted-foreground">The application and device payment event are recorded separately. Device fulfilment is not tracked here.</p>{engagement.paymentAttemptId ? <Button variant="link" className="mt-2 h-auto p-0" onClick={() => openPayment(engagement.paymentAttemptId!)}>Open payment attempt {engagement.paymentAttemptId}</Button> : null}</div> : null}</CardContent></Card><Card className="shadow-none"><CardHeader><CardTitle>Submitted answers</CardTitle></CardHeader><CardContent className="space-y-4">{engagement.answers.map((answer) => <div key={answer.question}><span className="text-xs text-muted-foreground">{answer.question}</span><p className="mt-1 text-sm font-medium">{answer.answer}</p></div>)}</CardContent></Card></div><div className="space-y-5"><Card className="shadow-none"><CardHeader><CardTitle>State history</CardTitle></CardHeader><CardContent className="space-y-4">{engagement.history.map((item, index) => <div className="flex gap-3" key={`${item.label}-${index}`}><span className={cn("mt-1 size-2 shrink-0 rounded-full", index === engagement.history.length - 1 ? "bg-[#1f3a22]" : "bg-muted-foreground/30")} /><div><b className="text-xs">{item.label}</b><p className="mt-1 text-[11px] text-muted-foreground">{item.at} · {item.detail}</p></div></div>)}</CardContent></Card><Card className="shadow-none"><CardHeader><CardTitle>Internal note</CardTitle></CardHeader><CardContent><Textarea aria-label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add context for your team" /><Button className={cn("mt-3 w-full", primary)} onClick={() => { update({ ...engagement, note }); toast.success("Note saved for this session."); }}>Save note</Button></CardContent></Card></div></div>
    <p className="sr-only" aria-live="polite">Current state: {engagementLabel(engagement)}</p>
  </div>;
}
