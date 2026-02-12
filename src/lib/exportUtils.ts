import { companies, sections, questions, respondents, getSectionAverage, getQuestionAverage, getCompanyRespondents, scaleLabels, getAnswerDistribution } from "@/data/mockData";

// CSV export utility
function downloadCSV(filename: string, csvContent: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Export company detailed report
export function exportCompanyReport(companyId: string) {
  const company = companies.find(c => c.id === companyId);
  if (!company) return;

  const pool = getCompanyRespondents(companyId);
  const lines: string[] = [];

  lines.push(`RELATÓRIO PROART - ${company.name}`);
  lines.push(`Setor: ${company.sector}`);
  lines.push(`Funcionários: ${company.employees}`);
  lines.push(`Respostas coletadas: ${pool.length}`);
  lines.push(`Data de geração: ${new Date().toLocaleDateString("pt-BR")}`);
  lines.push("");

  // Section averages
  lines.push("RESUMO POR PILAR");
  lines.push("Pilar,Média,Classificação");
  sections.forEach(s => {
    const avg = getSectionAverage(s.id, companyId);
    const classification = avg >= 4 ? "Bom" : avg >= 3 ? "Moderado" : "Crítico";
    lines.push(`${s.name},${avg.toFixed(2)},${classification}`);
  });
  lines.push("");

  // Per-question detail
  sections.forEach(s => {
    const qs = questions.filter(q => q.section === s.id);
    lines.push(`DETALHAMENTO - ${s.name.toUpperCase()}`);
    lines.push("Nº,Pergunta,Média,Nunca(%),Raramente(%),Às vezes(%),Frequentemente(%),Sempre(%)");
    qs.forEach(q => {
      const avg = getQuestionAverage(q.id, companyId);
      const dist = getAnswerDistribution(q.id, companyId);
      lines.push(`${q.number},"${q.text}",${avg.toFixed(2)},${dist.map(d => d.percentage).join(",")}`);
    });
    lines.push("");
  });

  // Demographics
  lines.push("PERFIL DEMOGRÁFICO DOS RESPONDENTES");
  lines.push("Gênero,Quantidade,%");
  const sexGroups = ["Masculino", "Feminino", "Prefiro não declarar"];
  sexGroups.forEach(sex => {
    const count = pool.filter(r => r.sex === sex).length;
    lines.push(`${sex},${count},${pool.length > 0 ? Math.round((count / pool.length) * 100) : 0}%`);
  });
  lines.push("");

  lines.push("Faixa Etária,Quantidade");
  const ageRanges = [
    { label: "18-25", min: 18, max: 25 },
    { label: "26-35", min: 26, max: 35 },
    { label: "36-45", min: 36, max: 45 },
    { label: "46-55", min: 46, max: 55 },
    { label: "56+", min: 56, max: 100 },
  ];
  ageRanges.forEach(r => {
    lines.push(`${r.label},${pool.filter(resp => resp.age >= r.min && resp.age <= r.max).length}`);
  });

  downloadCSV(`relatorio_${company.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`, lines.join("\n"));
}

// Export comparison report
export function exportComparisonReport(companyIds: string[]) {
  const selected = companies.filter(c => companyIds.includes(c.id));
  const lines: string[] = [];

  lines.push("RELATÓRIO COMPARATIVO PROART");
  lines.push(`Empresas: ${selected.map(c => c.name).join(" | ")}`);
  lines.push(`Data: ${new Date().toLocaleDateString("pt-BR")}`);
  lines.push("");

  // Overview
  lines.push("VISÃO GERAL");
  const header = ["Empresa", "Setor", "Respostas", ...sections.map(s => s.shortName), "Média Geral"];
  lines.push(header.join(","));
  selected.forEach(c => {
    const avgs = sections.map(s => getSectionAverage(s.id, c.id).toFixed(2));
    const overall = (sections.reduce((acc, s) => acc + getSectionAverage(s.id, c.id), 0) / sections.length).toFixed(2);
    lines.push(`"${c.name}",${c.sector},${getCompanyRespondents(c.id).length},${avgs.join(",")},${overall}`);
  });
  lines.push("");

  // Per-question comparison
  sections.forEach(s => {
    const qs = questions.filter(q => q.section === s.id);
    lines.push(`COMPARATIVO POR PERGUNTA - ${s.name.toUpperCase()}`);
    const qHeader = ["Nº", "Pergunta", ...selected.map(c => c.name.split(" ")[0])];
    lines.push(qHeader.join(","));
    qs.forEach(q => {
      const vals = selected.map(c => getQuestionAverage(q.id, c.id).toFixed(2));
      lines.push(`${q.number},"${q.text}",${vals.join(",")}`);
    });
    lines.push("");
  });

  downloadCSV(`comparativo_PROART_${new Date().toISOString().split("T")[0]}.csv`, lines.join("\n"));
}

// Export all raw data
export function exportRawData() {
  const lines: string[] = [];
  const header = ["Respondente", "Empresa", "Sexo", "Idade", "Setor", ...questions.map(q => `${q.section}_${q.number}`)];
  lines.push(header.join(","));

  respondents.forEach(r => {
    const company = companies.find(c => c.id === r.companyId);
    const answers = questions.map(q => r.answers[q.id] || "");
    lines.push(`"${r.name}","${company?.name || ""}",${r.sex},${r.age},${r.sector},${answers.join(",")}`);
  });

  downloadCSV(`dados_brutos_PROART_${new Date().toISOString().split("T")[0]}.csv`, lines.join("\n"));
}

// Export heatmap data
export function exportHeatmapData(sectionId: string) {
  const qs = questions.filter(q => q.section === sectionId);
  const section = sections.find(s => s.id === sectionId);
  const lines: string[] = [];

  lines.push(`HEATMAP - ${section?.name.toUpperCase() || sectionId}`);
  lines.push(`Data: ${new Date().toLocaleDateString("pt-BR")}`);
  lines.push("");

  const header = ["Pergunta", ...companies.map(c => c.name.split(" ")[0])];
  lines.push(header.join(","));
  qs.forEach(q => {
    const vals = companies.map(c => getQuestionAverage(q.id, c.id).toFixed(2));
    lines.push(`"${q.number}. ${q.text}",${vals.join(",")}`);
  });

  downloadCSV(`heatmap_${sectionId}_${new Date().toISOString().split("T")[0]}.csv`, lines.join("\n"));
}
