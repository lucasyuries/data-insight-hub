import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { respondents, companies, sections, questions } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = [
  "hsl(217, 71%, 45%)", "hsl(170, 60%, 45%)", "hsl(38, 92%, 55%)",
  "hsl(280, 60%, 55%)", "hsl(0, 72%, 55%)", "hsl(200, 80%, 50%)",
];

function groupAverage(pool: typeof respondents, sectionId: string): number {
  const qs = questions.filter(q => q.section === sectionId);
  if (pool.length === 0 || qs.length === 0) return 0;
  const sum = pool.reduce((acc, r) => acc + qs.reduce((a, q) => a + (r.answers[q.id] || 0), 0), 0);
  return Math.round((sum / (pool.length * qs.length)) * 100) / 100;
}

export default function Demographics() {
  const [companyFilter, setCompanyFilter] = useState<string>("");
  const [sectionFilter, setSectionFilter] = useState("contexto");

  const pool = companyFilter ? respondents.filter(r => r.companyId === companyFilter) : respondents;

  // Sex distribution
  const sexGroups = ["Masculino", "Feminino", "Prefiro não declarar"];
  const sexData = sexGroups.map(s => ({ name: s, count: pool.filter(r => r.sex === s).length }));
  const sexPerception = sexGroups.map(s => ({
    name: s.substring(0, 8),
    ...Object.fromEntries(sections.map(sec => [sec.shortName, groupAverage(pool.filter(r => r.sex === s), sec.id)])),
  }));

  // Age groups
  const ageRanges = [
    { label: "18-25", min: 18, max: 25 },
    { label: "26-35", min: 26, max: 35 },
    { label: "36-45", min: 36, max: 45 },
    { label: "46-55", min: 46, max: 55 },
    { label: "56+", min: 56, max: 100 },
  ];
  const ageData = ageRanges.map(r => ({
    name: r.label,
    ...Object.fromEntries(sections.map(s => [s.shortName, groupAverage(pool.filter(resp => resp.age >= r.min && resp.age <= r.max), s.id)])),
  }));

  // Sector
  const sectorList = [...new Set(pool.map(r => r.sector))];
  const sectorData = sectorList.map(s => ({
    name: s.substring(0, 6),
    média: groupAverage(pool.filter(r => r.sector === s), sectionFilter),
    count: pool.filter(r => r.sector === s).length,
  }));

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil Demográfico</h1>
          <p className="text-sm text-muted-foreground mt-1">Cruzamento entre dados demográficos e percepção</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <option value="">Todas as empresas</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Sex pie */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">Distribuição por Gênero</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sexData} cx="50%" cy="50%" outerRadius={90} dataKey="count"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {sexData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sex x Perception */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">Gênero × Percepção por Pilar</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sexPerception} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {sections.map((s, i) => <Bar key={s.id} dataKey={s.shortName} fill={COLORS[i]} radius={[3, 3, 0, 0]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age x Perception */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">Faixa Etária × Percepção</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {sections.map((s, i) => <Bar key={s.id} dataKey={s.shortName} fill={COLORS[i]} radius={[3, 3, 0, 0]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">Setor × Média ({sections.find(s => s.id === sectionFilter)?.shortName})</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={60} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="média" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
