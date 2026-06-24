/**
 * Detailed information about curriculum and taught subjects for all specialties in Spain's educational portal.
 * Supports English, Spanish, Arabic, and French.
 */

export interface SpecialtyDetail {
  description: string;
  subjects: string[];
  skills: string[];
  duration: string;
}

const STATIC_DETAILS: Record<string, Record<string, SpecialtyDetail>> = {
  "Multiplatform App Development (DAM)": {
    es: {
      description: "Esta titulación oficial capacita para diseñar, programar y desplegar aplicaciones en múltiples soportes, con especial atención a dispositivos móviles (Android/iOS), entornos de escritorio y sistemas embebidos utilizando lenguajes modernos robustos.",
      subjects: [
        "Programación Orientada a Objetos (Java y Kotlin)",
        "Desarrollo de Interfaces Gráficas Avanzadas e Interactivas",
        "Programación de Servicios y Procesos (Concurrencia y Sockets)",
        "Sistemas de Gestión de Bases de Datos Relacionales e Híbridos",
        "Sistemas de Planificación de Recursos (ERP/CRM: SAP y Odoo)",
        "Entornos de Desarrollo, Testing Unitario y Control de Versiones (Git)",
        "Acceso a Datos y Persistencia de Información Segura"
      ],
      skills: [
        "Desarrollar apps móviles nativas con alto rendimiento",
        "Gestionar despliegues continuos e integraciones",
        "Configurar backend robusto y conectar con bases de datos seguras",
        "Diseñar interfaces multidispositivo con diseño responsivo"
      ],
      duration: "2.000 horas (2 cursos académicos, incluyendo 400h de prácticas en empresa)"
    },
    en: {
      description: "This official qualification trains you to design, program, and deploy applications across multiple platforms, with specialized focus on mobile devices (Android/iOS), desktop systems, and modern embedded software engines.",
      subjects: [
        "Object-Oriented Programming (Java and Kotlin)",
        "Graphical User Interface (UI/UX) Development",
        "Services and Processes Programming (Concurrency & Sockets)",
        "Relational and Hybrid Database Management Systems",
        "Enterprise Resource Planning (ERP/CRM: SAP and Odoo)",
        "Development Environments, Testing, and Version Control (Git)",
        "Data Access and Secure Information Persistence"
      ],
      skills: [
        "Build high-performance native mobile apps",
        "Manage continuous deployment and integrations",
        "Configure robust backend engines and secure data storage",
        "Design multi-device interfaces with responsive behavior"
      ],
      duration: "2,000 hours (2 academic years, including 400 hours of company internships)"
    },
    fr: {
      description: "Ce diplôme officiel prépare à concevoir, programmer et déployer des applications sur de nombreux supports, en mettant l'accent sur les smartphones (Android/iOS), les systèmes de bureau et les objets connectés.",
      subjects: [
        "Programmation Orientée Objet (Java et Kotlin)",
        "Développement d'interfaces graphiques multi-écrans",
        "Programmation de Services et Processus (Concurrence & Sockets)",
        "Systèmes de Gestion de Bases de Données (SQL & NoSQL)",
        "Systèmes de planification de ressources (ERP/CRM: SAP & Odoo)",
        "Environnements de développement, Tests unitaires et Git",
        "Accès aux données et persistance de l'information sécurisée"
      ],
      skills: [
        "Créer des applications mobiles natives fluides et optimisées",
        "Gérer des pipelines de déploiement continu",
        "Développer des solutions backend connectées et fiables",
        "Modéliser des interfaces UX conformes aux exigences modernes"
      ],
      duration: "2 000 heures (2 ans d'études, dont 400 heures de stage pratique)"
    },
    ar: {
      description: "تؤهلك هذه الشهادة الرسمية المرموقة لتصميم وبرمجة ونشر التطبيقات على منصات متعددة، مع التركيز الأساسي على الأجهزة المحمولة (أندرويد وآي أو إس)، برمجيات سطح المكتب، والأنظمة المدمجة الذكية.",
      subjects: [
        "البرمجة كائنية التوجه (Java & Kotlin)",
        "تطوير الواجهات الرسومية التفاعلية وتجربة المستخدم (UI/UX)",
        "برمجة الخدمات والعمليات المتزامنة (Concurrency & Sockets)",
        "نظم إدارة وقواعد البيانات العلائقية والمدمجة",
        "أنظمة تخطيط موارد المؤسسات (ERP/CRM مثل SAP و Odoo)",
        "بيئات التطوير المتكاملة، الاختبارات الآلية، وإدارة الإصدارات (Git)",
        "الوصول الآمن للبيانات والربط السحابي للبرمجيات"
      ],
      skills: [
        "بناء تطبيقات هواتف ذكية أصلية عالية الأداء والاستجابة",
        "إدارة بروتوكولات النشر والدمج المستمر للمشاريع التقنية",
        "إعداد البنى التحتية البرمجية والربط الآمن بقواعد البيانات السحابية",
        "ابتكار واجهات متناسقة تعمل على مختلف مقاسات شاشات الأجهزة"
      ],
      duration: "2000 ساعة (سنتان أكاديميتان، تشمل 400 ساعة من التدريب العملي في الشركات)"
    }
  },
  "Web App Development (DAW)": {
    es: {
      description: "Especialización integral en ingeniería web full-stack, donde aprenderás a dominar tanto las interfaces de usuario modernas en el navegador como los potentes servicios y servidores backend que gestionan la lógica empresarial.",
      subjects: [
        "Desarrollo Web en Entorno Cliente (React, Vue, TypeScript, ES6)",
        "Desarrollo Web en Entorno Servidor (Node.js, Express, PHP)",
        "Diseño e Implementación de Interfaces Web Accesibles y Estilizadas",
        "Bases de Datos Avanzadas Relacionales y Documentales (PostgreSQL, MongoDB)",
        "Despliegue de Aplicaciones en la Nube (Docker, Nginx, CI/CD, AWS)",
        "Gestión de APIs RESTful y GraphQL con Seguridad y Tokens JWT",
        "Metodologías Ágiles de Desarrollo de Software (Scrum, Kanban)"
      ],
      skills: [
        "Crear aplicaciones web modernas interactivas de una sola página (SPA)",
        "Crear APIs seguras, escalables y sistemas de autenticación de alta seguridad",
        "Administrar servidores, redes, dominios y arquitecturas cloud básicas",
        "Garantizar accesibilidad universal y compatibilidad en todos los navegadores web"
      ],
      duration: "2.000 horas (2 cursos académicos, incluyendo 400h de prácticas en empresas tecnológicas)"
    },
    en: {
      description: "A comprehensive specialization in full-stack web engineering, where you will master modern client-side user interfaces as well as the powerful backend servers and database layers driving enterprise-level logic.",
      subjects: [
        "Client-Side Web Development (React, Vue, TypeScript, ES6+)",
        "Server-Side Web Development (Node.js, Express, PHP)",
        "Accessible, High-Fidelity UI Design & Directives (HTML5, Tailwind)",
        "Advanced Relational and Document Databases (PostgreSQL, MongoDB)",
        "Cloud Application Deployment & Virtualization (Docker, CI/CD, AWS)",
        "Developing Secure RESTful & GraphQL APIs with JWT auth",
        "Agile Software Project Methodologies (Scrum & Team Work)"
      ],
      skills: [
        "Build rich, fast single-page interactive web applications (SPA)",
        "Implement high-security user authentication and access controls",
        "Deploy and monitor systems on web servers with Nginx/Docker environments",
        "Assure semantic accessibility and pixel-perfect cross-browser consistency"
      ],
      duration: "2,000 hours (2 academic years, including 400 hours of professional tech internships)"
    },
    fr: {
      description: "Une spécialisation complète en ingénierie web full-stack, vous permettant de maîtriser à la fois la création d'interfaces utilisateur modernes et robustes et les systèmes de serveurs qui propulsent l'économie numérique.",
      subjects: [
        "Développement Web Côté Client (React, Vue, TypeScript, ES6+)",
        "Développement Web Côté Serveur (Node.js, Express, PHP)",
        "Conception d'interfaces web réactives et ergonomiques",
        "Bases de données avancées relationnelles et NoSQL (Postgres, MongoDB)",
        "Déploiement d'applications cloud (Docker, Nginx, CI/CD, VPS)",
        "Création d'API RESTful et GraphQL hautement sécurisées",
        "Gestion de projet agile et outils de collaboration"
      ],
      skills: [
        "Donner vie à des applications web interactives de dernière génération (SPA)",
        "Développer des APIs backend performantes et des protocoles de sécurité",
        "Configurer et superviser des serveurs et réseaux d'hébergement",
        "Assurer une conformité d'accessibilité optimale (normes WCAG)"
      ],
      duration: "2 000 heures (2 ans d'études, dont 400 heures de stage en entreprise informatique)"
    },
    ar: {
      description: "تخصص شامل ومتكامل في هندسة الويب وتطوير المواقع والتطبيقات السحابية (Full-Stack)، حيث ستتعلم كيفية بناء واجهات المستخدم الحديثة بالإضافة إلى خوادم التشغيل الخلفية وإدارة الشبكات وقواعد البيانات.",
      subjects: [
        "تطوير الويب لجهة العميل والمستعرض (React, Vue, TypeScript, ES6)",
        "تطوير غرف وحزم الخوادم الخلفية لجهة السيرفر (Node.js, Express, PHP)",
        "تصميم واجهات المواقع المتجاوبة والذكية وسهلة الوصول (HTML5, Tailwind)",
        "قواعد البيانات المتقدمة العلائقية وغير الهيكلية (PostgreSQL, MongoDB)",
        "نشر وتوجيه استضافة التطبيقات (Docker, CI/CD, Nginx, Cloud)",
        "برمجة وهيكلة واجهات التطبيقات (APIs RESTful & GraphQL) مع بروتوكولات الحماية",
        "منهجيات العمل المرنة وإدارة دورة حياة البرمجيات (Scrum & Agile)"
      ],
      skills: [
        "برمجة تطبيقات ويب تفاعلية فائقة السرعة ومتكاملة (SPA)",
        "تأمين قواعد البيانات، وتشفير كلمات المرور، وأنظمة تسجيل الدخول المشفرة",
        "إدارة وإعداد خطوط السيرفرات السحابية الافتراضية والتعامل مع الخوادم",
        "ضمان التوافق المطلق للمواقع مع محركات البحث SEO ومعايير الوصول القياسية"
      ],
      duration: "2000 ساعة (سنتان دراسيتان، تشمل فترات تدريب مكثفة في كبريات الشركات الرقمية)"
    }
  },
  "Network Systems Administration (ASIR)": {
    es: {
      description: "Prepárate para ser el pilar tecnológico de las organizaciones, administrando sistemas operativos de servidor, gestionando complejas redes cableadas e inalámbricas, y garantizando la seguridad informática ante incidentes.",
      subjects: [
        "Administración de Sistemas Operativos de Servidor (Linux y Windows Server)",
        "Planificación y Configuración de Infraestructuras de Red (Cisco, LAN/WAN)",
        "Gestión de Servicios de Red Básicos y Avanzados (DNS, DHCP, Web, Correo)",
        "Seguridad Informática y Auditoría de Vulnerabilidades de Red",
        "Implantación y Modelado de Sistemas de Red en la Nube (AWS, Azure)",
        "Administración y Optimización de Bases de Datos Corporativas",
        "Fundamentos de Virtualización (Hyper-V, KVM, Docker, Proxmox)"
      ],
      skills: [
        "Diseñar, implantar y mantener redes corporativas escalables y estables",
        "Proteger sistemas críticos y establecer políticas activas de cortafuegos",
        "Automatizar tareas del sistema mediante scripts (Bash, Python, PowerShell)",
        "Asegurar copias de seguridad híbridas y sistemas de alta disponibilidad"
      ],
      duration: "2.000 horas (2 cursos académicos, incluyendo 400h de prácticas técnicas oficiales)"
    },
    en: {
      description: "Become the technical backbone of organizations, managing enterprise server operating systems, designing robust wired/wireless networks, and securing information assets against external security breaches.",
      subjects: [
        "Server Operating Systems Administration (Linux & Windows Server)",
        "Network Infrastructure Design and Deployment (Cisco LAN/WAN)",
        "Corporate Network Services Configuration (DNS, DHCP, Web, SMTP)",
        "Information Security Auditing, Hardening, and Intrusion Detection",
        "Cloud Network Architectures & Implementation (AWS, Azure, Cloud)",
        "Corporate Database Administration and Tuning",
        "Virtualization Technologies and Environments (Proxmox, Docker, VMware)"
      ],
      skills: [
        "Design, install, and optimize scalable enterprise architectures",
        "Protect mission-critical data assets and deploy network security firewalls",
        "Automate system routine tasks through scripting (Bash, Python, PowerShell)",
        "Coordinate operational data restore, backups, and failover architectures"
      ],
      duration: "2,000 hours (2 academic years, with a mandatory 400-hour corporate internship)"
    },
    fr: {
      description: "Ce diplôme vous forme à devenir le garant de la continuité numérique des entreprises, en gérant les parcs de serveurs, les architectures de réseaux d'interconnexion et la sécurité globale du système d'information.",
      subjects: [
        "Administration des Systèmes Serveurs (Linux et Windows Server)",
        "Architecture et routage des réseaux informatiques (Cisco, VLAN)",
        "Mise en place des services réseau d'entreprise (DNS, DHCP, Mail, VPN)",
        "Sécurité informatique et gestion des protocoles de défense",
        "Infrastructures réseau cloud (Amazon Web Services, Microsoft Azure)",
        "Gestion et administration des bases de données de production",
        "Technologies de virtualisation et conteneurisation (Docker, Proxmox)"
      ],
      skills: [
        "Concevoir et administrer un réseau informatique stable et résilient",
        "Détecter les intrusions et appliquer de strictes politiques de sécurité",
        "Automatiser l'administration système via des scripts d'infrastructure",
        "Planifier des systèmes de reprise après sinistre et haute disponibilité"
      ],
      duration: "2 000 heures (2 ans de cursus, avec un stage professionnel de 400 heures en infrastructure)"
    },
    ar: {
      description: "كن العمود الفقري التقني للشركات والمؤسسات، من خلال التخصص في إدارة خوادم أنظمة التشغيل، وتصميم البنى الأساسية للشبكات المحلية والعولمية وتأمين الأنظمة ضد الهجمات الإلكترونية.",
      subjects: [
        "إدارة خوادم أنظمة التشغيل الكبرى (Linux & Windows Server)",
        "تخطيط وتوجيه البنية التحتية للشبكات السلكية واللاسلكية (Cisco)",
        "إعداد وإدارة خدمات الشبكات المؤسساتية (DNS, DHCP, Mail, Web)",
        "الأمن السيبراني، وفحص الثغرات الأمنية، وإعداد الجدران النارية",
        "بناء تكنولوجيا السحابة المهجنة وإدارة استضافاتها (AWS, Azure)",
        "إدارة وتحسين أداء قواعد البيانات لخدمات الشركات والإنتاج",
        "تقنيات المحاكاة الافتراضية والحاويات المعزولة (Docker, Proxmox, VMware)"
      ],
      skills: [
        "تصميم، وتركيب، وصيانة شبكات الشركات بما يضمن كفاءتها العالية",
        "حماية البيانات الحساسة للمؤسسة وإعداد آليات جدران الحماية المتقدمة",
        "أتمتة الأعمال الإدارية الدورية للخناق عبر السكربتات (Bash, PowerShell)",
        "تأمين النسخ الاحتياطية وتفعيل بروتوكولات استمرارية العمل وصيانة الأنظمة"
      ],
      duration: "2000 ساعة (سنتان أكاديميتان، مع تدريب عملي موجه في مراكز تكنولوجيا المعلومات)"
    }
  },
  "Medicine & Health Studies": {
    es: {
      description: "La joya de la formación académica española, con un plan de estudios clínico riguroso e intensivo. Este grado prepara para ejercer la medicina, basándose en la excelencia científica, destrezas quirúrgicas y un enfoque humanista integral.",
      subjects: [
        "Anatomía Humana Sistemática y Neuroanatomía",
        "Fisiología Médica y Regulación Endocrina",
        "Biopatología y Farmacología Clínica General",
        "Medicina Interna (Cardiología, Neurología, Aparato Digestivo)",
        "Cirugía General, Traumatología y Urgencias Quirúrgicas",
        "Ginecología, Obstetricia y Pediatría Clínica",
        "Medicina Preventiva, Salud Pública y Bioética Médica"
      ],
      skills: [
        "Diagnosticar enfermedades y diseñar planes terapéuticos basados en evidencia",
        "Interpretar pruebas complejas (Radiografías, Analíticas, Resonancias, Electrocardiogramas)",
        "Realizar procedimientos clínicos, suturas y maniobras críticas de soporte vital",
        "Comunicar con empatía noticias complejas y gestionar la relación médico-paciente"
      ],
      duration: "6 años académicos (360 ECTS) + Acceso al prestigioso examen MIR español para especialización"
    },
    en: {
      description: "The jewel of Spanish academic training, featuring a highly rigorous and intensive clinical curriculum. This degree prepares you to practice medicine, combining scientific excellence, surgical precision, and a humanistic approach.",
      subjects: [
        "Systematic Human Anatomy and Neuroanatomy",
        "Medical Physiology and Endocrine Regulation",
        "General Pathology and Clinical Pharmacology",
        "Internal Medicine (Cardiology, Neurology, Digestive System)",
        "General Surgery, Traumatology and Surgical Emergencies",
        "Gynecology, Obstetrics and Clinical Pediatrics",
        "Preventive Medicine, Public Health and Medical Bioethics"
      ],
      skills: [
        "Diagnose clinical conditions and design evidence-based therapies",
        "Interpret complex studies (MRIs, Blood tests, ECGs, Radiographs)",
        "Perform medical procedures, closures, and critical life support resuscitation",
        "Deliver compassionate care and manage patient-physician trust and relationships"
      ],
      duration: "6 academic years (360 ECTS) + subsequent MIR Exam access for medical specialization in Spain"
    },
    fr: {
      description: "Le fleuron des études universitaires en Espagne, avec un programme d'enseignement à la fois dense et d'une grande rigueur clinique, associant compétences scientifiques et approche humaniste.",
      subjects: [
        "Anatomie Humaine Systématique et Neuroanatomie",
        "Physiologie Médicale et Système Endocrinien",
        "Pathopathologie Humaine et Pharmacologie Clinique",
        "Médecine Interne (Cardiologie, Neurologie, Gastro-entérologie)",
        "Chirurgie Générale, Traumatologie et Urgences Chirurgicales",
        "Gynécologie, Obstétrique et Pédiatrie Clinique",
        "Médecine Préventive, Santé Publique et Bioéthique Médicale"
      ],
      skills: [
        "Poser des diagnostics médicaux et concevoir des traitements personnalisés",
        "Interpréter des examens complémentaires (radios, IRM, bilans sanguins, ECG)",
        "Réaliser des actes médicaux de routine, des sutures et des gestes de premier secours",
        "Accompagner les patients avec compassion et respect des cadres éthiques"
      ],
      duration: "6 années universitaires (360 ECTS) + Concours d'internat MIR pour la spécialisation"
    },
    ar: {
      description: "جوهرة التعليم الجامعي الأكاديمي في إسبانيا، والمصنف ضمن الأرقى عالمياً بفضل تدريباته السريرية المكثفة والمنهج العلمي الدقيق. يعد هذا البرنامج الأطباء للممارسة المهنية المتفوقة والبحث العلمي وبناء المهارات الجراحية.",
      subjects: [
        "علم التشريح البشري المفصل وتشريح الجهاز العصبي",
        "علم وظائف الأعضاء (الفيزيولوجيا الطبية واللوائح الهرمونية)",
        "علم الأمراض وعلم الأدوية وعلاجاتها السريرية",
        "الطب الباطني (أمراض القلب والأوعية الدموية، الجهاز العصبي، الهضمي)",
        "الجراحة العامة، طب العظام والكسور، جراحات الطوارئ العاجلة",
        "طب النساء والتوليد، وشرائح الأمومة، وطب الأطفال",
        "الطب الوقائي، الصحة العامة للمجتمع، وأخلاقيات المهنة الطبية"
      ],
      skills: [
        "تشخيص الأمراض المختلفة ووضع خطط علاجية متكاملة وقائمة على الأدلة العلمية",
        "قراءة وتحليل الفحوصات المعقدة (الرنين المغناطيسي، الأشعة السينية، تحاليل الدم، تخطيط القلب)",
        "إجراء العمليات والتدخلات السريرية الأولية، خياطة الجروح، والإنعاش القلبي الرئوي المتقدم",
        "التواصل المهني والتعاطف التفاعلي مع المرضى وأسرهم وتوجيههم الإرشادي السليم"
      ],
      duration: "6 سنوات أكاديمية مكثفة (360 ECTS) + إمكانية تقديم امتحان التخصص الوطني (MIR) المعتمد في إسبانيا"
    }
  },
  "Artificial Intelligence & Data Science": {
    es: {
      description: "Un máster puntero y tecnológico diseñado para abordar los desafíos más exigentes de la computación moderna, cubriendo desde los fundamentos del aprendizaje profundo hasta el análisis masivo de datos e inteligencia artificial generativa.",
      subjects: [
        "Modelos de Aprendizaje Automático (Supervisado y No Supervisado)",
        "Aprendizaje Profundo y Redes Neuronales (Deep Learning e NLP)",
        "Estructura y Arquitecturas de Big Data (Hadoop, Spark, Kafka)",
        "Visión por Computador y Procesamiento de Imágenes Digitales",
        "Minería de Datos, Limpieza y Procesamiento de Lenguaje Natural",
        "Modelos Conceptuales de IA Generativa y LLMs",
        "Matemática y Estadística Avanzada para Ciencia de Datos"
      ],
      skills: [
        "Construir y afinar modelos de Inteligencia Artificial de alto impacto para negocios",
        "Procesar ingentes masas de datos estructurados y desestructurados en tiempo real",
        "Implementar soluciones automatizadas y agentes autónomos mediante programación avanzada",
        "Evaluar la ética regulatoria, gobernanza de datos y privacidad en sistemas de IA"
      ],
      duration: "1 curso académico completo (60 créditos ECTS, incluyendo Proyecto de Fin de Máster)"
    },
    en: {
      description: "A cutting-edge master's program designed to address the most demanding challenges of modern computing, covering everything from the mathematics of deep learning to large-scale data engineering and generative artificial intelligence.",
      subjects: [
        "Supervised and Unsupervised Machine Learning Models",
        "Deep Learning and Neuronal Networks (NLP, CNNs)",
        "Big Data Architectures (Spark, Hadoop Ecosystem, Kafka)",
        "Computer Vision & Advanced Digital Image Processing",
        "Data Mining and Natural Language Processing",
        "Generative AI Architectures and Transformer Fine-Tuning",
        "Advanced Mathematical Optimization & Probability for Data"
      ],
      skills: [
        "Build, validate, and scale high-impact artificial intelligence models",
        "Architect pipelines managing terabytes of raw unstructured data streams",
        "Deploy production-grade intelligent agents using advanced Python stacks",
        "Ensure data protection compliance and ethical transparency in algorithmic decisions"
      ],
      duration: "1 academic year (60 ECTS credits, with a mandatory Research or Industrial Master's Thesis)"
    },
    fr: {
      description: "Un programme d'excellence dédié aux technologies qui révolutionnent le monde. Ce master forme des experts capables de modéliser des intelligences artificielles avancées et de valoriser les masses de données complexes.",
      subjects: [
        "Modèles d'apprentissage automatique (Machine Learning)",
        "Deep Learning et réseaux de neurones (NLP & Vision)",
        "Architectures et technologies Big Data (Hadoop, Spark, Kafka)",
        "Vision par ordinateur et analyse d'images",
        "Fouille de données et modèles de traitement du langage (LLM)",
        "IA Générative et architectures de transformateurs",
        "Mathématiques avancées et probabilités pour la science des données"
      ],
      skills: [
        "Concevoir et entraîner des modèles d'IA complexes de haute performance",
        "Modéliser des pipelines d'acquisition de données à très grande échelle",
        "Déployer des systèmes intelligents autonomes dans des infrastructures en production",
        "Analyser les enjeux éthiques liés à l'usage de l'intelligence artificielle"
      ],
      duration: "1 an universitaire (60 ECTS, incluant un mémoire de fin d'études ou stage industriel)"
    },
    ar: {
      description: "برنامج ماجستير تكنولوجي فائق التطور يهدف إلى تأهيل الكفاءات لمواجهة تحديات الحوسبة الحديثة، مغطياً كافة الجوانب من الرياضيات والتعلم العميق وخوارزميات الذكاء الاصطناعي التوليدي وهندسة البيانات الضخمة.",
      subjects: [
        "نماذج تعلم الآلة (الموجه وغير الموجه - Machine Learning)",
        "التعلم العميق والشبكات العصبية الاصطناعية (Deep Learning & NLP)",
        "هندسة وبنيات البيانات الضخمة (Apache Spark, Hadoop, Kafka)",
        "الرؤية الحاسوبية ومعالجة الصور والفيديوهات رقمياً",
        "التنقيب عن البيانات ومعالجة اللغات الطبيعية (Language Processing)",
        "خوارزميات الذكاء الاصطناعي التوليدي وضبط النماذج اللغوية الضخمة (LLMs)",
        "الرياضيات المتقدمة، الإحصاء الأكاديمي، وجبر المصفوفات المعقدة للبيانات"
      ],
      skills: [
        "بناء وتدريب ونشر نماذج ذكاء اصطناعي مخصصة للمؤسسات والشركات الكبرى",
        "تصميم قنوات تحليلات سريعة لمعالجة كميات بيانات هائلة في الوقت الحقيقي",
        "برمجة ونشر الوكلاء البرمجيين الأذكياء والأنظمة ذاتية القيادة باتباع لغة Python",
        "تقييم الأبعاد الأخلاقية، وقوانين حماية حقوق الخصوصية والبيانات في خوارزميات الذكاء الاصطناعي"
      ],
      duration: "سنة أكاديمية واحدة (60 ECTS تشمل مشروع تخرج تطبيقي وبحثي)"
    }
  }
};

