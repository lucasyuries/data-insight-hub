import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { companies, respondents, getSectionAverage, sections, getCompanyRespondents } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Building2, Users, ClipboardCheck, TrendingUp } from "lucide-react";

const COLORS = [
  "hsl(217, 71%, 45%)", "hsl(170, 60%, 45%)", "hsl(38, 92%, 55%)",
  "hsl(280, 60%, 55%)", "hsl(0, 72%, 55%)",
];

export default function Index() {
  const totalRespondents = respondents.length;
  const totalCompanies = companies.length;
  const overallAvg = sections.reduce((acc, s) => acc + getSectionAverage(s.id), 0) / sections.length;

  const companyRanking = companies.map((c) => {
    const avg = sections.reduce((acc, s) => acc + getSectionAverage(s.id, c.id), 0) / sections.length;
    return { ...c, average: Math.round(avg * 100) / 100, respondentCount: getCompanyRespondents(c.id).length };
  }).sort((a, b) => b.average - a.average);

  const benchmarkData = companies.map((c) => {
    const row: Record<string, string | number> = { name: c.name.split(" ")[0] };
    sections.forEach((s) => {
      row[s.shortName] = getSectionAverage(s.id, c.id);
    });
    return row;
  });

  const radarData = sections.map((s) => ({
    subject: s.shortName,
    ...Object.fromEntries(companies.map((c) => [c.name.split(" ")[0], getSectionAverage(s.id, c.id)])),
  }));

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">Benchmark consolidado de todas as empresas</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            title="Empresas Ativas"
            value={totalCompanies}
            change={12}
            subtitle="vs. mês anterior"
            sparkData={[3, 4, 3, 5, 4, 5, 5]}
            color="hsl(217, 71%, 45%)"
          />
          <KPICard
            title="Total Respostas"
            value={totalRespondents}
            change={8.5}
            subtitle="vs. mês anterior"
            sparkData={[80, 95, 100, 110, 105, 120, 115]}
            color="hsl(170, 60%, 45%)"
          />
          <KPICard
            title="Média Geral"
            value={overallAvg.toFixed(2)}
            change={3.2}
            subtitle="escala 1-5"
            sparkData={[3.1, 3.2, 3.0, 3.3, 3.2, 3.4, 3.3]}
            color="hsl(38, 92%, 55%)"
          />
          <KPICard
            title="Taxa de Resposta"
            value="87%"
            change={-2.1}
            subtitle="vs. mês anterior"
            sparkData={[90, 88, 85, 89, 87, 86, 87]}
            color="hsl(280, 60%, 55%)"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Benchmark Bar Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">Benchmark por Pilar</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {sections.map((s, i) => (
                    <Bar key={s.id} dataKey={s.shortName} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">Perfil Comparativo (Radar)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={100}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} />
                  {companies.map((c, i) => (
                    <Radar key={c.id} name={c.name.split(" ")[0]} dataKey={c.name.split(" ")[0]}
                      stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Ranking de Empresas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Empresa</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Setor</th>
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Respostas</th>
                  {sections.map((s) => (
                    <th key={s.id} className="px-4 py-3 text-center font-semibold text-muted-foreground">{s.shortName}</th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Média</th>
                </tr>
              </thead>
              <tbody>
                {companyRanking.map((c, i) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.sector}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{c.respondentCount}</td>
                    {sections.map((s) => (
                      <td key={s.id} className="px-4 py-3 text-center">
                        <span className="font-medium">{getSectionAverage(s.id, c.id).toFixed(1)}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        {c.average.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
