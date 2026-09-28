"use client";

import * as React from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BoxesIcon,
  Building2Icon,
  CheckIcon,
  ChevronRightIcon,
  GiftIcon,
  ImageIcon,
  LayoutGridIcon,
  ListChecksIcon,
  MessageSquareTextIcon,
  PencilIcon,
  SearchIcon,
  ShoppingBagIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { offerTypeMeta, partnerProfiles } from "./data";
import type {
  CustomQuestion,
  OfferDraft,
  OfferSectionId,
  OfferType,
  PartnerId,
  QuestionType,
} from "./types";

type Errors = Record<string, string>;
type DraftSetter = (draft: OfferDraft) => void;

const primary = "bg-[#1f3a22] text-white hover:bg-[#1f3a22]/90";
const offerIcons = {
  "direct-buy": ShoppingBagIcon,
  financial: Building2Icon,
  "lead-gen": MessageSquareTextIcon,
  linked: BoxesIcon,
};

const lockedFields = [
  "Business name",
  "Contact person",
  "Mobile",
  "Email",
  "GST / PAN",
  "City",
  "Consent checkbox",
];

type FieldGuidance = {
  placeholder: string;
  hint?: string;
};

const fieldGuidance: Partial<Record<keyof OfferDraft, FieldGuidance>> = {
  offerName: { placeholder: "e.g. Restaurant POS — Annual Plan" },
  category: { placeholder: "e.g. Billing & POS" },
  headline: { placeholder: "e.g. Get a complete POS system for your restaurant" },
  benefit: { placeholder: "e.g. Billing, inventory and analytics in one plan" },
  productDescription: {
    placeholder: "e.g. Describe what the merchant receives and the problem it solves",
  },
  sku: {
    placeholder: "e.g. POS-ANNUAL-2026",
    hint: "Unique code used by your systems.",
  },
  price: {
    placeholder: "e.g. 9999",
    hint: "Enter the amount in ₹ without commas or a currency symbol.",
  },
  fulfilment: { placeholder: "e.g. Digital subscription · 1 year" },
  webhookUrl: {
    placeholder: "https://api.yourcompany.com/pine/activation",
    hint: "HTTPS endpoint that receives activation events from Pine.",
  },
  activationSla: {
    placeholder: "e.g. 4",
    hint: "Maximum activation time in hours.",
  },
  postTrialPrice: { placeholder: "e.g. ₹1,299/month after the trial" },
  contactSla: {
    placeholder: "e.g. 48",
    hint: "Maximum time before your team contacts the merchant, in hours.",
  },
  productFamily: { placeholder: "e.g. Business line of credit" },
  interestRange: { placeholder: "e.g. 12%–18% p.a." },
  creditCeiling: {
    placeholder: "e.g. 1500000",
    hint: "Maximum eligible amount in ₹, without commas.",
  },
  disclosures: {
    placeholder:
      "e.g. APR, processing fees, penalties, cooling-off period and grievance contact",
    hint: "Include the rate range, applicable fees, penalties, cooling-off period, and grievance contact.",
  },
  deviceSku: {
    placeholder: "e.g. POS-NKD-2P-STD",
    hint: "Unique device code used by your systems.",
  },
  devicePrice: {
    placeholder: "e.g. 4999",
    hint: "Enter the amount in ₹ without commas or a currency symbol.",
  },
  inventory: { placeholder: "e.g. 1200" },
  deviceFulfilment: { placeholder: "e.g. Physical delivery · 3–5 business days" },
  terms: {
    placeholder: "e.g. Include eligibility, exclusions, cancellation and refund terms",
    hint: "These terms appear on the merchant-facing offer details page.",
  },
};

function fieldA11y(id: string, hint?: string, error?: string) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : undefined,
  };
}

const sectionForField: Record<string, OfferSectionId> = {
  offerName: "overview",
  category: "overview",
  headline: "overview",
  benefit: "overview",
  productDescription: "fulfilment",
  sku: "fulfilment",
  price: "fulfilment",
  fulfilment: "fulfilment",
  webhookUrl: "fulfilment",
  activationSla: "fulfilment",
  postTrialPrice: "fulfilment",
  contactSla: "fulfilment",
  deviceSku: "fulfilment",
  devicePrice: "fulfilment",
  inventory: "fulfilment",
  deviceFulfilment: "fulfilment",
  disclosures: "bundle-terms",
  mitcFile: "compliance",
  compliance: "compliance",
  heroCreative: "assets",
  validFrom: "validity",
  validUntil: "validity",
  terms: "validity",
  questions: "interest-form",
};

const sectionLabels: Record<OfferSectionId, string> = {
  overview: "Offer overview",
  fulfilment: "Product & fulfilment",
  "bundle-terms": "Product terms",
  compliance: "Consent & compliance",
  assets: "Visual assets",
  validity: "Validity & T&Cs",
  "interest-form": "Merchant form",
};

function money(value: string) {
  return Number(value) > 0
    ? new Intl.NumberFormat("en-IN").format(Number(value))
    : "—";
}

