"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  label?: string;
}

export function CodeBlock({ code, label = "Command" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-panel rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[hsl(var(--code-muted))]">{label}</p>
        <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <code className="block overflow-x-auto whitespace-pre-wrap break-all text-sm leading-6 text-[hsl(var(--code-foreground))]">
        {code}
      </code>
    </div>
  );
}
