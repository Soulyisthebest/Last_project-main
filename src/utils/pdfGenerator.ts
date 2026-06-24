import { jsPDF } from "jspdf";

// Utility to clean text for basic western European/Latin languages to prevent rendering issues in standard PDF fonts
function safeStr(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/[“”]/g, '"')
    .replace(/[‘’"']/g, "'")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ");
}

/**
 * Genera y descarga un PDF detallado de la Ficha del Alumno.
 */
export function downloadStudentPDF(student: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [11, 18, 36]; // #0b1224 Deep Dark Slate
  const accentColor = [245, 158, 11]; // #f59e0b Amber

  // Main Border
  doc.rect(5, 5, 200, 287);
  doc.rect(6, 6, 198, 285);

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(7, 7, 196, 32, "F");

  // Accent Line
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(7, 39, 196, 1.5, "F");

  // Title inside banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ATRÉVETE A ESPAÑA - SAAS EDUCATIVO", 15, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text("EXPEDIENTE OFICIAL DE MATRICULACIÓN EN ESPAÑA", 15, 26);
  doc.text(`CÓDIGO DE CUENTA: ${safeStr(student.accountCode || "PENDIENTE")}`, 15, 32);

  // Footer
  const drawFooter = () => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(7, 276, 196, 12, "F");
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(7, 275, 196, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("Atrévete a España S.L. - Reporte Confidencial de Administración", 15, 284);
    doc.text("Página 1 de 1", 175, 284);
  };

  // Section 1: Datos Personales
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("1. DATOS PERSONALES DEL ESTUDIANTE", 15, 52);
  
  // Underline section
  doc.setDrawColor(220, 220, 220);
  doc.line(15, 54, 195, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Nombre Completo:", 15, 62);
  doc.text("Correo Electrónico:", 15, 68);
  doc.text("Género:", 15, 74);
  doc.text("Edad:", 15, 80);
  doc.text("Idioma Nativo:", 15, 86);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text(safeStr(student.name), 52, 62);
  doc.text(safeStr(student.email), 52, 68);
  doc.text(safeStr(student.gender || "No indicado"), 52, 74);
  doc.text(`${student.age || "N/A"} años`, 52, 80);
  doc.text(student.language === "ar" ? "Árabe" : student.language === "fr" ? "Francés" : "Otro", 52, 86);

  // Column 2
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80, 80, 80);
  doc.text("País Origen:", 110, 62);
  doc.text("Localidad:", 110, 68);
  doc.text("Destino España:", 110, 74);
  doc.text("Fecha Registro:", 110, 80);
  doc.text("Membresía:", 110, 86);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text(safeStr(student.country), 142, 62);
  doc.text(safeStr(student.city), 142, 68);
  doc.text(safeStr(student.targetCity), 142, 74);
  doc.text(safeStr(student.registrationDate), 142, 80);
  
  doc.setFont("helvetica", "bold");
  if (student.premiumStatus) {
    doc.setTextColor(190, 120, 0);
    doc.text("Premium (Pago único)", 142, 86);
  } else {
    doc.setTextColor(120, 120, 120);
    doc.text("Gratuito (Básico)", 142, 86);
  }

  // Section 2: Objetivos Académicos y Vocacionales
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("2. METAS ACADÉMICAS Y VOCACIONALES", 15, 102);
  doc.line(15, 104, 195, 104);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Meta Académica:", 15, 112);
  doc.text("Estudios de Preferencia:", 15, 118);
  doc.text("Meta Profesional:", 15, 124);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text(safeStr(student.academicGoal || "Acceso superior / homologación"), 55, 112);
  doc.text(safeStr(student.vocationalTopChoice || "Informática / Sanidad"), 55, 118);
  doc.text(safeStr(student.professionalGoal || "Incoroporación en empresa española"), 55, 124);

  // Section 3: Progreso y Rendimiento en la Plataforma
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("3. RENDIMIENTO ACADÉMICO INTEGRAL (SaaS)", 15, 140);
  doc.line(15, 142, 195, 142);

  // Light blue info box for statistics
  doc.setFillColor(240, 245, 255);
  doc.rect(15, 148, 180, 48, "F");
  doc.setDrawColor(200, 215, 245);
  doc.rect(15, 148, 180, 48);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 50, 100);
  doc.text("INFORMACIÓN DE APRENDIZAJE:", 20, 156);

  doc.setTextColor(60, 60, 60);
  doc.text("Nivel de idioma actual:", 20, 164);
  doc.text("Puntos de Experiencia (XP):", 20, 172);
  doc.text("Puntos de racha activa (Días):", 20, 180);
  doc.text("Tiempo de estudio acumulado:", 20, 188);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(10, 10, 10);
  doc.text(safeStr(student.level || "A1 / Inicial"), 80, 164);
  doc.text(`${student.xp || 0} XP`, 80, 172);
  doc.text(`${student.streak || 0} Días de Racha`, 80, 180);
  doc.text(`${student.studyTimeMinutes || 0} Minutos`, 80, 188);

  // Column 2 inside info box
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Lecciones completadas:", 115, 164);
  doc.text("Exámenes aprobados:", 115, 172);
  doc.text("Entregó currículum (CV):", 115, 180);
  doc.text("Activo en Comunidad:", 115, 188);

  doc.setFont("helvetica", "bold");
  doc.text(`${student.completedLessons || 0} Lecciones`, 160, 164);
  doc.text(`${student.completedExams || 0} Exámenes`, 160, 172);
  doc.text(student.hasCv ? "Sí (Generado)" : "No disponible", 160, 180);
  doc.text(student.activeInCommunity ? "Sí" : "Inactivo", 160, 188);

  // Section 4: Estado Migratorio y Viabilidad Laboral
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("4. VIABILIDAD MIGRATORIA Y LABORAL EN ESPAÑA", 15, 210);
  doc.line(15, 212, 195, 212);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Preparado para Convenio de Prácticas:", 15, 222);
  doc.text("Listo para inserción laboral (Empleo):", 15, 230);
  doc.text("Canal de procedencia (Captación):", 15, 238);
  doc.text("Suma aportada monetaria:", 15, 246);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text(student.isInternshipReady ? "Apto y calificado" : "Falta documentación básica", 85, 222);
  doc.text(student.hasJobReady ? "Perfil validado para bolsa española" : "En fase de preparación lingüística", 85, 230);
  doc.text(safeStr(student.channel || "Directo / Orgánico"), 85, 238);
  doc.text(`${student.paymentAmount || 0} €`, 85, 246);

  // Disclaimer and stamp
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Este informe es confidencial y para uso exclusivo del personal de tutoría de Atrévete a España. No tiene valor para visado público.", 15, 264);

  // Draw footer inside
  drawFooter();

  doc.save(`Ficha_Alumno_${String(student.name).replace(/\s+/g, "_")}.pdf`);
}