function formatDate(value: string) {
  return value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${value}T00:00:00Z`))
    : "—";
}

export function validateOfferDraft(draft: OfferDraft): Errors {
  const errors: Errors = {};
  const required: Array<keyof OfferDraft> = [
    "offerName",
    "category",
    "headline",
    "benefit",
    "heroCreative",
    "validFrom",
    "validUntil",
    "terms",
  ];

  required.forEach((key) => {
    if (!String(draft[key] ?? "").trim()) errors[String(key)] = "Required";
  });

  if (draft.validFrom && draft.validUntil && draft.validUntil < draft.validFrom) {
    errors.validUntil = "End date must follow start date";
  }

  if (draft.type === "direct-buy") {
    if (!draft.sku.trim()) errors.sku = "Required";
    if (Number(draft.price) <= 0) errors.price = "Enter a positive price";
    if (!draft.fulfilment.trim()) errors.fulfilment = "Required";
    if (draft.activationMode === "webhook") {
      try {
        if (new URL(draft.webhookUrl).protocol !== "https:") throw new Error();
      } catch {
        errors.webhookUrl = "Use a valid HTTPS URL";
      }
      if (Number(draft.activationSla) <= 0) {
        errors.activationSla = "Enter a positive SLA";
      }
    }
  }

  if (draft.type === "lead-gen") {
    if (!draft.productDescription.trim()) errors.productDescription = "Required";
    if (Number(draft.contactSla) <= 0) errors.contactSla = "Enter a positive SLA";
  }

  if (draft.type === "financial" || draft.type === "linked") {
    if (!draft.disclosures.trim()) errors.disclosures = "Required";
    if (!draft.mitcFile.toLowerCase().endsWith(".pdf")) {
      errors.mitcFile = "Upload the MITC as a PDF";
    }
    if (!draft.dpdpConsent || !draft.complianceSignoff) {
      errors.compliance = "Confirm consent and compliance";
    }
  }

  if (draft.type === "linked") {
    if (!draft.deviceSku.trim()) errors.deviceSku = "Required";
    if (Number(draft.devicePrice) <= 0) errors.devicePrice = "Enter a positive price";
    if (Number(draft.inventory) < 1) errors.inventory = "Enter available inventory";
    if (!draft.deviceFulfilment.trim()) errors.deviceFulfilment = "Required";
  }

  if (draft.type !== "direct-buy") {
    const invalidQuestion = draft.questions.some(
      (question) =>
        !question.label.trim() ||
        (question.type === "single-select" && question.options.filter(Boolean).length < 2),
    );
    if (draft.questions.length > 5 || invalidQuestion) {
      errors.questions = "Review the custom question configuration";
    }
  }

  return errors;
}

export function firstErrorSection(errors: Errors): OfferSectionId {
  const first = Object.keys(errors)[0];
  return sectionForField[first] ?? "overview";
}

function CreationHeader({ type }: { type: OfferType }) {
  return (
    <div className="border-b bg-background px-4 py-4 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Offer type</span>
          <ChevronRightIcon className="size-3" />
          <span className="text-foreground">{offerTypeMeta[type].title}</span>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
  required = true,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-[11px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SectionCard({
  id,
  title,
  description,
  tags,
  invalid,
  children,
}: {
  id: OfferSectionId;
  title: string;
  description: string;
  tags?: string[];
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      id={`section-${id}`}
      data-offer-section={id}
      className={cn(
        "scroll-mt-40 gap-0 overflow-hidden py-0 shadow-none",
        invalid && "border-destructive/40",
      )}
    >
      <CardHeader className="flex-row items-center justify-between border-b bg-muted/15 px-4 py-4">
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="mt-1 text-xs">{description}</CardDescription>
        </div>
        {tags?.length ? (
          <div className="hidden flex-wrap justify-end gap-1 sm:flex">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-background text-[10px] font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 md:p-5">{children}</CardContent>
    </Card>
  );
}

function Upload({
  id,
  label,
  value,
  set,
  error,
  pdf = false,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  set: (value: string) => void;
  error?: string;
  pdf?: boolean;
  required?: boolean;
}) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      <label
        className={cn(
          "flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 hover:bg-muted/30",
          error && "border-destructive",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          {value ? <ImageIcon className="size-4" /> : <UploadCloudIcon className="size-4" />}
        </span>
        <span className="min-w-0 truncate text-xs font-medium">
          {value || "Drop files here or browse files"}
          <small className="block font-normal text-muted-foreground">
            {pdf ? "PDF document" : "JPG or PNG · Max 20 MB"}
          </small>
        </span>
        <input
          id={id}
          className="sr-only"
          type="file"
          accept={pdf ? "application/pdf" : "image/*"}
          {...fieldA11y(id, undefined, error)}
          onChange={(event) => set(event.target.files?.[0]?.name || value)}
        />
      </label>
    </Field>
  );
}

export function OfferTypeSelection({
  partnerId,
  selected,
  setSelected,
  onBack,
  onContinue,
}: {
  partnerId: PartnerId;
  selected: OfferType;
  setSelected: (type: OfferType) => void;
  onBack: () => void;
  onContinue: (type: OfferType) => void;
}) {
  const allowed = partnerProfiles[partnerId].availableOfferTypes;

  return (
    <>
      <div className="border-b bg-background px-4 py-5 md:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs text-muted-foreground">Offers / New offer</p>
          <h1 className="mt-1 text-xl font-semibold">Choose an offer type</h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-7 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeftIcon /> Back
          </Button>
          <Button
            size="lg"
            className={primary}
            onClick={() =>
              allowed.includes(selected)
                ? onContinue(selected)
                : toast.info("Switch demo accounts to use this offer type.")
            }
          >
            Continue <ArrowRightIcon />
          </Button>
        </div>
        <h2 className="text-2xl font-semibold">What kind of offer are you building?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the merchant outcome first. Your two-step setup begins after this decision.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {(Object.keys(offerTypeMeta) as OfferType[]).map((id) => {
            const meta = offerTypeMeta[id];
            const Icon = offerIcons[id];
            const active = id === selected;
            const available = allowed.includes(id);
            return (
              <button
                type="button"
                key={id}
                aria-pressed={active}
                onClick={() => {
                  setSelected(id);
                  if (!available) toast.info("This journey belongs to the other demo account.");
                }}
                className={cn(
                  "relative rounded-xl border bg-background p-5 text-left transition",
                  active
                    ? "border-[#8fa491] bg-accent/15 shadow-sm"
                    : "hover:border-foreground/30",
                  !available && "opacity-60",
                )}
              >
                <div className="flex gap-4 pr-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <b>{meta.title}</b>
                      <Badge variant="outline" className="text-[10px]">
                        {available ? meta.eyebrow : "Switch account"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{meta.description}</p>
                    <p className="mt-4 text-[10px] uppercase text-muted-foreground">Good for</p>
                    <p className="mt-1 text-xs">{meta.goodFor}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "absolute right-4 top-4 size-5 rounded-full border",
                    active && "border-[6px] border-[#1f3a22]",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function QuestionDesigner({ draft, setDraft, error }: { draft: OfferDraft; setDraft: DraftSetter; error?: string }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CustomQuestion | null>(null);
  const [label, setLabel] = React.useState("");
  const [kind, setKind] = React.useState<QuestionType>("short-text");
  const [required, setRequired] = React.useState(false);
  const [options, setOptions] = React.useState("");

  const launch = (question?: CustomQuestion) => {
    setEditing(question ?? null);
    setLabel(question?.label ?? "");
    setKind(question?.type ?? "short-text");
    setRequired(question?.required ?? false);
    setOptions(question?.options.join("\n") ?? "");
    setOpen(true);
  };

  const save = () => {
    const parsedOptions = options
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);
    if (!label.trim() || (kind === "single-select" && parsedOptions.length < 2)) {
      toast.error("Add a label and at least two single-select options.");
      return;
    }
    const question: CustomQuestion = {
      id: editing?.id ?? `q-${Date.now()}`,
      label: label.trim(),
      type: kind,
      required,
      options: kind === "single-select" ? parsedOptions : [],
    };
    setDraft({
      ...draft,
      questions: editing
        ? draft.questions.map((item) => (item.id === editing.id ? question : item))
        : [...draft.questions, question],
    });
    setOpen(false);
  };

  const move = (index: number, direction: number) => {
    const questions = [...draft.questions];
    if (!questions[index + direction]) return;
    [questions[index], questions[index + direction]] = [
      questions[index + direction],
      questions[index],
    ];
    setDraft({ ...draft, questions });
  };

  return (
    <>
      <SectionCard
        id="interest-form"
        title="Merchant form"
        description="Choose what Pine collects before the merchant reaches your team."
        tags={[`${draft.questions.length} of 5 custom questions`]}
        invalid={Boolean(error)}
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium">Pine standard fields · locked</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {lockedFields.map((field) => (
                  <div key={field} className="flex items-center gap-2 rounded-lg bg-muted/45 p-2 text-xs">
                    <CheckIcon className="size-3 text-[#1f3a22]" /> {field}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium">Custom questions</p>
                  <p className="text-[11px] text-muted-foreground">Reorder, edit, or remove questions.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={draft.questions.length >= 5}
                  onClick={() => launch()}
                >
                  Add question
                </Button>
              </div>
              <div className="space-y-2">
                {draft.questions.map((question, index) => (
                  <div key={question.id} className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-xs">{question.label}</b>
                      <small className="text-muted-foreground">
                        {question.type === "single-select" ? "Single select" : "Short text"} ·{" "}
                        {question.required ? "Required" : "Optional"}
                      </small>
                    </div>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Move ${question.label} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Move ${question.label} down`}
                      disabled={index === draft.questions.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDownIcon />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => launch(question)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Remove ${question.label}`}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          questions: draft.questions.filter((item) => item.id !== question.id),
                        })
                      }
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                ))}
              </div>
              {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
            </div>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <p className="text-xs font-semibold">Form preview</p>
            <div className="mt-3 space-y-3">
              {["Business name *", "Contact person *", "Mobile *", ...draft.questions.map((q) => `${q.label}${q.required ? " *" : ""}`)].map(
                (field) => (
                  <div key={field}>
                    <Label className="text-[11px]">{field}</Label>
                    <div className="mt-1 h-8 rounded-md border bg-background" />
                  </div>
                ),
              )}
              <p className="rounded-lg bg-background p-3 text-[10px] text-muted-foreground">
                I agree to share my details with {partnerProfiles[draft.partnerId].name}.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} question</DialogTitle>
            <DialogDescription>Configure a field for the merchant form.</DialogDescription>
          </DialogHeader>
          <Field id="question-label" label="Question">
            <Input
              id="question-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="e.g. What is your monthly turnover?"
            />
          </Field>
          <Field id="question-type" label="Response type">
            <Select value={kind} onValueChange={(value) => setKind(value as QuestionType)}>
              <SelectTrigger id="question-type" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short-text">Short text</SelectItem>
                <SelectItem value="single-select">Single select</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {kind === "single-select" ? (
            <Field id="question-options" label="Options" hint="Add one option per line.">
              <Textarea
                id="question-options"
                value={options}
                onChange={(event) => setOptions(event.target.value)}
                placeholder="Add one option per line, e.g. Below ₹5L"
                {...fieldA11y("question-options", "Add one option per line.")}
              />
            </Field>
          ) : null}
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} />
            Required
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" className={primary} onClick={save}>Save question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductSections({ draft, update, errors }: { draft: OfferDraft; update: (key: keyof OfferDraft, value: unknown) => void; errors: Errors }) {
  const input = (key: keyof OfferDraft, label: string, type = "text") => {
    const id = String(key);
    const guidance = fieldGuidance[key];
    const error = errors[id];

    return (
      <Field id={id} label={label} error={error} hint={guidance?.hint}>
        <Input
          id={id}
          type={type}
          value={String(draft[key])}
          placeholder={guidance?.placeholder}
          {...fieldA11y(id, guidance?.hint, error)}
          onChange={(event) => update(key, event.target.value)}
        />
      </Field>
    );
  };

  if (draft.type === "direct-buy") {
    return (
      <SectionCard id="fulfilment" title="Product & fulfilment" description="Configure the product, price, and activation." tags={["SKU", "Price", "Activation"]}>
        <div className="grid gap-4 md:grid-cols-3">
          {input("sku", "Product SKU")}
          {input("price", "Price (₹)", "number")}
          {input("fulfilment", "Fulfilment type")}
          <div className="space-y-2 md:col-span-3">
            <Label className="text-xs">Activation mode <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {[
                ["immediate", "Auto-activate immediately"],
                ["webhook", "Wait for webhook callback"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                  <input type="radio" checked={draft.activationMode === value} onChange={() => update("activationMode", value)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
          {draft.activationMode === "webhook" ? (
            <>
              {input("webhookUrl", "Webhook URL")}
              {input("activationSla", "Activation SLA (hours)", "number")}
            </>
          ) : null}
        </div>
      </SectionCard>
    );
  }

  if (draft.type === "lead-gen") {
    return (
      <SectionCard id="fulfilment" title="Product & follow-up" description="Explain the product and set the merchant contact expectation." tags={["Description", "SLA"]}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field id="productDescription" label="Product description" error={errors.productDescription} hint={fieldGuidance.productDescription?.hint}>
              <Textarea
                id="productDescription"
                value={draft.productDescription}
                placeholder={fieldGuidance.productDescription?.placeholder}
                {...fieldA11y("productDescription", fieldGuidance.productDescription?.hint, errors.productDescription)}
                onChange={(event) => update("productDescription", event.target.value)}
              />
            </Field>
          </div>
          {input("postTrialPrice", "Post-trial price")}
          {input("contactSla", "Contact SLA (hours)", "number")}
        </div>
      </SectionCard>
    );
  }

  const compliance = (
    <SectionCard id="compliance" title="Consent & compliance" description="Attach the MITC and confirm regulatory readiness." tags={["DPDP", "MITC", "Sign-off"]} invalid={Boolean(errors.compliance || errors.mitcFile)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Upload id="mitcFile" label="MITC PDF" value={draft.mitcFile} set={(value) => update("mitcFile", value)} error={errors.mitcFile} pdf />
        <div className="space-y-2">
          {[
            ["dpdpConsent", "Attach DPDP consent"],
            ["complianceSignoff", "I confirm regulatory disclosures are accurate"],
          ].map(([key, label]) => (
            <label key={key} className="flex gap-3 rounded-lg border p-3 text-xs">
              <input type="checkbox" checked={Boolean(draft[key as keyof OfferDraft])} onChange={(event) => update(key as keyof OfferDraft, event.target.checked)} />
              {label}
            </label>
          ))}
          {errors.compliance ? <p className="text-xs text-destructive">{errors.compliance}</p> : null}
        </div>
      </div>
    </SectionCard>
  );

  if (draft.type === "financial") {
    return (
      <>
        <SectionCard id="bundle-terms" title="Regulated entity & product terms" description="Name the entity, pricing, and required RBI disclosures." tags={["RBI", "Credit terms"]} invalid={Boolean(errors.disclosures)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/20 p-3 text-sm md:col-span-2">
              <b>{draft.regulatedEntity}</b>
              <small className="block text-muted-foreground">{draft.licence} · CIN {draft.cin}</small>
            </div>
            {input("sku", "Product SKU")}
            {input("productFamily", "Product family")}
            {input("interestRange", "Interest range")}
            {input("creditCeiling", "Credit ceiling", "number")}
            <div className="md:col-span-2">
              <Field id="disclosures" label="RBI LSP disclosures" error={errors.disclosures} hint={fieldGuidance.disclosures?.hint}>
                <Textarea
                  id="disclosures"
                  value={draft.disclosures}
                  placeholder={fieldGuidance.disclosures?.placeholder}
                  {...fieldA11y("disclosures", fieldGuidance.disclosures?.hint, errors.disclosures)}
                  onChange={(event) => update("disclosures", event.target.value)}
                />
              </Field>
            </div>
          </div>
        </SectionCard>
        {compliance}
      </>
    );
  }

  return (
    <>
      <SectionCard id="fulfilment" title="Leg A — Device" description="Configure the transactional device leg fulfilled by Pine." tags={["Device", "Inventory"]}>
        <div className="grid gap-4 md:grid-cols-2">
          {input("deviceSku", "Device SKU")}
          {input("devicePrice", "Price (₹)", "number")}
          {input("inventory", "Inventory", "number")}
          {input("deviceFulfilment", "Fulfilment")}
        </div>
      </SectionCard>
      <SectionCard id="bundle-terms" title="Leg B — Account" description="Set the regulated account terms and bundle completion rule." tags={["Account", "Settlement"]} invalid={Boolean(errors.disclosures)}>
        <div className="mb-4 rounded-lg border bg-muted/20 p-3 text-sm">
          <b>{draft.regulatedEntity}</b>
          <small className="block text-muted-foreground">Interest {draft.interestRange} · ceiling ₹{money(draft.creditCeiling)}</small>
        </div>
        <Field id="disclosures" label="RBI disclosures" error={errors.disclosures} hint={fieldGuidance.disclosures?.hint}>
          <Textarea
            id="disclosures"
            value={draft.disclosures}
            placeholder={fieldGuidance.disclosures?.placeholder}
            {...fieldA11y("disclosures", fieldGuidance.disclosures?.hint, errors.disclosures)}
            onChange={(event) => update("disclosures", event.target.value)}
          />
        </Field>
        <div className="mt-4 space-y-2">
          <Label className="text-xs">Activation gate</Label>
          {[
            ["both", "Both legs complete (recommended)"],
            ["account", "Account only"],
            ["device", "Device only"],
          ].map(([value, label]) => (
            <label key={value} className="flex gap-2 rounded-lg border p-3 text-xs">
              <input type="radio" checked={draft.activationGate === value} onChange={() => update("activationGate", value)} />
              {label}
            </label>
          ))}
        </div>
      </SectionCard>
      {compliance}
    </>
  );
}

export function OfferDetails({
  draft,
  setDraft,
  initialSection,
  restoreScrollY,
  onBack,
  onContinue,
  onRememberScroll,
}: {
  draft: OfferDraft;
  setDraft: DraftSetter;
  initialSection?: OfferSectionId;
  restoreScrollY: number;
  onBack: () => void;
  onContinue: () => void;
  onRememberScroll: (scrollY: number) => void;
}) {
  const [errors, setErrors] = React.useState<Errors>({});

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (initialSection) {
        document.getElementById(`section-${initialSection}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        const firstControl = document.querySelector<HTMLElement>(
          `[data-offer-section="${initialSection}"] input, [data-offer-section="${initialSection}"] textarea, [data-offer-section="${initialSection}"] button`,
        );
        firstControl?.focus({ preventScroll: true });
      } else if (restoreScrollY > 0) {
        window.scrollTo({ top: restoreScrollY });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialSection, restoreScrollY]);

  const update = (key: keyof OfferDraft, value: unknown) => {
    setDraft({ ...draft, [key]: value });
    if (errors[String(key)]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[String(key)];
        return next;
      });
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateOfferDraft(draft);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      toast.error("Check the highlighted fields before previewing your offer.");
      const section = firstErrorSection(nextErrors);
      document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.requestAnimationFrame(() => document.getElementById(first)?.focus());
      return;
    }
    onRememberScroll(window.scrollY);
    onContinue();
  };

  const profile = partnerProfiles[draft.partnerId];

  return (
    <>
      <CreationHeader type={draft.type} />
      <form id="offer-details" onSubmit={submit} className="mx-auto max-w-[1240px] px-4 py-7 md:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Back to offer type">
              <ArrowLeftIcon />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{draft.offerName || `New ${offerTypeMeta[draft.type].title} offer`}</h1>
              <p className="mt-1 text-xs text-muted-foreground">Step 1 of 2 · Add the campaign details</p>
            </div>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button type="button" variant="outline" onClick={() => toast.success("Draft saved for this session.")}>Save draft</Button>
            <Button type="submit" className={primary}>Continue to preview <ArrowRightIcon /></Button>
          </div>
        </div>

        {draft.rejectionNote ? (
          <p className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive" role="alert">
            Fix before resubmitting: {draft.rejectionNote}
          </p>
        ) : null}

        <div className="space-y-4">
          <SectionCard id="overview" title="Offer overview" description="What merchants see first on the marketplace." tags={["Marketplace content"]} invalid={Boolean(errors.offerName || errors.category || errors.headline || errors.benefit)}>
            <div className="grid gap-4 md:grid-cols-3">
              {([
                ["offerName", "Offer name"],
                ["category", "Category"],
                ["headline", "Headline"],
                ["benefit", "Subheader / Benefit"],
              ] as const).map(([key, label]) => (
                <Field
                  key={key}
                  id={key}
                  label={label}
                  error={errors[key]}
                  hint={fieldGuidance[key]?.hint}
                >
                  <Input
                    id={key}
                    value={draft[key]}
                    placeholder={fieldGuidance[key]?.placeholder}
                    {...fieldA11y(key, fieldGuidance[key]?.hint, errors[key])}
                    onChange={(event) => update(key, event.target.value)}
                  />
                </Field>
              ))}
            </div>
          </SectionCard>

          <ProductSections draft={draft} update={update} errors={errors} />

          <SectionCard id="assets" title="Visual assets" description="Upload the brand and campaign artwork merchants will see." tags={["Logo", "Offer creative"]} invalid={Boolean(errors.heroCreative)}>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-xs">Company logo <span className="text-destructive">*</span></Label>
                <div className="mt-1.5 flex min-h-16 items-center gap-3 rounded-lg border p-3">
                  <Avatar><AvatarFallback className="bg-[#1f3a22] text-white">{profile.initials}</AvatarFallback></Avatar>
                  <span className="text-xs font-medium">{profile.name}<small className="block font-normal text-muted-foreground">From Marketplace profile</small></span>
                </div>
              </div>
              <Upload id="productMark" label="Product image" value={draft.productMark} set={(value) => update("productMark", value)} required={false} />
              <Upload id="heroCreative" label="Hero creative" value={draft.heroCreative} set={(value) => update("heroCreative", value)} error={errors.heroCreative} />
            </div>
          </SectionCard>

          <SectionCard id="validity" title="Validity & T&Cs" description="Set the offer window and merchant-facing terms." tags={["Offer window", "Merchant terms"]} invalid={Boolean(errors.validFrom || errors.validUntil || errors.terms || draft.rejectionNote)}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field id="validFrom" label="Valid from" error={errors.validFrom}>
                <Input
                  id="validFrom"
                  type="date"
                  value={draft.validFrom}
                  {...fieldA11y("validFrom", undefined, errors.validFrom)}
                  onChange={(event) => update("validFrom", event.target.value)}
                />
              </Field>
              <Field id="validUntil" label="Valid until" error={errors.validUntil}>
                <Input
                  id="validUntil"
                  type="date"
                  value={draft.validUntil}
                  {...fieldA11y("validUntil", undefined, errors.validUntil)}
                  onChange={(event) => update("validUntil", event.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field id="terms" label="Terms & Conditions" error={errors.terms} hint={fieldGuidance.terms?.hint}>
                  <Textarea
                    id="terms"
                    value={draft.terms}
                    placeholder={fieldGuidance.terms?.placeholder}
                    {...fieldA11y("terms", fieldGuidance.terms?.hint, errors.terms)}
                    onChange={(event) => update("terms", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {draft.type !== "direct-buy" ? <QuestionDesigner draft={draft} setDraft={setDraft} error={errors.questions} /> : null}
        </div>

        <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t pt-5 sm:flex-row">
          <Button type="button" variant="ghost" onClick={onBack}><ArrowLeftIcon /> Back to offer type</Button>
          <div className="flex gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => toast.success("Draft saved for this session.")}>Save draft</Button>
            <Button type="submit" className={primary}>Continue to preview <ArrowRightIcon /></Button>
          </div>
        </div>
      </form>
    </>
  );
}

function MerchantFormPreview({ draft }: { draft: OfferDraft }) {
  return (
    <div className="space-y-4 overflow-y-auto px-4 pb-6">
      <div className="rounded-xl bg-[#eef5df] p-4">
        <Badge variant="outline" className="bg-background">{offerTypeMeta[draft.type].title}</Badge>
        <h3 className="mt-3 text-lg font-semibold">{draft.headline}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{draft.benefit}</p>
      </div>
      {["Business name", "Contact person", "Mobile", "Email", "GST / PAN", "City"].map((field) => (
        <Field key={field} id={`preview-${field}`} label={field} required={["Business name", "Contact person", "Mobile"].includes(field)}>
          <Input id={`preview-${field}`} disabled placeholder="Merchant response" />
        </Field>
      ))}
      {draft.questions.map((question) => (
        <Field key={question.id} id={`preview-${question.id}`} label={question.label} required={question.required}>
          {question.type === "single-select" ? (
            <Select disabled><SelectTrigger className="w-full"><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent>{question.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>
          ) : (
            <Input id={`preview-${question.id}`} disabled placeholder="Merchant response" />
          )}
        </Field>
      ))}
      <label className="flex gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <input type="checkbox" disabled />
        I agree to share my details with {partnerProfiles[draft.partnerId].name}.
      </label>
      <Button disabled className={cn("w-full", primary)}>Submit application</Button>
      <p className="text-center text-[10px] text-muted-foreground">Preview only · No information will be submitted</p>
    </div>
  );
}

function EditButton({ section, onEdit }: { section: OfferSectionId; onEdit: (section: OfferSectionId) => void }) {
  return (
    <Button variant="outline" size="sm" className="bg-background/95" onClick={() => onEdit(section)}>
      <PencilIcon /> Edit
    </Button>
  );
}

function MarketplaceCard({ draft, onEdit, onOpen }: { draft: OfferDraft; onEdit: (section: OfferSectionId) => void; onOpen: () => void }) {
  const profile = partnerProfiles[draft.partnerId];
  const price = draft.type === "linked" ? draft.devicePrice : draft.price;
  return (
    <div className="rounded-2xl border bg-[#f6f6f1] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Pine Marketplace · Preview</p>
            <h2 className="mt-1 text-2xl font-semibold">Offers for your business</h2>
          </div>
          <div className="relative w-full sm:max-w-xs"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input readOnly placeholder="Search offers" className="bg-background pl-9" /></div>
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {["All", "Billing & POS", "Finance", "Growth", "Operations"].map((item, index) => <Badge key={item} variant={index === 0 ? "default" : "outline"} className="whitespace-nowrap">{item}</Badge>)}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden py-0 shadow-md md:col-span-2 lg:col-span-1">
            <div className="absolute right-3 top-3 z-10"><EditButton section="overview" onEdit={onEdit} /></div>
            <div className="flex min-h-48 items-center justify-center bg-[#e9f4d4]">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#1f3a22] text-2xl font-bold text-white">{profile.initials}</div>
            </div>
            <CardContent className="p-5">
              <Badge variant="outline">{offerTypeMeta[draft.type].title}</Badge>
              <p className="mt-4 text-[11px] text-muted-foreground">{profile.name} · {draft.category}</p>
              <h3 className="mt-2 text-lg font-semibold">{draft.headline}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{draft.benefit}</p>
              <Separator className="my-5" />
              <div className="flex items-end justify-between gap-3">
                {price ? <div><small className="block text-muted-foreground">Offer price</small><b className="text-lg">₹{money(price)}</b></div> : <span />}
                <Button className={primary} onClick={onOpen}>View offer</Button>
              </div>
            </CardContent>
          </Card>
          {["Business insurance", "Smart inventory"].map((title) => (
            <Card key={title} className="hidden overflow-hidden py-0 opacity-50 md:block">
              <div className="h-36 bg-muted" />
              <CardContent className="p-4"><Badge variant="outline">Suggested</Badge><h3 className="mt-3 font-medium">{title}</h3><p className="mt-2 text-xs text-muted-foreground">Marketplace context card</p></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailsPage({ draft, onEdit, onApply }: { draft: OfferDraft; onEdit: (section: OfferSectionId) => void; onApply: () => void }) {
  const profile = partnerProfiles[draft.partnerId];
  const price = draft.type === "linked" ? draft.devicePrice : draft.price;
  const cta = draft.type === "direct-buy" ? "Buy now" : draft.type === "lead-gen" ? "I’m interested" : draft.type === "financial" ? "Apply · takes 2 min" : "Reserve device + Apply";
  return (
    <div className="overflow-hidden rounded-2xl border bg-background">
      <div className="relative bg-[#e9f4d4] px-5 py-12 md:px-10 md:py-16">
        <div className="absolute right-4 top-4"><EditButton section="assets" onEdit={onEdit} /></div>
        <div className="mx-auto grid max-w-5xl gap-7 md:grid-cols-[1fr_320px] md:items-center">
          <div>
            <div className="mb-5 flex items-center gap-3"><Avatar><AvatarFallback className="bg-[#1f3a22] text-white">{profile.initials}</AvatarFallback></Avatar><span className="text-sm font-medium">{profile.name}</span></div>
            <Badge variant="outline" className="bg-background/70">{offerTypeMeta[draft.type].title}</Badge>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">{draft.headline}</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">{draft.benefit}</p>
          </div>
          <Card className="shadow-lg"><CardContent><p className="text-xs text-muted-foreground">Available until {formatDate(draft.validUntil)}</p>{price ? <p className="mt-3 text-2xl font-semibold">₹{money(price)}</p> : null}<Button className={cn("mt-5 w-full", primary)} onClick={onApply}>{cta}</Button><p className="mt-3 text-center text-[10px] text-muted-foreground">Securely powered by Pine Labs</p></CardContent></Card>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 md:grid-cols-[1fr_300px] md:px-10 md:py-12">
        <div className="space-y-8">
          <section className="relative rounded-xl border p-5"><div className="absolute right-3 top-3"><EditButton section="overview" onEdit={onEdit} /></div><h3 className="pr-20 text-lg font-semibold">About this offer</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{draft.productDescription || draft.benefit}</p></section>
          <section className="relative rounded-xl border p-5"><div className="absolute right-3 top-3"><EditButton section={draft.type === "financial" || draft.type === "linked" ? "bundle-terms" : "fulfilment"} onEdit={onEdit} /></div><h3 className="pr-20 text-lg font-semibold">How it works</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{["Choose the offer", draft.type === "direct-buy" ? "Pay securely" : "Share your details", draft.type === "direct-buy" ? "Get activated" : "Partner follows up"].map((step, index) => <div key={step} className="rounded-lg bg-muted/40 p-3 text-xs"><span className="mb-2 flex size-6 items-center justify-center rounded-full bg-[#1f3a22] text-[10px] text-white">{index + 1}</span>{step}</div>)}</div></section>
          <section className="relative rounded-xl border p-5"><div className="absolute right-3 top-3"><EditButton section="validity" onEdit={onEdit} /></div><h3 className="pr-20 text-lg font-semibold">Terms & conditions</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{draft.terms}</p></section>
        </div>
        <aside className="space-y-4"><Card className="shadow-none"><CardContent><p className="text-xs font-medium">Offer summary</p><dl className="mt-4 space-y-3 text-xs"><div><dt className="text-muted-foreground">Category</dt><dd className="mt-1 font-medium">{draft.category}</dd></div><div><dt className="text-muted-foreground">Validity</dt><dd className="mt-1 font-medium">{formatDate(draft.validFrom)} – {formatDate(draft.validUntil)}</dd></div><div><dt className="text-muted-foreground">Fulfilment</dt><dd className="mt-1 font-medium">{draft.type === "linked" ? draft.deviceFulfilment : draft.fulfilment || "Partner follow-up"}</dd></div></dl></CardContent></Card><div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground">Track progress at any time from My deals.</div></aside>
      </div>
    </div>
  );
}

export function OfferPreview({
  draft,
  onBack,
  onEdit,
  onPublish,
}: {
  draft: OfferDraft;
  onBack: () => void;
  onEdit: (section: OfferSectionId) => void;
  onPublish: () => void;
}) {
  const [mode, setMode] = React.useState<"card" | "detail">("card");
  const [formOpen, setFormOpen] = React.useState(false);

  const openJourney = () => {
    if (mode === "card") {
      setMode("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (draft.type === "direct-buy") {
      toast.info("Checkout is disabled in preview mode.");
    } else {
      setFormOpen(true);
    }
  };

  return (
    <>
      <CreationHeader type={draft.type} />
      <div className="sticky top-16 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeftIcon /> Back to edit</Button>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{draft.offerName}</p><p className="text-[11px] text-muted-foreground">Step 2 of 2 · Preview as a merchant</p></div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="md:hidden" />}><PencilIcon /> Edit section</DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuLabel>Return to details</DropdownMenuLabel>{(Object.keys(sectionLabels) as OfferSectionId[]).filter((section) => draft.type !== "direct-buy" || section !== "interest-form").map((section) => <DropdownMenuItem key={section} onClick={() => onEdit(section)}>{sectionLabels[section]}</DropdownMenuItem>)}</DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => toast.success("Draft saved for this session.")}>Save draft</Button>
          <Button size="sm" className={primary} onClick={onPublish}><GiftIcon /> Publish offer</Button>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-semibold">Campaign preview</h1><p className="mt-1 text-sm text-muted-foreground">Review the complete merchant experience before publishing.</p></div>
          <Tabs value={mode} onValueChange={(value) => setMode(value as "card" | "detail")}>
            <TabsList><TabsTrigger value="card"><LayoutGridIcon /> Offer card</TabsTrigger><TabsTrigger value="detail"><ListChecksIcon /> Details page</TabsTrigger></TabsList>
          </Tabs>
        </div>
        <Tabs value={mode} onValueChange={(value) => setMode(value as "card" | "detail")}>
          <TabsContent value="card"><MarketplaceCard draft={draft} onEdit={onEdit} onOpen={openJourney} /></TabsContent>
          <TabsContent value="detail"><DetailsPage draft={draft} onEdit={onEdit} onApply={openJourney} /></TabsContent>
        </Tabs>
      </div>

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="!w-full sm:!max-w-xl">
          <SheetHeader className="border-b">
            <SheetTitle>Merchant {draft.type === "financial" ? "application" : "interest"} form</SheetTitle>
            <SheetDescription>This is the exact form opened by the campaign CTA.</SheetDescription>
          </SheetHeader>
          <MerchantFormPreview draft={draft} />
        </SheetContent>
      </Sheet>
    </>
  );
}
