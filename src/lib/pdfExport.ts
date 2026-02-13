import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  companies, sections, questions, getSectionAverage, getQuestionAverage,
  getCompanyRespondents, getAnswerDistribution, type Company
} from "@/data/mockData";

const COLORS = {
  primary: [15, 30, 61] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function addHeader(doc: jsPDF, companyName: string, subtitle: string) {
  // Header bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 38, "F");

  // Logo circle
  doc.setFillColor(...COLORS.accent);
  doc.circle(22, 19, 10, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("P", 19.5, 22);

  // Title
  doc.setFontSize(18);
  doc.text("PROART", 38, 17);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Protocolo de Avaliação dos Riscos Psicossociais do Trabalho", 38, 24);

  // Company name + subtitle
  doc.setFontSize(8);
  doc.text(`${companyName} — ${subtitle}`, 38, 31);

  // Date
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 155, 31);
}

function addFooter(doc: jsPDF, pageNum: number) {
  const h = doc.internal.pageSize.height;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, h - 15, 195, h - 15);
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("PROART Dashboard — Relatório Confidencial", 15, h - 10);
  doc.text(`Página ${pageNum}`, 185, h - 10);
}

function getClassification(value: number): { label: string; color: [number, number, number] } {
  if (value >= 4) return { label: "Bom", color: COLORS.success };
  if (value >= 3) return { label: "Moderado", color: COLORS.warning };
  return { label: "Crítico", color: COLORS.danger };
}