/**
 * Genera y descarga un PDF detallado de una Campaña Publicitaria.
 */
export function downloadAdPDF(ad: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [11, 18, 36]; // #0b1224
  const accentColor = [245, 158, 11]; // #f59e0b

  doc.rect(5, 5, 200, 287);
  doc.rect(6, 6, 198, 285);

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(7, 7, 196, 32, "F");
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(7, 39, 196, 1.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INFORME DE PUBLICIDAD Y MARCAS", 15, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text("AUDITORÍA DE DESEMPEÑO COMERCIAL EN EL PORTAL DE ESTUDIANTES", 15, 26);
  doc.text(`ID DE CAMPAÑA: ${safeStr(ad.id)}`, 15, 32);

  // Footer helper
  const drawFooter = () => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(7, 276, 196, 12, "F");
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(7, 275, 196, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("Atrévete a España S.L. - Departamento Comercial y Afiliados", 15, 284);
    doc.text("Página 1 de 1", 175, 284);
  };

  // Section 1: Detalles de la Campaña
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("1. DETALLES OPERATIVOS DE LA CAMPAÑA", 15, 52);
  doc.line(15, 54, 195, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Anunciante / Marca:", 15, 62);
  doc.text("Título de Promoción:", 15, 70);
  doc.text("Descripción Comercial:", 15, 78);
  doc.text("Vinculación de Enlace Web:", 15, 102);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text(safeStr(ad.brand), 55, 62);
  doc.text(safeStr(ad.title), 55, 70);

  // Multi line description
  const splitDesc = doc.splitTextToSize(safeStr(ad.description || "Sin descripción proporcionada."), 135);
  doc.text(splitDesc, 55, 78);

  doc.text(safeStr(ad.targetUrl || "https://atrevete-espana.com"), 55, 102);

  // Section 2: Estadísticas de Rendimiento (Métricas en tiempo real)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("2. RENDIMIENTO E IMPACTO EN LA COMUNIDAD DE ALUMNOS", 15, 118);
  doc.line(15, 120, 195, 120);

  // Statistics indicators styled box
  doc.setFillColor(250, 250, 252);
  doc.rect(15, 126, 180, 50, "F");
  doc.setDrawColor(210, 210, 215);
  doc.rect(15, 126, 180, 50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("Cuentas de Conversión Activas:", 20, 134);
  doc.text("Visualizaciones Estimadas:", 20, 142);
  doc.text("Clics Registrados de Traspaso:", 20, 150);
  doc.text("Tasa de Clics (CTR estimado):", 20, 158);
  doc.text("Estado de Circulación en App:", 20, 166);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text("Comunidad de Estudiantes de Marruecos/Argelia/Túnez/Egipto", 75, 134);
  
  doc.setFont("helvetica", "bold");
  doc.text(`${ad.viewsCount || 0} Impresiones en el Portal`, 75, 142);
  doc.text(`${ad.clicksCount || 0} Clics`, 75, 150);

  // CTR Calculation math
  const ctr = ad.viewsCount > 0 ? ((ad.clicksCount / ad.viewsCount) * 100).toFixed(2) : "0.00";
  doc.text(`${ctr} % CTE`, 75, 158);

  if (ad.status === "active") {
    doc.setTextColor(16, 185, 129); // green
    doc.text("● CIRCULANDO ACTIVAMENTE", 75, 166);
  } else {
    doc.setTextColor(239, 68, 68); // red
    doc.text("○ PAUSADO TEMPORALMENTE", 75, 166);
  }

  // Section 3: Acuerdo Comercial
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("3. CLÁUSULA COMERCIAL Y FISCALIDAD", 15, 192);
  doc.line(15, 194, 195, 194);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const splitNotice = doc.splitTextToSize(
    "El anunciante acepta los términos del servicio de Atrévete a España. Las visualizaciones y clics registrados en nuestro backend son finales para efectos de cobro de patrocinio de formación profesional, cursos universitarios y reservas de alojamiento.",
    180
  );
  doc.text(splitNotice, 15, 202);

  doc.setFont("helvetica", "bold");
  doc.text(`Fecha de Lanzamiento Registrada: ${safeStr(ad.createdAt ? new Date(ad.createdAt).toLocaleString("es-ES") : "2026-06-22")}`, 15, 222);

  drawFooter();
  doc.save(`Informe_Publicitario_${String(ad.brand).replace(/\s+/g, "_")}.pdf`);
}

/**
 * Genera y descarga un PDF detallado de un Informe de Avance.
 */
export function downloadReportPDF(report: any) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [11, 18, 36]; // #0b1224
  const accentColor = [245, 158, 11]; // #f59e0b

  doc.rect(5, 5, 200, 287);
  doc.rect(6, 6, 198, 285);

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(7, 7, 196, 32, "F");
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(7, 39, 196, 1.5, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("REGISTRO DE HITOS - ATRÉVETE A ESPAÑA", 15, 18);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text("PANEL DE AUDITORÍA Y MEMORIA OPERACIONAL DE AVANCES (SaaS)", 15, 24);
  doc.text(`NÚMERO DE REPORTE: ${safeStr(report.id)}`, 15, 30);

  // Footer helper
  const drawFooter = () => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(7, 276, 196, 12, "F");
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(7, 275, 196, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text("Atrévete a España S.L. - Reporte Tecnológico Interno Cohesivo", 15, 284);
    doc.text("Página 1 de 1", 175, 284);
  };

  // Section 1: Metadatos del Hito
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("1. METADATOS Y CLASIFICACIÓN DEL INFORME", 15, 52);
  doc.line(15, 54, 195, 54);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Título de Informe / Hito:", 15, 62);
  doc.text("Área Estratégica:", 15, 70);
  doc.text("Tendencia Detectada:", 15, 78);
  doc.text("Redactado por (Autor):", 15, 86);
  doc.text("Fecha del Suceso:", 15, 94);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text(safeStr(report.title), 55, 62);
  
  // Upper case first character of metric type
  const mType = String(report.metricType).toUpperCase();
  doc.text(mType, 55, 70);

  doc.setFont("helvetica", "bold");
  if (report.trend === "up") {
    doc.setTextColor(16, 185, 129); // green
    doc.text("ALZA (POSITIVA/MEJORA)", 55, 78);
  } else if (report.trend === "down") {
    doc.setTextColor(239, 68, 68); // red
    doc.text("REGRESIÓN O BAJA OPERATIVA", 55, 78);
  } else {
    doc.setTextColor(100, 100, 100);
    doc.text("ESTABLE / RITMO CONSTANTE", 55, 78);
  }

  doc.setFont("helvetica", "normal");
  doc.setTextColor(20, 20, 20);
  doc.text(safeStr(report.author || "Administrador del SaaS"), 55, 86);
  doc.text(safeStr(report.date), 55, 94);

  // Section 2: Resumen Ejecutivo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("2. RESUMEN EJECUTIVO Y BITÁCORA", 15, 110);
  doc.line(15, 112, 195, 112);

  doc.setFillColor(255, 251, 243); // light gold backing
  doc.rect(15, 118, 180, 70, "F");
  doc.setDrawColor(245, 222, 179);
  doc.rect(15, 118, 180, 70);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(150, 110, 10);
  doc.text("DESCRIPCIÓN DE ANALÍTICA:", 20, 126);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  
  const splitSummary = doc.splitTextToSize(safeStr(report.summary || "Ninguna bitácora escrita."), 170);
  doc.text(splitSummary, 20, 134);

  // Section 3: Valor de Métrica Clave
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("3. INDICADOS CLAVE DE RENDIMIENTO (KPI)", 15, 202);
  doc.line(15, 204, 195, 204);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Valor numérico o acumulado registrado en la auditoría:", 15, 214);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${safeStr(report.value)}`, 15, 226);

  // Backed block
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  const legalText = "Los informes de avance son herramientas dinámicas para evaluar el crecimiento, los procesos de visado, los registros de alumnas marroquíes y de otras procedencias árabes que acceden a ciclos de FP o selectividad en España.";
  const splitLegal = doc.splitTextToSize(legalText, 180);
  doc.text(splitLegal, 15, 245);

  drawFooter();
  doc.save(`Informe_Avance_${String(report.title).replace(/\s+/g, "_")}.pdf`);
}
