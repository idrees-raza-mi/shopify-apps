"use client";

import { EditorShell } from "./EditorShell";
import type { CanvasConfig } from "@/lib/types";

/**
 * Mode 2 stub. The full Fabric.js canvas editor lands in Phase 7.
 */
export function FreeEditor({ config }: { config: CanvasConfig }) {
  return (
    <EditorShell
      config={config}
      leftPanel={
        <div className="p-5 space-y-3">
          <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted">
            Tools
          </div>
          <div className="bg-form-surface border border-card-border rounded-lg p-3 text-[12px] text-text-muted">
            Upload Design — Phase 7
          </div>
          <div className="bg-form-surface border border-card-border rounded-lg p-3 text-[12px] text-text-muted">
            Add Text — Phase 7
          </div>
        </div>
      }
      canvasArea={
        <div
          className="bg-white border border-card-border rounded-card flex items-center justify-center text-[12px] text-text-muted"
          style={{ width: config.displayW, height: config.displayH }}
        >
          {config.displayW} × {config.displayH} canvas — Fabric.js init in Phase 7
        </div>
      }
    />
  );
}
