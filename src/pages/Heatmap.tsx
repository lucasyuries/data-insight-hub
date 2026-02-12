import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { HeatmapTable } from "@/components/dashboard/HeatmapTable";
import { sections } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Heatmap() {
  const [activeSection, setActiveSection] = useState("contexto");

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Heatmap de Satisfação</h1>
          <p className="text-sm text-muted-foreground mt-1">Mapa de calor por pergunta × empresa</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg bg-secondary p-1 gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.shortName}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Legenda:</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-success/80" /> Bom (≥4)</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-warning/70" /> Moderado (3-4)</span>
            <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-destructive/70" /> Crítico (&lt;3)</span>
          </div>
        </div>

        <HeatmapTable sectionId={activeSection} />
      </div>
    </DashboardLayout>
  );
}
