import { ShieldCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statuses = [
  { label: "Success", dot: "bg-success" },
  { label: "Warning", dot: "bg-warning" },
  { label: "Destructive", dot: "bg-destructive" },
  { label: "Info", dot: "bg-info" },
];

// Token smoke test: verifies token wiring, font loading and production-build
// safety. Deliberately plain; not a product screen.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-foreground">
          <ShieldCheckIcon className="size-5 text-accent" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Token smoke test
          </h1>
          <p className="text-sm text-muted-foreground">
            Verifies design tokens, font loading and production build.
          </p>
        </div>
      </header>

      <section aria-labelledby="type" className="flex flex-col gap-2">
        <h2 id="type" className="text-sm font-medium text-muted-foreground">
          Type scale
        </h2>
        <p className="text-2xl text-foreground">Foreground large</p>
        <p className="text-base text-foreground">Foreground medium</p>
        <p className="text-xs text-foreground">Foreground small</p>
        <p className="text-2xl text-muted-foreground">Muted large</p>
        <p className="text-base text-muted-foreground">Muted medium</p>
        <p className="text-xs text-muted-foreground">Muted small</p>
      </section>

      <section aria-labelledby="surfaces" className="flex flex-col gap-3">
        <h2 id="surfaces" className="text-sm font-medium text-muted-foreground">
          Surfaces
        </h2>

        <div>
          <Button className="rounded-full bg-accent-strong px-5 text-accent-foreground hover:bg-accent-strong/80">
            Accent pill button
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Card surface</CardTitle>
            <CardDescription>Uses the card and card-foreground tokens.</CardDescription>
          </CardHeader>
        </Card>

        <div className="rounded-lg border border-accent-strong bg-accent p-4 text-accent-foreground">
          <p className="text-sm font-medium">Selected block</p>
          <p className="text-xs">Highlighted with the accent token.</p>
        </div>

        <Card className="border border-border ring-0">
          <CardHeader>
            <CardTitle>Bordered card</CardTitle>
            <CardDescription>Uses the border token instead of a ring.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Muted body copy inside a bordered card.
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="status" className="flex flex-col gap-3">
        <h2 id="status" className="text-sm font-medium text-muted-foreground">
          Status
        </h2>
        <div className="flex flex-wrap gap-2">
          {statuses.map(({ label, dot }) => (
            <Badge key={label} variant="outline" className="h-6 gap-1.5 px-2.5">
              <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />
              {label}
            </Badge>
          ))}
        </div>
      </section>
    </main>
  );
}
