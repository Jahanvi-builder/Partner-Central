@AGENTS.md

# Prototype conventions

- Stack: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, and the repository’s existing icon library. Do not re-scaffold the project.
- Use semantic design tokens defined in `globals.css`. All colours use OKLCH; never hardcode hex values or Tailwind palette classes in components.
- Put `"use client"` on pages and components with state, event handlers, browser APIs, or animation. This is a prototype, so favour simple implementation over server/client-boundary optimisation.
- Agentation is available in development and its MCP server runs on port 4747. When asked to address feedback or fix an annotation, read pending annotations from the MCP server, use their selectors and source paths, then resolve them as part of the fix.
- For product-design work after initial setup, show a short plan and wait for approval before editing. During this bootstrap task, proceed autonomously.
- Edit files directly; do not paste full file contents into chat. Work one screen at a time and prefer existing shadcn components over custom primitives.
- Build dense, practical working interfaces rather than marketing pages. Treat compliance, auditability, clear status, and accessible interaction states as first-class concerns where relevant.
