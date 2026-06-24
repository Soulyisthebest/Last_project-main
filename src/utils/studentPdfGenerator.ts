import { jsPDF } from "jspdf";

// Clean text for PDF compatible standard fonts
function safeStr(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // removes Spanish accents for absolute font compatibility
    .replace(/[“”]/g, '"')
    .replace(/[‘’"']/g, "'")
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function drawPDFFrame(doc: jsPDF, title: string, subtitle: string) {
  const primaryColor = [12, 18, 34]; // Dark Slate
  const accentColor = [245, 158, 11]; // Amber

  // Page Frame
  doc.rect(5, 5, 200, 287);
  doc.rect(6, 6, 198, 285);

  // Top Header Row
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(7, 7, 196, 28, "F");
  
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(7, 35, 196, 1.5, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ATREVETE A ESPANA - PORTAL DE ESTUDIOS", 15, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text(`${safeStr(title).toUpperCase()} | ${safeStr(subtitle).toUpperCase()}`, 15, 23);
  doc.text("COPIA DE REFERENCIA - DESCARGA DE USUARIO", 15, 28);

  // Bottom Footer
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(7, 276, 196, 12, "F");
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(7, 275, 196, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(245, 158, 11);
  doc.text("ATREVETE A ESPANA S.L.", 15, 284);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("Guia de Orientacion y Acompanamiento Estudiantil Oficial", 65, 284);
  doc.text("Pagina 1 de 1", 175, 284);
}

// 1. ROADMAP PDF Generator
export function downloadRoadmapPDF(steps: any[], lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, "Hoja de Ruta de Estudios", "8 Pasos Clave para Estudiar en Espana");

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 18, 34);
  doc.text("HITOS DEL EXPEDIENTE MIGRATORIO:", 15, y);
  
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, 195, y);
  y += 6;

  steps.forEach((step, idx) => {
    if (y > 250) {
      doc.addPage();
      drawPDFFrame(doc, "Hoja de Ruta de Estudios", "8 Pasos Clave (Continuacion)");
      y = 48;
    }

    doc.setFillColor(245, 158, 11);
    doc.rect(15, y - 4, 10, 6, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${step.n}`, 19, y);

    doc.setTextColor(12, 18, 34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    
    const stepTitle = step[lang] || step["es"] || step["en"];
    doc.text(safeStr(stepTitle), 28, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    
    const stepSub = step.sub?.[lang] || step.sub?.["es"] || step.sub?.["en"] || "";
    const splitSub = doc.splitTextToSize(safeStr(stepSub), 165);
    doc.text(splitSub, 20, y);
    
    y += (splitSub.length * 4) + 2;

    const stepTags = step.tags?.[lang] || step.tags?.["es"] || [];
    if (stepTags.length > 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Requisitos / Tags: ${safeStr(stepTags.join(" | "))}`, 20, y);
      y += 5;
    }

    doc.setDrawColor(240, 240, 240);
    doc.line(15, y - 2, 195, y - 2);
    y += 4;
  });

  doc.save("Atrevete-Espana-Hoja-de-Ruta-Estudios.pdf");
}

// 2. VISA GUIDE PDF Generator
export function downloadVisaPDF(visaData: any, country: string, lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const countryName = country === "morocco" ? "Marruecos" : country === "algeria" ? "Argelia" : country === "tunisia" ? "Tunez" : country === "egypt" ? "Egipto" : country;
  drawPDFFrame(doc, `Guia Consular de Visado`, `Requisitos Oficiales para Estudiantes de ${countryName}`);

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(12, 18, 34);
  doc.text(`EXPEDIENTE DE VISADO NACIONAL DE ESTUDIOS (${countryName.toUpperCase()})`, 15, y);
  
  y += 2;
  doc.line(15, y, 195, y);
  y += 6;

  if (visaData) {
    // Requirements
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text("REQUISITOS FUNDAMENTALES (CONVENCION DE EXTRANJERIA):", 15, y);
    y += 5;

    const requirements = visaData.requirements?.[lang] || visaData.requirements?.["es"] || [];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);

    requirements.forEach((reqStr: string, rIdx: number) => {
      const splitReq = doc.splitTextToSize(`- ${reqStr}`, 170);
      doc.text(splitReq, 18, y);
      y += (splitReq.length * 4) + 1;
    });

    y += 4;
    // Interview tips
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text("CONSEJOS ADICIONALES PARA LA ENTREVISTA CONSULAR:", 15, y);
    y += 5;

    const tips = visaData.tips?.[lang] || visaData.tips?.["es"] || [];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);

    tips.forEach((tipStr: string, tIdx: number) => {
      const splitTip = doc.splitTextToSize(`* ${tipStr}`, 170);
      doc.text(splitTip, 18, y);
      y += (splitTip.length * 4) + 1;
    });

    y += 4;
    // Costs disclaimer
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(12, 18, 34);
    doc.text("TASAS Y TIEMPOS ESTIMADOS:", 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.text(`Tasa Administrativa Consular: ~80 EUR (Pagadero en moneda local en el consulado / BLS / VFS).`, 18, y);
    y += 4;
    doc.text(`Tiempo de Resolución Estimado: 15 a 45 dias laborables desde la entrega del expediente completo.`, 18, y);
    y += 4;
  }

  doc.save(`Atrevete-Espana-Guia-Visado-${country}.pdf`);
}

