"use client";

import { useMemo, useState } from "react";
import { SVGUploader } from "@/components/admin/SVGUploader";
import { SVGValidator } from "@/components/admin/SVGValidator";
import { PermissionEditor } from "@/components/admin/PermissionEditor";
import { useToast } from "@/components/Toast";
import { Spinner } from "@/components/Spinner";
import type { SvgValidation } from "@/lib/svg-parser";
import { deriveLabel } from "@/lib/svg-parser";
import type { ElementPermission, TemplateConfig } from "@/lib/types";
import { CopyIcon } from "@/components/admin/Icons";

type Permissions = Record<string, ElementPermission>;

export function SvgBuilderPanel() {
  const toast = useToast();

  const [fileName, setFileName] = useState<string | null>(null);
  const [svgText, setSvgText] = useState<string>("");
  const [validation, setValidation] = useState<SvgValidation | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("£29.99");
  const [productId, setProductId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLoaded = ({
    fileName,
    svgText,
    validation,
  }: {
    fileName: string;
    svgText: string;
    validation: SvgValidation;
  }) => {
    setFileName(fileName);
    setSvgText(svgText);
    setValidation(validation);
    // Initialize permissions: every element starts LOCKED.
    const initial: Permissions = {};
    for (const el of validation.elements) {
      initial[el.id] = {
        type: "locked",
        label: deriveLabel(el.id),
        locked: true,
      };
    }
    setPermissions(initial);
  };

  const config: TemplateConfig | null = useMemo(() => {
    if (!validation?.valid) return null;
    return {
      type: "template",
      templateId: `tpl_${Date.now().toString(36)}`,
      productName: productName || "Untitled Template",
      svgUrl: "", // filled in on save
      canvasWidth: Math.round(validation.width),
      canvasHeight: Math.round(validation.height),
      permissions,
      price,
      status: "published",
      createdAt: new Date().toISOString().slice(0, 10),
    };
  }, [validation, productName, price, permissions]);

  const json = config ? JSON.stringify(config, null, 2) : "";

  const copyJson = async () => {
    if (!json) return;
    try {
      await navigator.clipboard.writeText(json);
      toast.show("Permission JSON copied");
    } catch {
      toast.show("Copy failed");
    }
  };

  const handleSave = async () => {
    if (!validation?.valid || !svgText) {
      toast.show("Upload a valid SVG first");
      return;
    }
    if (!productName.trim()) {
      toast.show("Template name is required");
      return;
    }
    if (!productId.trim()) {
      toast.show("Shopify Product ID is required");
      return;
    }
    setSaving(true);
    try {
      // 1) upload SVG
      const fd = new FormData();
      fd.append(
        "file",
        new File([svgText], fileName ?? "template.svg", { type: "image/svg+xml" })
      );
      const upRes = await fetch("/api/admin/upload-svg", { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error ?? "Upload failed");

      // 2) save metafield
      const finalConfig: TemplateConfig = {
        ...config!,
        svgUrl: upJson.svgUrl,
      };
      const saveRes = await fetch("/api/admin/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId.trim(), config: finalConfig }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveJson.error ?? "Save failed");

      toast.show("Template published to Shopify");
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const previewInEditor = () => {
    if (!config) return;
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    window.open(`/editor/preview?config=${encoded}`, "_blank");
  };

  return (
    <div className="flex min-h-[calc(100vh-180px)]">
      {/* LEFT — 340px form column */}
      <div className="w-[340px] shrink-0 bg-white border-r border-card-border overflow-y-auto p-6 space-y-5">
        <SVGUploader onLoaded={handleLoaded} />

        {validation && fileName && (
          <SVGValidator fileName={fileName} validation={validation} />
        )}

        {validation?.valid && (
          <div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted mb-2">
              Element permissions
            </div>
            <PermissionEditor
              elements={validation.elements}
              permissions={permissions}
              onChange={setPermissions}
            />
          </div>
        )}

        {validation?.valid && (
          <div className="border-t border-card-border pt-5 space-y-3">
            <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted">
              Product details
            </div>
            <Field
              label="Template name"
              value={productName}
              onChange={setProductName}
              placeholder="e.g. Happy Birthday Princess"
            />
            <Field
              label="Price"
              value={price}
              onChange={setPrice}
              placeholder="£29.99"
            />
            <Field
              label="Shopify Product ID"
              value={productId}
              onChange={setProductId}
              placeholder="paste from Shopify admin URL"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full h-11 rounded-lg bg-gold hover:bg-gold-hover text-white text-[13px] font-semibold tracking-[0.02em] disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving && <Spinner size={14} />}
              {saving ? "Saving…" : "Save & Publish to Shopify"}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT — preview + JSON */}
      <div className="flex-1 min-w-0 overflow-y-auto p-8 space-y-6">
        <div>
          <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted mb-2">
            SVG preview
          </div>
          <div className="bg-white border border-card-border rounded-card p-6 flex items-center justify-center min-h-[300px]">
            {svgText ? (
              <div
                className="max-w-full max-h-[380px] [&>svg]:max-w-full [&>svg]:max-h-[380px]"
                dangerouslySetInnerHTML={{ __html: svgText }}
              />
            ) : (
              <div className="text-[12px] text-text-muted">
                Upload an SVG to preview it here
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted">
              Permission JSON
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyJson}
                disabled={!json}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-card-border bg-white text-[11px] hover:bg-form-surface disabled:opacity-50"
              >
                <CopyIcon size={13} /> Copy
              </button>
              <button
                type="button"
                onClick={previewInEditor}
                disabled={!config}
                className="inline-flex items-center h-8 px-3 rounded-md bg-[#1a1a1a] text-white text-[11px] hover:bg-black disabled:opacity-50"
              >
                Preview in Editor
              </button>
            </div>
          </div>
          <pre className="bg-code-bg text-code-text text-[11px] font-mono leading-relaxed rounded-lg p-4 max-h-[420px] overflow-auto">
            {json || "// Upload an SVG to generate config"}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-[11px] text-text-muted mb-1">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-card-border bg-form-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-gold/40"
      />
    </label>
  );
}
