import { createFileRoute } from "@tanstack/react-router";
import { useApp, useCurrentProfile } from "@/lib/mock/store";
import { TEMPLATE_DEFS, PALETTE_PRESETS } from "@/lib/mock/templates";
import { BusinessCard } from "@/components/flex/BusinessCard";
import { Check, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/templates")({ 
  ssr: false,component: TemplatesPage });

function TemplatesPage() {
  const me = useCurrentProfile()!;
  const update = useApp((s) => s.updateCurrent);
  const [templateId, setTemplateId] = useState(me.templateId);
  const [paletteIdx, setPaletteIdx] = useState(() =>
    Math.max(0, PALETTE_PRESETS.findIndex((p) => p.primary === me.palette.primary))
  );

  const palette = PALETTE_PRESETS[paletteIdx] ?? PALETTE_PRESETS[0];
  const preview = { ...me, templateId, palette };

  const save = () => update({ templateId, palette });

  return (
    <div className="max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {TEMPLATE_DEFS.length * PALETTE_PRESETS.length} combinaisons disponibles ({TEMPLATE_DEFS.length} templates × {PALETTE_PRESETS.length} palettes).
          </p>
        </div>
        <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow">
          <Save className="h-4 w-4" /> Appliquer
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="surface-elevated p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Palette de couleurs</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
              {PALETTE_PRESETS.map((p, i) => (
                <button key={p.name} onClick={() => setPaletteIdx(i)}
                  className={`relative h-14 rounded-xl ring-2 transition ${paletteIdx === i ? "ring-primary scale-105" : "ring-transparent"}`}
                  style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }}
                  title={p.name}>
                  {paletteIdx === i && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          <div className="surface-elevated p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Templates</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_DEFS.map((t) => {
                const active = templateId === t.id;
                return (
                  <button key={t.id} onClick={() => setTemplateId(t.id)}
                    className={`text-left rounded-2xl border p-3 transition ${active ? "border-primary ring-brand" : "border-border hover:bg-secondary"}`}>
                    <BusinessCard profile={{ ...me, templateId: t.id, palette }} variant="preview" />
                    <div className="mt-3 text-sm font-semibold">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 self-start">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Aperçu</div>
          <BusinessCard profile={preview} variant="full" />
        </div>
      </div>
    </div>
  );
}