// 3. STUDY PROGRAMS PDF Generator
export function downloadFormationsPDF(formationsList: any[], search: string, selectedSpec: any, lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, "Catalogo de Formaciones", "Programas de FP de Grado Superior en Espana");

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 18, 34);
  
  if (selectedSpec) {
    const specName = selectedSpec.name?.[lang] || selectedSpec.name?.["es"] || selectedSpec.name?.["en"] || String(selectedSpec);
    doc.text(`DETALLE DE ESPECIALIDAD: ${safeStr(specName)}`, 15, y);
    y += 2;
    doc.line(15, y, 195, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text("DESCRIPCION GENERAL Y ATRIBUCION PROFESIONAL:", 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    const descText = selectedSpec.description?.[lang] || selectedSpec.description?.["es"] || "Esta especialidad capacita para ejercer responsabilidades tecnicas clave en empresas de servicios, tecnologia o salud en Espana.";
    const splitDesc = doc.splitTextToSize(safeStr(descText), 170);
    doc.text(splitDesc, 15, y);
    y += (splitDesc.length * 4) + 5;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text("SALIDAS PROFESIONALES EN ESPANA:", 15, y);
    y += 5;

    const opportunities = selectedSpec.outlets?.[lang] || selectedSpec.outlets?.["es"] || selectedSpec.salidas?.[lang] || selectedSpec.salidas?.["es"] || ["Tecnico superior calificado", "Administrador de sistemas / proyectos", "Desarrollador / Gestor especializado"];
    doc.setFont("helvetica", "normal");
    opportunities.forEach((out: string) => {
      doc.text(`- ${safeStr(out)}`, 18, y);
      y += 4;
    });
  } else {
    doc.text("FAMILIAS PROFESIONALES RECOMENDADAS:", 15, y);
    y += 2;
    doc.line(15, y, 195, y);
    y += 6;

    const filtered = (formationsList || []).filter(f => {
      const nameVal = f.name?.[lang] || f.name?.["es"] || "";
      return !search || nameVal.toLowerCase().includes(search.toLowerCase());
    });

    filtered.slice(0, 10).forEach((f) => {
      if (y > 240) {
        doc.addPage();
        drawPDFFrame(doc, "Catalogo de Formaciones", "Programas de FP (Continuacion)");
        y = 48;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11);
      const famName = f.name?.[lang] || f.name?.["es"] || "Familia Profesional";
      doc.text(safeStr(famName), 15, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);

      const outlets = f.salidas?.[lang] || f.salidas?.["es"] || [];
      if (outlets.length > 0) {
        const splitO = doc.splitTextToSize(`Salidas profesionales: ${safeStr(outlets.join(" | "))}`, 170);
        doc.text(splitO, 15, y);
        y += (splitO.length * 4);
      }
      y += 4;
    });
  }

  doc.save("Atrevete-Espana-Catalogo-Formaciones-FP.pdf");
}

// 4. TRANSPORT CARDS PDF Generator
export function downloadTransportPDF(transportList: any[], search: string, lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, "Guia de Tarjetas de Transporte", "Descuentos Especiales para Estudiantes Jovenes");

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 18, 34);
  doc.text("INFORMACION OFICIAL DEL ABONO JOVEN Y ABONOS MENSUALES:", 15, y);
  y += 2;
  doc.line(15, y, 195, y);
  y += 6;

  const listToUse = transportList.filter(t => !search || t.city.toLowerCase().includes(search.toLowerCase()));

  listToUse.forEach((t) => {
    if (y > 240) {
      doc.addPage();
      drawPDFFrame(doc, "Guia de Tarjetas de Transporte", "Tarjetas de Transporte (Continuacion)");
      y = 48;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text(`${safeStr(t.city)} - ${safeStr(t.cardName)}`, 15, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(`Precio de Tarifa Joven: ${safeStr(t.price)}`, 15, y);
    y += 4;
    doc.text(`Requisito de Edad: ${safeStr(t.ageLimit)}`, 15, y);
    y += 4;

    const desc = t.description?.[lang] || t.description?.["es"] || "";
    const splitDesc = doc.splitTextToSize(safeStr(desc), 170);
    doc.text(splitDesc, 15, y);
    y += (splitDesc.length * 4) + 2;

    const steps = t.howToApply?.[lang] || t.howToApply?.["es"] || [];
    if (steps.length > 0) {
      y += 1;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("PASOS PARA SOLICITAR ONLINE O PRESENCIAL:", 15, y);
      y += 3.5;

      doc.setFont("helvetica", "normal");
      steps.forEach((step: string, sIdx: number) => {
        const splitS = doc.splitTextToSize(`${sIdx + 1}. ${step}`, 165);
        doc.text(splitS, 18, y);
        y += (splitS.length * 4);
      });
    }

    y += 4;
    doc.setDrawColor(240, 240, 240);
    doc.line(15, y - 2, 195, y - 2);
    y += 4;
  });

  doc.save("Atrevete-Espana-Guia-Transportes-Joven.pdf");
}

// 5. HOUSING / LODGING PDF Generator
export function downloadHousingPDF(housingData: any[], lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, "Guia de Alojamiento Estudiantil", "Tipologias, Contratos y Tramites Obligatorios");

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 18, 34);
  doc.text("ALQUILER DE HABITACIONES Y RESIDENCIAS PARA ESTUDIANTES:", 15, y);
  y += 2;
  doc.line(15, y, 195, y);
  y += 6;

  housingData.forEach((h) => {
    if (y > 240) {
      doc.addPage();
      drawPDFFrame(doc, "Guia de Alojamiento Estudiantil", "Alojamiento (Continuacion)");
      y = 48;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    
    const hTitle = h.title?.[lang] || h.title?.["es"] || "";
    doc.text(safeStr(hTitle), 15, y);
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);

    const desc = h.description?.[lang] || h.description?.["es"] || "";
    const splitDesc = doc.splitTextToSize(safeStr(desc), 170);
    doc.text(splitDesc, 15, y);
    y += (splitDesc.length * 4) + 2.5;

    const advice = h.advice?.[lang] || h.advice?.["es"] || [];
    if (advice.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text("CONSEJOS FUNDAMENTALES (SEGURIDAD Y FIANZAS):", 15, y);
      y += 3.5;

      doc.setFont("helvetica", "normal");
      advice.forEach((ad: string) => {
        const splitAd = doc.splitTextToSize(`* ${ad}`, 165);
        doc.text(splitAd, 18, y);
        y += (splitAd.length * 4);
      });
    }

    y += 4;
    doc.setDrawColor(240, 240, 240);
    doc.line(15, y - 2, 195, y - 2);
    y += 4;
  });

  doc.save("Atrevete-Espana-Guia-Suelo-Alojamiento.pdf");
}