/**
 * Dynamically generates structured detail cards for any program family
 * that is not statically pre-rendered. This ensures complete coverage.
 */
export function getSpecialtyDetails(name: string, lang: string, careerOutlets: string[] = []): SpecialtyDetail {
  // Check if we have exact static pre-written content
  const matches = STATIC_DETAILS[name];
  if (matches && matches[lang]) {
    return matches[lang];
  }

  // Set local translatable values for titles/fallbacks
  const t = {
    es: {
      desc: `Esta titulación te capacita de manera integral para ejercer con éxito en el sector de ${name}. Aprenderás directamente a través de talleres prácticos, laboratorios técnicos y simuladores reales diseñados según las normativas vigentes en España.`,
      subjectLabel: "Módulos y Asignaturas de Estudio",
      skillsLabel: "Competencias Adquiridas",
      duration: "2 cursos (2.000 horas lectivas totales)"
    },
    en: {
      desc: `This educational track offers integrated professional preparation for a successful career in ${name}. You will obtain highly structured practical training and lab workflows matching Spanish educational framework requirements.`,
      subjectLabel: "Main Modules & Areas of Study",
      skillsLabel: "Gained Practical Competencies",
      duration: "2 Academic Years (2,000 total hours)"
    },
    fr: {
      desc: `Cette formation vous dote d'une préparation approfondie pour réussir dans le domaine de ${name}. L'apprentissage est axé sur la pratique opérationnelle et l'immersion professionnelle selon le modèle officiel en Espagne.`,
      subjectLabel: "Modules de Formation Clés",
      skillsLabel: "Compétences Professionnelles Clés",
      duration: "2 ans d'études (2 000 heures de cours)"
    },
    ar: {
      desc: `يمنحك هذا المسار الأكاديمي والمهني تأهيلاً عملياً ونظرياً متكاملاً للتميز والنجاح في قطاع ${name}. يتم تقديم الدراسة عبر ورش تطبيقية، معامل تكنولوجية وتدريبات واقعية مطابقة لأعلى المعايير وقوانين إسبانيا.`,
      subjectLabel: "أبرز المواد والوحدات الدراسية المقررة",
      skillsLabel: "المهارات والجدارات الرياضية المكتسبة",
      duration: "سنتان دراسيتان (بمجموع 2000 ساعة دراسية معتمدة وطنيا)"
    }
  }[lang] || {
    desc: `This specialized program offers high fidelity training for ${name}, oriented towards professional readiness.`,
    subjectLabel: "Core curriculum",
    skillsLabel: "Competencies",
    duration: "2 standard academic periods"
  };

  // Build simulated subjects list using career outlets
  const generatedSubjects = [];
  const generatedSkills = [];

  if (lang === "es") {
    generatedSubjects.push("Fundamentos teóricos y legislación reguladora del sector");
    generatedSubjects.push("Gestión de tecnologías, herramientas y metodologías aplicadas");
    generatedSubjects.push("Prevención de riesgos laborales y salud ocupacional");
    generatedSubjects.push("Proyecto de innovación técnica y fin de estudios");
    if (careerOutlets.length > 0) {
      generatedSubjects.push(`Simulaciones reales de práctica para: ${careerOutlets.slice(0, 2).join(' e ')}`);
      generatedSkills.push(`Capacidad para desempeñarse hábilmente como: ${careerOutlets.join(', ')}`);
    } else {
      generatedSkills.push("Dominar las destrezas técnicas del puesto de trabajo");
    }
    generatedSkills.push("Resolver incidencias bajo entornos de producción reales");
    generatedSkills.push("Trabajar de forma cooperativa y coordinada en equipos de alto rendimiento");
  } else if (lang === "ar") {
    generatedSubjects.push("الأسس النظرية واللوائح التشريعية المنظمة للقطاع");
    generatedSubjects.push("إدارة وتطبيق الأدوات والبرمجيات والمعدات التقنية الحديثة");
    generatedSubjects.push("صيانة الجودة والوقاية من الأخطار المهنية في بيئات العمل");
    generatedSubjects.push("مشروع التخرج والابتكار المهني التطبيقي للمؤسسات");
    if (careerOutlets.length > 0) {
      generatedSubjects.push(`محاكاة عملية وتطبيقات مخصصة لصناعة: ${careerOutlets.slice(0, 2).join(' و ')}`);
      generatedSkills.push(`القدرة على العمل الاحترافي في مناصب: ${careerOutlets.join('، ')}`);
    } else {
      generatedSkills.push("إتقان المهارات التقنية الأساسية لبيئات العمل الحديثة");
    }
    generatedSkills.push("حل المشكلات التقنية الحرجة تحت ضغط ظروف العمل الواقعية");
    generatedSkills.push("العمل المشترك والاتصال البيني اللبق داخل الفرق والمشاريع");
  } else if (lang === "fr") {
    generatedSubjects.push("Bases théoriques et législation réglementaire du secteur");
    generatedSubjects.push("Gestion des technologies, outils métiers et méthodologies");
    generatedSubjects.push("Prévention des risques professionnels et sécurité opérationnelle");
    generatedSubjects.push("Projet d'innovation technique applique et fin d'études");
    if (careerOutlets.length > 0) {
      generatedSubjects.push(`Pratiques immersives pour les métiers de : ${careerOutlets.slice(0, 2).join(' et ')}`);
      generatedSkills.push(`Maîtrise complète pour exercer en tant que : ${careerOutlets.join(', ')}`);
    } else {
      generatedSkills.push("Acquérir les compétences techniques majeures pour le poste");
    }
    generatedSkills.push("Résoudre des problèmes complexes en contexte professionnel");
    generatedSkills.push("Travailler de manière coopérative au sein d'équipes pluridisciplinaires");
  } else {
    generatedSubjects.push("Theoretical foundation and legal frameworks of the sector");
    generatedSubjects.push("Technology stack, workflows, and tool optimization");
    generatedSubjects.push("Occupational health, safety, and operational risk mitigation");
    generatedSubjects.push("Capstone innovation project and professional portfolio");
    if (careerOutlets.length > 0) {
      generatedSubjects.push(`Hands-on simulators targeted for: ${careerOutlets.slice(0, 2).join(' and ')}`);
      generatedSkills.push(`Aptitude to successfully work as: ${careerOutlets.join(', ')}`);
    } else {
      generatedSkills.push("Master technical workflows and industrial specifications");
    }
    generatedSkills.push("Troubleshoot critical processes under production conditions");
    generatedSkills.push("Coordinate actions smoothly within collaborative agile team frames");
  }

  return {
    description: t.desc,
    subjects: generatedSubjects,
    skills: generatedSkills,
    duration: t.duration
  };
}
