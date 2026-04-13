"use client";

import { EditorShell } from "./EditorShell";
import type { TemplateConfig } from "@/lib/types";

/**
 * Mode 1 stub. The full SVG-DOM editor lands in Phase 6.
 */
export function TemplateEditor({ config }: { config: TemplateConfig }) {
  return (
    <EditorShell
      config={config}
      leftPanel={
        <div className="p-5">
          <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted mb-3">
            Editable fields
          </div>
          <p className="text-[12px] text-text-muted">
            Phase 6 will render an input for each unlocked permission.
          </p>
        </div>
      }
      canvasArea={
        <div className="bg-white border border-card-border rounded-card p-8 max-w-[640px] w-full text-center">
          <div className="text-[12px] text-text-muted">
            Template editor preview — Phase 6 will inject the live SVG here.
          </div>
          <div className="mt-4 text-[11px] text-text-muted">
            Template id: <code>{config.templateId}</code>
          </div>
        </div>
      }
    />
  );
}