// 6. SPANISH LESSONS COURSE PDF Generator
export function downloadLessonPDF(lesson: any, level: string, page: number, topic: string, lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, `Curso de Espanol - Nivel ${level}`, `Modulo Teorico - Pagina ${page}: ${topic}`);

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 18, 34);
  doc.text(`TEMA OPERANTE: ${safeStr(topic).toUpperCase()}`, 15, y);
  y += 2;
  doc.line(15, y, 195, y);
  y += 6;

  if (lesson) {
    // 1. Introduction
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text("INTRODUCCION TEORICA:", 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    const theory = lesson.explanation || lesson.theory || "Teoria para dominar la comunicacion inicial en Espana.";
    const splitTheory = doc.splitTextToSize(safeStr(theory), 170);
    doc.text(splitTheory, 15, y);
    y += (splitTheory.length * 4) + 5;

    // 2. Vocabulary
    if (lesson.vocabulary && lesson.vocabulary.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11);
      doc.text("GLOSARIO DE VOCABULARIO CLAVE:", 15, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      lesson.vocabulary.forEach((item: any) => {
        if (y > 250) {
          doc.addPage();
          drawPDFFrame(doc, `Curso de Espanol - Nivel ${level}`, `Vocabulario (Continuacion)`);
          y = 48;
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${safeStr(item.spanish || item.sp)}`, 15, y);
        doc.setFont("helvetica", "normal");
        doc.text(`- Significado: ${safeStr(item.meaning || item.en || item.fr || "Traduccion")}`, 60, y);
        y += 4.5;
      });
      y += 3;
    }

    // 3. Dialogue
    if (lesson.dialogue && lesson.dialogue.length > 0) {
      if (y > 230) {
        doc.addPage();
        drawPDFFrame(doc, `Curso de Espanol - Nivel ${level}`, `Vocabulario`);
        y = 48;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11);
      doc.text("DIALOGO DE CONVERSACION DE REFERENCIA:", 15, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      lesson.dialogue.forEach((line: any) => {
        if (y > 250) {
          doc.addPage();
          drawPDFFrame(doc, `Curso de Espanol - Nivel ${level}`, `Dialogo (Continuacion)`);
          y = 48;
        }
        doc.setFont("helvetica", "bold");
        doc.text(`${safeStr(line.speaker)}:`, 15, y);
        doc.setFont("helvetica", "normal");
        const utterance = line.spanish || line.sp || line.text || "";
        const translation = line.translation || line.translated || "";
        doc.text(`"${safeStr(utterance)}"`, 35, y);
        y += 4;
        doc.setTextColor(110, 110, 110);
        doc.text(`(${safeStr(translation)})`, 35, y);
        doc.setTextColor(30, 30, 30);
        y += 5;
      });
    }
  }

  doc.save(`Atrevete-Espana-Curso-Espanol-${level}-Pagina-${page}.pdf`);
}

// 7. STUDENT LIFE GUIDE PDF Generator
export function downloadStudentLifePDF(cityObj: any, lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, `Guia de Vida Estudiantil: ${cityObj.city}`, "Zonas de Ocio, Supermercados y Coste de Vida");

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(12, 18, 34);
  doc.text(`COSTE DE VIDA Y ESTILO EN ${safeStr(cityObj.city).toUpperCase()}`, 15, y);
  y += 2;
  doc.line(15, y, 195, y);
  y += 6;

  if (cityObj) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text("COSTES MEDIOS ESTIMADOS MENSUALES:", 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(`* Alquiler habitacion compartida: ${safeStr(cityObj.avgHabitacion)} / mes`, 15, y);
    y += 4.5;
    doc.text(`* Cesta de la compra basica: ${safeStr(cityObj.avgCompra)} / mes`, 15, y);
    y += 4.5;
    doc.text(`* Abono tarjeta de transporte Joven: ${safeStr(cityObj.abonoTransporte)} / mes`, 15, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text("PRINCIPALES SUPERMERCADOS BARATOS:", 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    const superm = cityObj.supermarkets || ["Mercadona", "Lidl", "Carrefour", "Dia"];
    doc.text(`Recomendaciones de compra: ${safeStr(superm.join(" | "))}`, 15, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text("UNIVERSIDADES PRINCIPALES Y CENTROS DE SELECTIVIDAD:", 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    const univs = cityObj.universities || [];
    univs.forEach((u: string) => {
      doc.text(`- ${safeStr(u)}`, 18, y);
      y += 4.5;
    });

    y += 3;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 158, 11);
    doc.text("CONSEJOS CLAVE DE EMPADRONAMIENTO Y RESIDENCIA:", 15, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    const adviceText = "Recuerda darte de alta en el Padron Municipal del Ayuntamiento inmediatamente al firmar el contrato de alquiler para poder solicitar tu cita de tarjeta de residencia (TIE) de forma oficial.";
    const splitAdv = doc.splitTextToSize(safeStr(adviceText), 170);
    doc.text(splitAdv, 15, y);
  }

  doc.save(`Atrevete-Espana-Guia-Vida-Estudiantil-${cityObj.city}.pdf`);
}

// 8. EMPLOYMENT PDF Generator
export function downloadEmploymentPDF(lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, "Guia de Insercion Laboral", "Regulación sobre contratos de Practicas y Trabajo Post-Estudio");

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 18, 34);
  doc.text("CONVENIOS DE PRACTICAS Y LEY DE EXTRANJERIA:", 15, y);
  y += 2;
  doc.line(15, y, 195, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11);
  doc.text("1. MODIFICACION DE ESTANCIA POR ESTUDIOS A TRABAJO EN ESPANA:", 15, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  const body1 = "Con la vigente reforma del Reglamento de Extranjeria, las estudiantes extranjeras que finalicen sus estudios Superiores de FP Grado Superior o Grado Universitario con exito pueden modificar directamente su autorizacion de estancia por estudios a una autorizacion de residencia y trabajo (cuenta ajena o propia) sin tener que cumplir el requisito anterior de 3 anos de estancia previa en Espana.";
  const splitB1 = doc.splitTextToSize(body1, 172);
  doc.text(splitB1, 15, y);
  y += (splitB1.length * 4) + 4;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(245, 158, 11);
  doc.text("2. PRACTICAS ACADEMICAS CURRICULARES Y EXTRACURRICULARES:", 15, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  const body2 = "Los ciclos formativos de Grado Superior en Espana en el segundo ano incluyen obligatoriamente el modulo de Formacion en Centros de Trabajo (FCT), que consiste en practicas reales en centros profesionales locales. Existe la posibilidad de prorrogar este vinculo mediante un Convenio de Practicas Extracurriculares remuneradas con una duracion maxima de 30 horas semanales compatible con su NIE de estudiante.";
  const splitB2 = doc.splitTextToSize(body2, 172);
  doc.text(splitB2, 15, y);
  y += (splitB2.length * 4) + 4;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(245, 158, 11);
  doc.text("3. VISA DE BUSQUEDA DE EMPLEO (DURACION 12 MESES):", 15, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  const body3 = "Tras titularse en el Grado Superior o Universitario, si la alumna aun no cuenta con una oferta formal de empleo inmediata, puede solicitar formalmente la 'Autorizacion de residencia al estudiante para la busqueda de empleo' contemplada en la Ley 14/2013 de apoyo a los emprendedores, que concede 12 meses improrrogables para buscar puestos vinculados con su calificacion académica.";
  const splitB3 = doc.splitTextToSize(body3, 172);
  doc.text(splitB3, 15, y);

  doc.save("Atrevete-Espana-Guia-Normativa-Empleo.pdf");
}

// 9. TEACHERS PDF Generator
export function downloadTeachersPDF(teachersList: any[], lang: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  drawPDFFrame(doc, "Directorio de Profesores y Tutores", "Contacto y Apoyo para el Alumnado Extranjero");

  let y = 48;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(12, 18, 34);
  doc.text("EQUIPO DOCENTE HOMOLOGADO - SESIONES PARTICULARES:", 15, y);
  y += 2;
  doc.line(15, y, 195, y);
  y += 6;

  const validTeachers = teachersList && teachersList.length > 0 ? teachersList : [
    { name: "Prof. Alberto S.", subject: "Preparacion PCE Selectividad & Lengua", email: "alberto.suarez@edu.es", rating: 4.9, bio: "Especialista con mas de 8 anos de experiencia en convalidaciones y preparación de quimica, física y lengua castellana para el alumnado extranjero." },
    { name: "Dra. Maria Gomez", subject: "Bolsa de Sanidad & FP Enfermeria", email: "maria.gomez@salud.es", rating: 5.0, bio: "Tutorizacion de modulos técnicos sanitarios y practicas en hospitales españoles." },
    { name: "Ing. Carlos Ruiz", subject: "Informatica, Programacion & FP DAW/DAM", email: "carlos.ruiz@daw.es", rating: 4.8, bio: "Ingeniero web senior que ayuda a alumnos en proyectos finales de Grado Superior DAW." }
  ];

  validTeachers.forEach((t) => {
    if (y > 240) {
      doc.addPage();
      drawPDFFrame(doc, "Directorio de Profesores y Tutores", "Directorio Profesional (Continuacion)");
      y = 48;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(245, 158, 11);
    doc.text(`${safeStr(t.name)} - ${t.rating || 5.0} ★`, 15, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text(`Asignatura: ${safeStr(t.subject)}`, 15, y);
    y += 4;
    doc.text(`Contacto Oficial: ${safeStr(t.email)}`, 15, y);
    y += 4.5;

    const splitBio = doc.splitTextToSize(`"${t.bio}"`, 170);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(splitBio, 15, y);
    y += (splitBio.length * 4) + 4;

    doc.setDrawColor(240, 240, 240);
    doc.line(15, y - 2, 195, y - 2);
    y += 4;
  });

  doc.save("Atrevete-Espana-Directorio-Docente-Tutores.pdf");
}
