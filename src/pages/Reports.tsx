import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { companies, sections, getSectionAverage, getCompanyRespondents, respondents, questions, getQuestionAverage } from "@/data/mockData";
import { exportCompanyReport, exportComparisonReport, exportRawData, exportHeatmapData } from "@/lib/exportUtils";
import { Download, FileText, Building2, GitCompareArrows, Database, Grid3X3, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

function ClassBadge({ value }: { value: number }) {
  if (value >= 4) return <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"><CheckCircle2 className="h-3 w-3" /> Bom</span>;
  if (value >= 3) return <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning"><AlertTriangle className="h-3 w-3" /> Moderado</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive"><XCircle className="h-3 w-3" /> Crítico</span>;
}

export default function Reports() {
  const [selectedCompany, setSelectedCompany] = useState<string>(companies[0].id);
  const [compareIds, setCompareIds] = useState<string[]>(companies.map(c => c.id));

  const company = companies.find(c => c.id === selectedCompany)!;
  const pool = getCompanyRespondents(selectedCompany);
  const overallAvg = sections.reduce((acc, s) => acc + getSectionAverage(s.id, selectedCompany), 0) / sections.length;

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleExport = (type: string, fn: () => void) => {
    fn();
    toast({ title: "Relatório exportado!", description: `O arquivo ${type} foi baixado com sucesso.` });
  };

  // Find top 3 critical and best questions for selected company
  const allQAvg = questions.map(q => ({ ...q, avg: getQuestionAverage(q.id, selectedCompany) }));
  const critical = [...allQAvg].sort((a, b) => {
    // For negative sections, high values are bad
    const isNegA = a.section === "vivencias" || a.section === "saude";
    const isNegB = b.section === "vivencias" || b.section === "saude";
    const scoreA = isNegA ? a.avg : 6 - a.avg;
    const scoreB = isNegB ? b.avg : 6 - b.avg;
    return scoreB - scoreA;
  }).slice(0, 5);

  const strengths = [...allQAvg].sort((a, b) => {
    const isNegA = a.section === "vivencias" || a.section === "saude";
    const isNegB = b.section === "vivencias" || b.section === "saude";
    const scoreA = isNegA ? 6 - a.avg : a.avg;
    const scoreB = isNegB ? 6 - b.avg : b.avg;
    return scoreB - scoreA;
  }).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios & Exportação</h1>
            <p className="text-sm text-muted-foreground mt-1">Gere relatórios detalhados para enviar às empresas clientes</p>
          </div>
          <button
            onClick={() => handleExport("dados brutos", exportRawData)}
            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Database className="h-4 w-4" />
            Exportar Dados Brutos
          </button>
        </div>

        {/* Export Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() => handleExport("empresa", () => exportCompanyReport(selectedCompany))}
            className="group rounded-xl border border-border bg-card p-5 shadow-card text-left hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Relatório Individual</p>
                <p className="text-xs text-muted-foreground">Por empresa selecionada</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <Download className="h-3.5 w-3.5" /> Baixar CSV
            </div>
          </button>

          <button
            onClick={() => handleExport("comparativo", () => exportComparisonReport(compareIds))}
            className="group rounded-xl border border-border bg-card p-5 shadow-card text-left hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <GitCompareArrows className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Relatório Comparativo</p>
                <p className="text-xs text-muted-foreground">Múltiplas empresas</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium">
              <Download className="h-3.5 w-3.5" /> Baixar CSV
            </div>
          </button>

          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => handleExport(`heatmap ${s.shortName}`, () => exportHeatmapData(s.id))}
              className="group rounded-xl border border-border bg-card p-5 shadow-card text-left hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Grid3X3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Heatmap {s.shortName}</p>
                  <p className="text-xs text-muted-foreground">Pergunta × Empresa</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary font-medium">
                <Download className="h-3.5 w-3.5" /> Baixar CSV
              </div>
            </button>
          ))}
        </div>

        {/* Company selector for individual report */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Prévia do Relatório Individual
          </h3>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button
              onClick={() => handleExport("empresa", () => exportCompanyReport(selectedCompany))}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar {company.name}
            </button>
          </div>

          {/* Preview summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{pool.length}</p>
              <p className="text-xs text-muted-foreground">Respostas</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{overallAvg.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Média Geral</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{company.sector}</p>
              <p className="text-xs text-muted-foreground">Setor</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{company.employees}</p>
              <p className="text-xs text-muted-foreground">Funcionários</p>
            </div>
          </div>

          {/* Section summary table */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Pilar</th>
                  <th className="px-4 py-2 text-center font-semibold text-muted-foreground">Média</th>
                  <th className="px-4 py-2 text-center font-semibold text-muted-foreground">Classificação</th>
                  <th className="px-4 py-2 text-center font-semibold text-muted-foreground">vs. Geral</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(s => {
                  const avg = getSectionAverage(s.id, selectedCompany);
                  const generalAvg = getSectionAverage(s.id);
                  const diff = avg - generalAvg;
                  return (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="px-4 py-2 font-medium text-foreground">{s.name}</td>
                      <td className="px-4 py-2 text-center font-bold text-foreground">{avg.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center"><ClassBadge value={avg} /></td>
                      <td className={cn("px-4 py-2 text-center text-xs font-semibold", diff >= 0 ? "text-success" : "text-destructive")}>
                        {diff >= 0 ? "+" : ""}{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Strengths & Critical */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-success/30 bg-success/5 p-4">
              <h4 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Pontos Fortes
              </h4>
              <ul className="space-y-2">
                {strengths.map((q, i) => (
                  <li key={q.id} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="mt-0.5 font-bold text-success">{i + 1}.</span>
                    <span>{q.text} <span className="font-semibold text-success">({q.avg.toFixed(1)})</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <h4 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Pontos Críticos
              </h4>
              <ul className="space-y-2">
                {critical.map((q, i) => (
                  <li key={q.id} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="mt-0.5 font-bold text-destructive">{i + 1}.</span>
                    <span>{q.text} <span className="font-semibold text-destructive">({q.avg.toFixed(1)})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comparison selector */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <GitCompareArrows className="h-4 w-4 text-primary" />
            Relatório Comparativo
          </h3>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {companies.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCompare(c.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  compareIds.includes(c.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => handleExport("comparativo", () => exportComparisonReport(compareIds))}
            disabled={compareIds.length < 2}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="h-4 w-4" />
            Exportar Comparativo ({compareIds.length} empresas)
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
