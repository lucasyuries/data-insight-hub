import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuestionChart } from "@/components/dashboard/QuestionChart";
import { questions, sections, companies } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function SurveyAnalysis() {
  const [activeSection, setActiveSection] = useState("contexto");
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>(undefined);

  const sectionQuestions = questions.filter((q) => q.section === activeSection);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análise por Pergunta</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize a distribuição de respostas para cada item do PROART</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Section tabs */}
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

          {/* Company filter */}
          <select
            value={selectedCompany || ""}
            onChange={(e) => setSelectedCompany(e.target.value || undefined)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            <option value="">Todas as empresas</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {sectionQuestions.map((q) => (
            <QuestionChart
              key={q.id}
              questionId={q.id}
              questionText={`${q.number}. ${q.text}`}
              companyId={selectedCompany}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
