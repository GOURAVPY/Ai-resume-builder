"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

// Small Material 3 building blocks shared by the dashboard pages.

export function Icon({ name, filled, className = "" }: { name: string; filled?: boolean; className?: string }) {
  return <span className={`icon ${filled ? "icon-filled" : ""} ${className}`}>{name}</span>;
}

type ButtonVariant = "filled" | "tonal" | "outlined" | "text";

const buttonStyles: Record<ButtonVariant, string> = {
  filled: "bg-primary text-on-primary hover:shadow-md disabled:bg-on-surface/12 disabled:text-on-surface/38 disabled:shadow-none",
  tonal: "bg-secondary-container text-on-secondary-container hover:shadow-sm disabled:bg-on-surface/12 disabled:text-on-surface/38",
  outlined: "border border-outline-variant text-on-surface-variant hover:bg-on-surface-variant/8 disabled:text-on-surface/38",
  text: "text-primary hover:bg-primary/8 disabled:text-on-surface/38",
};

export function buttonClass(variant: ButtonVariant = "filled", extra = "") {
  return `inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-[border-radius,box-shadow,background-color] duration-150 active:rounded-lg disabled:pointer-events-none ${buttonStyles[variant]} ${extra}`;
}

export function Button({
  variant = "filled",
  icon,
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: string }) {
  return (
    <button type="button" className={buttonClass(variant, className)} {...props}>
      {icon && <Icon name={icon} className="-ml-2 text-[18px]" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "filled",
  icon,
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  icon?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {icon && <Icon name={icon} className="-ml-2 text-[18px]" />}
      {children}
    </Link>
  );
}

// M3 segmented buttons, used for the page-level filters (e.g. All jobs / Saved).
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number; disabled?: boolean }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex h-10 overflow-hidden rounded-full border border-outline">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            disabled={o.disabled}
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`flex items-center gap-1.5 whitespace-nowrap border-r border-outline px-4 text-sm font-medium last:border-r-0 disabled:text-on-surface/38 ${
              active ? "bg-secondary-container text-on-secondary-container" : "text-on-surface hover:bg-on-surface/8"
            }`}
          >
            {active && <Icon name="check" className="text-[18px]" />}
            {o.label}
            {o.count !== undefined && <span className="text-on-surface-variant">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// M3 outlined text field with a floating label; renders a textarea when `multiline`.
export function TextField({
  label,
  value,
  onChange,
  leadingIcon,
  placeholder,
  required,
  multiline,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  leadingIcon?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  className?: string;
}) {
  const id = useId();
  const field = `peer w-full rounded-[4px] border border-outline bg-transparent text-base text-on-surface caret-primary outline-none placeholder:text-transparent focus:border-2 focus:border-primary focus:placeholder:text-on-surface-variant hover:border-on-surface ${
    leadingIcon ? "pl-12" : "pl-4"
  } pr-4`;
  return (
    <div className={`relative ${className}`}>
      {leadingIcon && (
        <Icon name={leadingIcon} className="pointer-events-none absolute left-3 top-4 text-on-surface-variant" />
      )}
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          placeholder={placeholder ?? " "}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} resize-y py-4`}
        />
      ) : (
        <input
          id={id}
          value={value}
          placeholder={placeholder ?? " "}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} h-14`}
        />
      )}
      <label
        htmlFor={id}
        className={`pointer-events-none absolute top-0 -translate-y-1/2 bg-[var(--field-bg,var(--color-surface))] px-1 text-xs text-on-surface-variant transition-all peer-placeholder-shown:top-7 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary ${
          leadingIcon ? "left-11 peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3" : "left-3"
        }`}
      >
        {label}
        {required && " *"}
      </label>
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const id = useId();
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full appearance-none rounded-[4px] border border-outline bg-transparent px-4 text-base text-on-surface outline-none hover:border-on-surface focus:border-2 focus:border-primary"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-[var(--field-bg,var(--color-surface))] px-1 text-xs text-on-surface-variant"
      >
        {label}
      </label>
      <Icon name="arrow_drop_down" className="pointer-events-none absolute right-3 top-4 text-on-surface-variant" />
    </div>
  );
}

// Upload area for PDF / DOCX resumes; reports the chosen file's name.
export function FileField({ fileName, onFile }: { fileName?: string; onFile: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={`flex h-14 w-full items-center gap-3 rounded-[4px] border border-dashed px-4 text-left transition-colors ${
        dragging ? "border-primary bg-primary/8" : "border-outline hover:border-on-surface"
      }`}
    >
      <Icon name={fileName ? "description" : "upload_file"} className="text-on-surface-variant" />
      <span className={`flex-1 truncate ${fileName ? "text-on-surface" : "text-on-surface-variant"}`}>
        {fileName ?? "Upload PDF or DOCX resume file"}
      </span>
      <input
        ref={input}
        type="file"
        accept=".pdf,.docx"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </button>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-[52px] shrink-0 rounded-full border-2 transition-colors ${
        checked ? "border-primary bg-primary" : "border-outline bg-surface-container"
      }`}
    >
      <span
        className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-all ${
          checked ? "left-[22px] h-6 w-6 bg-on-primary text-primary" : "left-1.5 h-4 w-4 bg-outline"
        }`}
      >
        {checked && <Icon name="check" className="text-[16px]" />}
      </span>
    </button>
  );
}

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors ${
        selected
          ? "bg-secondary-container text-on-secondary-container"
          : "border border-outline text-on-surface-variant hover:bg-on-surface-variant/8"
      }`}
    >
      {selected && <Icon name="check" className="-ml-2 text-[18px]" />}
      {children}
    </button>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-3xl bg-surface-container-low p-6 ${className}`}>{children}</div>;
}

export function PageHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-center gap-3">{children}</div>;
}
