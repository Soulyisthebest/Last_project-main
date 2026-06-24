export interface CVTemplate {
  title: string;
  enTitle: string;
  data: {
    name: string;
    email: string;
    role: string;
    city: string;
    edu: string;
    skills: string;
    exp: string;
  }
}

export const CV_TEMPLATES: CVTemplate[] = [
  {
    title: "Desarrollador Web (Web Developer)",
    enTitle: "Web Developer",
    data: {
      name: "Ahmed Al-Mansoori",
      email: "ahmed.mansoori@gmail.com",
      role: "Desarrollador Web Full Stack Junior",
      city: "Madrid, España",
      edu: "Grado Superior en Desarrollo de Aplicaciones Web (DAW) / BootCamp FullStack",
      skills: "HTML5, CSS3, JavaScript, React, Node.js, Git, SQL, Español (A2), Árabe (Nativo), Inglés (B2)",
      exp: "Desarrollo de portfolio de aplicaciones responsivas utilizando React y Tailwind. Prácticas en proyectos colaborativos en GitHub y resolución de incidencias frontend."
    }
  },
  {
    title: "Camarero / Hostelería (Bar & Restaurant Staff)",
    enTitle: "Bar & Restaurant Staff",
    data: {
      name: "Youssef El-Idrissi",
      email: "youssef.elidrissi@outlook.com",
      role: "Camarero / Personal de Sala y Barra",
      city: "Barcelona, España",
      edu: "Certificado de Profesionalidad en Servicios de Bar y Cafetería / Carnet de Manipulador de Alimentos",
      skills: "Atención al cliente de excelencia, toma de comandas digitales (PDA), preparación de cafés y copas, Español (B1), Árabe (Nativo), Francés (C1)",
      exp: "Servizo dinámico de barra y mesas en cafetería de gran afluencia. Preparación de bebidas tradicionales y mantenimiento estricto de higiene APPCC."
    }
  },
  {
    title: "Dependiente de Tienda (Retail Store Clerk)",
    enTitle: "Retail Store Clerk",
    data: {
      name: "Fatima Zahra",
      email: "fatima.zahra@gmail.com",
      role: "Dependiente y Gestor de Comercio / Retail",
      city: "Valencia, España",
      edu: "Grado Medio en Actividades Comerciales o Educación Secundaria Homologada",
      skills: "Técnicas de venta, gestión de caja (TPV), visual merchandising, reposición, Español (B2), Árabe (Nativo), Inglés (B1)",
      exp: "Atención personalizada al cliente en tienda textil líder. Gestión de inventario con Excel, cobros rápidos en caja e implantación de rebajas estacionales."
    }
  },
  {
    title: "Recepcionista de Hotel (Hotel Receptionist)",
    enTitle: "Hotel Receptionist",
    data: {
      name: "Rania Belhadj",
      email: "rania.rec@outlook.com",
      role: "Recepcionista de Hotel / Guest Relations",
      city: "Sevilla, España",
      edu: "Grado Superior en Gestión de Alojamientos Turísticos",
      skills: "Software de reservas PMS (Opera), atención telefónica trilingüe, check-in/out, Español (B2), Árabe (Nativo), Francés (C1), Inglés (B2)",
      exp: "Recepción de huéspedes nacionales e internacionales en hotel boutique de 4 estrellas. Facturación diaria, resolución de quejas con empatía y guiado local."
    }
  },
  {
    title: "Agente de Call Center bilingüe (Bilingual Call Center Agent)",
    enTitle: "Bilingual Call Center Agent",
    data: {
      name: "Karim Benjelloun",
      email: "karim.call@gmail.com",
      role: "Agente Telefónico de Atención al Cliente y Soporte Bilingüe",
      city: "Málaga, España",
      edu: "Estudios Universitarios de Filología o Comercio Internacional",
      skills: "Escucha activa, resolución ágil de incidencias, software de CRM (Salesforce), Español (B1), Francés (Nativo), Árabe (Nativo), Inglés (B1)",
      exp: "Soporte internacional de nivel 1 para plataforma fintech de habla francesa. Gestión de 60 llamadas diarias manteniendo KPI de excelencia."
    }
  },
  {
    title: "Marketing Digital (Digital Marketing Specialist)",
    enTitle: "Digital Marketing Specialist",
    data: {
      name: "Amira Naouri",
      email: "amira.mkt@gmail.com",
      role: "Especialista en Marketing Digital y Redes Sociales",
      city: "Madrid, España",
      edu: "Grado Universitario en Marketing y Comunidades Digitales",
      skills: "Gestión de Redes Sociales, SEO, Copywriting creativo, Google Ads, Canva, Español (B1), Inglés (C1), Árabe (Nativo)",
      exp: "Creación de calendarios editoriales de contenido y campañas de pago en Instagram para marcas locales. Análisis de métricas (Google Analytics)."
    }
  },
  {
    title: "Repartidor / Logística (Delivery Rider & Logistics Support)",
    enTitle: "Delivery Rider & Logistics Support",
    data: {
      name: "Bilal Saddiki",
      email: "bilal.saddiki@yahoo.com",
      role: "Repartidor a domicilio / Mozo de Almacén",
      city: "Zaragoza, España",
      edu: "Educación Secundaria Homologada / Carnet de Conducir B",
      skills: "Navegación GPS, puntualidad estricta, organización de almacén, Español (A2), Árabe (Nativo), Francés (A2)",
      exp: "Reparto de última milla para plataforma e-commerce líder garantizando tiempos mínimos. Carga, descarga y clasificación de mercancía en centro logístico."
    }
  },
  {
    title: "Profesor Adjunto de Idiomas (Assistant Language Teacher)",
    enTitle: "Assistant Language Teacher",
    data: {
      name: "Tariq Mansouri",
      email: "tariq.lang@outlook.es",
      role: "Auxiliar de Conversación o Profesor de Idioma (Árabe / Francés)",
      city: "Granada, España",
      edu: "Grado de Estudios Árabes y Franceses / Homologación Universitaria",
      skills: "Pedagogía activa, dinamización de grupos juveniles, Español (B2), Árabe (Nativo), Francés (C2)",
      exp: "Impartición de clases particulares de conversación de francés e iniciación lingüística al árabe para adultos españoles y estudiantes de secundaria."
    }
  },
  {
    title: "Auxiliar Administrativo (Administrative Assistant)",
    enTitle: "Administrative Assistant",
    data: {
      name: "Nour El Houda",
      email: "nour.houda@outlook.com",
      role: "Auxiliar Administrativo / Gestión de Archivos",
      city: "Murcia, España",
      edu: "Grado Técnico Medio en Gestión Administrativa (GAD)",
      skills: "Paquete Office (Excel/Word avanzado), facturación, archivo documental, Español (B1), Árabe (Nativo), Francés (B2)",
      exp: "Apoyo en oficina comercial con escaneado de documentación legal, facturación general a proveedores y atención receptiva de clientes de habla francesa."
    }
  },
  {
    title: "Traductor / Intérprete (Translator & Interpreter)",
    enTitle: "Translator & Interpreter",
    data: {
      name: "Selma Ouali",
      email: "selma.translator@gmail.com",
      role: "Traductor e Intérprete Técnico (Español - Árabe - Francés)",
      city: "Barcelona, España",
      edu: "Grado en Traducción e Interpretación / Certificación en Mediación Linguística",
      skills: "Traducción simultánea, redacción impecable, Español (C1), Árabe (Nativo), Francés (Nativo), Inglés (B2)",
      exp: "Servicios de interpretación bilateral en eventos de pymes y acompañamiento a estudiantes internacionales en trámites de Extranjería."
    }
  },
  {
    title: "Diseñador Gráfico (Graphic Designer & UI/UX)",
    enTitle: "Graphic Designer",
    data: {
      name: "Anas Boulaich",
      email: "anas.designer@gmail.com",
      role: "Diseñador Gráfico Junior / Creador de Contenidos UI",
      city: "Alicante, España",
      edu: "Grado en Diseño Gráfico o Bellas Artes / Prácticas Profesionales",
      skills: "Adobe Photoshop, Illustrator, Figma, creatividad aplicada, Español (B1), Árabe (Nativo), Inglés (B1)",
      exp: "Diseño de logotipos, cartelería promocional y creatividades para banners de redes sociales de startups españolas. Manejo de maquetación en Figma."
    }
  },
  {
    title: "Cajero de Supermercado (Supermarket Cashier & Clerk)",
    enTitle: "Supermarket Cashier",
    data: {
      name: "Sofian Cherkaoui",
      email: "sofian.merca@outlook.com",
      role: "Cajero de Supermercado y Reponedor de Tienda",
      city: "Salamanca, España",
      edu: "Educación Secundaria Homologada (ESO)",
      skills: "Cuadrado de caja, agilidad en básculas, reposición sistemática, Español (A2), Árabe (Nativo), Francés (B1)",
      exp: "Cobro y atención al público en cadena de alimentación mayorista. Gestión rápida de incidencias con tiques y mantenimiento del orden del pasillo."
    }
  },
  {
    title: "Guía Turístico (Local Tour Guide)",
    enTitle: "Local Tour Guide",
    data: {
      name: "Moustafa Reda",
      email: "moustafa.guide@gmail.com",
      role: "Guía Turístico acompañante / Dinamizador Cultural",
      city: "Córdoba, España",
      edu: "Grado Superior en Guía, Información y Asistencias Turísticas",
      skills: "Historia de Andalucía, conducción de grupos, oratoria clara, Español (B2), Árabe (Nativo), Inglés (C1)",
      exp: "Colaboración en free tours guiados por el centro histórico de la ciudad explicando los orígenes musulmanes y la Mezquita de Córdoba a extranjeros."
    }
  },
  {
    title: "Asistente de Ventas (Sales Assistant & Account Rep)",
    enTitle: "Sales Assistant",
    data: {
      name: "Wassim Hammadi",
      email: "wassim.ventas@outlook.com",
      role: "Asistente Comercial de Ventas / Promotor de Marca",
      city: "Gijón, España",
      edu: "Educación Secundaria Homologada / Carnet de Manipulador comercial",
      skills: "Habilidades persuasivas, captación en frío, optimismo comercial, Español (A2), Árabe (Nativo), Francés (A2)",
      exp: "Promoción de tarifas de telecomunicaciones en centros comerciales con captación directa de más de 30 leads validados por semana."
    }
  },
  {
    title: "Soporte Técnico de TI (Helpdesk & IT Support)",
    enTitle: "IT Support Specialist",
    data: {
      name: "Hassan Fassi",
      email: "hassan.it@gmail.com",
      role: "Técnico de Helpdesk de Sistemas y Redes Informáticas",
      city: "Madrid, España",
      edu: "Grado Superior en Administración de Sistemas Informáticos en Red (ASIR)",
      skills: "Windows/Linux, redes locales TCP/IP, Active Directory, ticketera Jira, Español (B1), Árabe (Nativo), Inglés (B1)",
      exp: "Soporte remoto para resolución de problemas de software de ofimática, conectividad de red local y configuración de terminales corporativos."
    }
  }
];