export function exportCompanyPDF(companyId: string) {
  const company = companies.find(c => c.id === companyId);
  if (!company) return;

  const doc = new jsPDF();
  const pool = getCompanyRespondents(companyId);
  const overallAvg = sections.reduce((acc, s) => acc + getSectionAverage(s.id, companyId), 0) / sections.length;
  let page = 1;

  // Page 1: Cover + Summary
  addHeader(doc, company.name, "Relatório Individual");

  // KPI boxes
  const kpis = [
    { label: "Respostas", value: pool.length.toString() },
    { label: "Média Geral", value: overallAvg.toFixed(2) },
    { label: "Setor", value: company.sector },
    { label: "Funcionários", value: company.employees.toString() },
  ];

  let kpiX = 15;
  kpis.forEach(kpi => {
    doc.setFillColor(...COLORS.bg);
    doc.roundedRect(kpiX, 45, 43, 25, 3, 3, "F");
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(kpi.value, kpiX + 21.5, 58, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(kpi.label, kpiX + 21.5, 65, { align: "center" });
    kpiX += 46;
  });

  // Section summary table
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text("Resumo por Pilar", 15, 82);

  const sectionRows = sections.map(s => {
    const avg = getSectionAverage(s.id, companyId);
    const generalAvg = getSectionAverage(s.id);
    const diff = avg - generalAvg;
    const cls = getClassification(avg);
    return [s.name, avg.toFixed(2), cls.label, `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`];
  });

  autoTable(doc, {
    startY: 86,
    head: [["Pilar", "Média", "Classificação", "vs. Geral"]],
    body: sectionRows,
    theme: "grid",
    headStyles: { fillColor: COLORS.primary, fontSize: 8, font: "helvetica" },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        const cls = getClassification(parseFloat(sectionRows[data.row.index][1]));
        data.cell.styles.textColor = cls.color;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 3) {
        const val = parseFloat(sectionRows[data.row.index][3]);
        data.cell.styles.textColor = val >= 0 ? COLORS.success : COLORS.danger;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Strengths & Critical
  const allQAvg = questions.map(q => ({ ...q, avg: getQuestionAverage(q.id, companyId) }));

  const strengths = [...allQAvg].sort((a, b) => {
    const isNegA = a.section === "vivencias" || a.section === "saude";
    const isNegB = b.section === "vivencias" || b.section === "saude";
    return (isNegB ? 6 - b.avg : b.avg) - (isNegA ? 6 - a.avg : a.avg);
  }).slice(0, 5);

  const critical = [...allQAvg].sort((a, b) => {
    const isNegA = a.section === "vivencias" || a.section === "saude";
    const isNegB = b.section === "vivencias" || b.section === "saude";
    return (isNegB ? b.avg : 6 - b.avg) - (isNegA ? a.avg : 6 - a.avg);
  }).slice(0, 5);

  const currentY = (doc as any).lastAutoTable?.finalY || 140;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.success);
  doc.text("✓ Pontos Fortes", 15, currentY + 10);

  strengths.forEach((q, i) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(`${i + 1}. ${q.text} (${q.avg.toFixed(1)})`, 20, currentY + 17 + i * 5);
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.danger);
  doc.text("✗ Pontos Críticos", 110, currentY + 10);

  critical.forEach((q, i) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(`${i + 1}. ${q.text} (${q.avg.toFixed(1)})`, 115, currentY + 17 + i * 5);
  });

  addFooter(doc, page);

  // Page 2+: Detail per section
  sections.forEach(s => {
    doc.addPage();
    page++;
    addHeader(doc, company.name, `Detalhamento — ${s.name}`);

    const qs = questions.filter(q => q.section === s.id);
    const rows = qs.map(q => {
      const avg = getQuestionAverage(q.id, companyId);
      const dist = getAnswerDistribution(q.id, companyId);
      return [
        `${q.number}`,
        q.text,
        avg.toFixed(2),
        ...dist.map(d => `${d.percentage}%`),
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [["Nº", "Pergunta", "Média", "Nunca", "Raram.", "Às vezes", "Freq.", "Sempre"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: COLORS.primary, fontSize: 7, font: "helvetica" },
      bodyStyles: { fontSize: 6.5 },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 55 },
        2: { cellWidth: 12, halign: "center", fontStyle: "bold" },
        3: { cellWidth: 14, halign: "center" },
        4: { cellWidth: 14, halign: "center" },
        5: { cellWidth: 14, halign: "center" },
        6: { cellWidth: 14, halign: "center" },
        7: { cellWidth: 14, halign: "center" },
      },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 2) {
          const val = parseFloat(data.cell.raw as string);
          const cls = getClassification(val);
          data.cell.styles.textColor = cls.color;
        }
      },
    });

    addFooter(doc, page);
  });

  doc.save(`relatorio_${company.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportComparisonPDF(companyIds: string[]) {
  const selected = companies.filter(c => companyIds.includes(c.id));
  if (selected.length < 2) return;

  const doc = new jsPDF("landscape");
  let page = 1;

  addHeader(doc, selected.map(c => c.name).join(" vs "), "Relatório Comparativo");

  // Overview table
  const header = ["Empresa", "Setor", "Respostas", ...sections.map(s => s.shortName), "Média"];
  const rows = selected.map(c => {
    const avgs = sections.map(s => getSectionAverage(s.id, c.id).toFixed(2));
    const overall = (sections.reduce((acc, s) => acc + getSectionAverage(s.id, c.id), 0) / sections.length).toFixed(2);
    return [c.name, c.sector, getCompanyRespondents(c.id).length.toString(), ...avgs, overall];
  });

  autoTable(doc, {
    startY: 45,
    head: [header],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: COLORS.primary, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: Object.fromEntries(
      Array.from({ length: header.length }, (_, i) => [i, { halign: i >= 2 ? "center" : "left" }])
    ),
  });

  addFooter(doc, page);

  // Per section comparison
  sections.forEach(s => {
    doc.addPage("landscape");
    page++;
    addHeader(doc, `Comparativo — ${s.name}`, "Por Pergunta");

    const qs = questions.filter(q => q.section === s.id);
    const qHeader = ["Nº", "Pergunta", ...selected.map(c => c.name.split(" ")[0])];
    const qRows = qs.map(q => {
      return [q.number.toString(), q.text, ...selected.map(c => getQuestionAverage(q.id, c.id).toFixed(2))];
    });

    autoTable(doc, {
      startY: 45,
      head: [qHeader],
      body: qRows,
      theme: "striped",
      headStyles: { fillColor: COLORS.primary, fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 80 },
      },
    });

    addFooter(doc, page);
  });

  doc.save(`comparativo_PROART_${new Date().toISOString().split("T")[0]}.pdf`);
}
