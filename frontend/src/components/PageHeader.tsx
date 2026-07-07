import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ title, eyebrow = "ElectroStore Manager", description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-steel">{eyebrow}</p>
        <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-steel">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
