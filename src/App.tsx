import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { 
  BookOpen, Award, Compass, Briefcase, MessageSquare, 
  Home, Train, Map, Globe, FileText, CheckCircle, 
  AlertTriangle, ChevronRight, ChevronLeft, User, 
  Copy, Plus, Search, Building, Check, HelpCircle, 
  Activity, Flame, Volume2, ArrowRight, CheckSquare, Sparkles
} from "lucide-react";
import { 
  LANGUAGES, NAV_ITEMS, ROADMAP_STEPS, VISA_DATA, 
  FORMATIONS, TRANSPORT, LOGEMENT, ALPHABET_DATA, 
  LEVEL_TOPICS, STUDENT_CITIES_GUIDE
} from "./data";
import { CV_TEMPLATES } from "./cvTemplates";
import { HUNDRED_QUESTIONS, CAREER_CATEGORIES } from "./questionsData";
import { jsPDF } from "jspdf";
import { getFallbackLessonData } from "./fallbackLessons";
import { getFallbackExam } from "./fallbackExams";
import { getSpecialtyDetails } from "./specialtyDetails";
import { AdminDashboard } from "./components/AdminDashboard";
import { PRIVACY_POLICY, TERMS_OF_USE, FORBIDDEN_WORDS } from "./policies";
import { 
  downloadRoadmapPDF, 
  downloadVisaPDF, 
  downloadFormationsPDF, 
  downloadTransportPDF, 
  downloadHousingPDF, 
  downloadLessonPDF, 
  downloadStudentLifePDF, 
  downloadEmploymentPDF, 
  downloadTeachersPDF 
} from "./utils/studentPdfGenerator";

const AdBanner = ({ section, ads, onRender }: { section: string; ads: any[]; onRender: (id: string) => void }) => {
  const [renderedId, setRenderedId] = useState<string | null>(null);

  const activeAd = (ads || []).find((ad: any) => {
    if (ad.status !== "active") return false;
    const isExpired = ad.durationHours && ad.durationHours !== -1 && 
      (new Date().getTime() - new Date(ad.createdAt).getTime()) > ad.durationHours * 60 * 60 * 1000;
    if (isExpired) return false;
    return ad.section === "all" || ad.section === section;
  });

  useEffect(() => {
    if (activeAd && activeAd.id !== renderedId) {
      setRenderedId(activeAd.id);
      onRender(activeAd.id);
    }
  }, [activeAd?.id, section, renderedId]);

  if (!activeAd) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-[#0a0f1d] to-amber-500/5 border border-amber-500/20 p-4 rounded-3xl flex flex-col sm:flex-row items-center gap-4 animate-fade-in text-xs shadow-xl text-left select-none mb-4">
      {activeAd.imageUrl && (
        <img 
          referrerPolicy="no-referrer" 
          src={activeAd.imageUrl} 
          alt={activeAd.brand} 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-amber-500/10" 
        />
      )}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
            Patrocinado
          </span>
          <span className="text-white font-extrabold">{activeAd.brand}</span>
        </div>
        <h4 className="text-sm font-bold text-gray-100 tracking-tight">{activeAd.title}</h4>
        <p className="text-xs text-gray-400 font-sans leading-relaxed">{activeAd.description}</p>
        {activeAd.targetUrl && (
          <a
            href={activeAd.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 font-bold text-amber-400 hover:underline hover:text-amber-300"
          >
            Saber Más ➔
          </a>
        )}
      </div>
    </div>
  );
};

export default function App() {
  // --- Portal Gate Access & Real-Time Sync States ---
  const [userRole, setUserRole] = useState<"student" | "admin" | null>(() => {
    return localStorage.getItem("sp_user_role") as any || null;
  });
  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    return localStorage.getItem("sp_logged_email") || "";
  });
  const [loggedStudent, setLoggedStudent] = useState<any | null>(null);

  // Form input controllers
  const [studentNameInput, setStudentNameInput] = useState("");
  const [studentLastNameInput, setStudentLastNameInput] = useState("");
  const [studentPhoneInput, setStudentPhoneInput] = useState("");
  const [studentEmailInput, setStudentEmailInput] = useState("");
  const [studentCountryInput, setStudentCountryInput] = useState("Morocco");
  const [studentGenderInput, setStudentGenderInput] = useState("Femenino");
  const [studentGoalInput, setStudentGoalInput] = useState("FP Grado Superior");
  const [studentAgeInput, setStudentAgeInput] = useState("20");
  const [studentCurrentEduInput, setStudentCurrentEduInput] = useState("Bachillerato");
  const [studentCurrentCityInput, setStudentCurrentCityInput] = useState("");
  const [studentTargetCityInput, setStudentTargetCityInput] = useState("Madrid");
  const [studentCurrentCountryInput, setStudentCurrentCountryInput] = useState("Morocco");
  const [studentSpanishLevelInput, setStudentSpanishLevelInput] = useState("A1");

  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");

  const [authError, setAuthError] = useState("");
  
  // --- Compliance, Bot Protection & Sub-Tabbing ---
  const [studentActionTab, setStudentActionTab] = useState<"register" | "login">("register");
  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState<"terms" | "privacy" | "forbidden">("terms");

  // Bot protection state (Dynamic Math Quiz)
  const [captchaNum1, setCaptchaNum1] = useState(() => Math.floor(Math.random() * 9) + 2);
  const [captchaNum2, setCaptchaNum2] = useState(() => Math.floor(Math.random() * 8) + 2);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const regenerateCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 2);
    setCaptchaNum2(Math.floor(Math.random() * 8) + 2);
    setCaptchaAnswer("");
    setCaptchaVerified(false);
  };

  const [dbStats, setDbStats] = useState<any>(null);
  const customFormations = dbStats?.customData?.formations || FORMATIONS;
  const customHousing = dbStats?.customData?.housing || LOGEMENT;
  const customStudentLife = dbStats?.customData?.studentLife || STUDENT_CITIES_GUIDE;
  const customNavItems = dbStats?.customData?.navItems || NAV_ITEMS;
  const customRoadmapSteps = dbStats?.customData?.roadmap || ROADMAP_STEPS;
  const customVisaData = dbStats?.customData?.visa || VISA_DATA;
  const customTransport = dbStats?.customData?.transport || TRANSPORT;
  const customLevelTopics = dbStats?.customData?.levelTopics || LEVEL_TOPICS;
  const [loadingStats, setLoadingStats] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<"student" | "creator">("student");

  // --- Persistent Local Profile State ---
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("sp_student_profile");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      country: "morocco",
      goal: "FP Grado Superior",
      xp: 0,
      streak: 3,
      level: "A1",
      passedExams_v2: [],
      weeklyMissions: [
        { id: "m1", title: "Aprende las 10 palabras indispensables en extranjería", reward: 60, progress: 2, target: 10, done: false },
        { id: "m2", title: "Lee los 3 pasos del proceso de homologación", reward: 45, progress: 1, target: 3, done: false },
        { id: "m3", title: "Escribe tu primer mensaje de presentación en la comunidad", reward: 50, progress: 0, target: 1, done: false }
      ],
      unlockedBadges: ["sin_errores"],
      streakProtectedUsedThisWeek: false,
      lastActiveDate: "",
      expiringStars: null,
      alreadyAwarded: []
    };
  });

  useEffect(() => {
    localStorage.setItem("sp_student_profile", JSON.stringify(profile));
  }, [profile]);

  // --- Real-time Stats Refetcher & Student Database Sync ---
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const matchingEmail = localStorage.getItem("sp_logged_email") || "";
      const role = localStorage.getItem("sp_user_role");
      let url = "/api/db/stats";
      if (role === "student" && matchingEmail) {
        url += `?verifyEmail=${encodeURIComponent(matchingEmail)}`;
      }

      const res = await fetch(url);
      if (res.status === 403) {
        const errData = await res.json();
        alert(errData.error || "Sesión finalizada. Tu cuenta ha sido accedida desde otra dirección IP.");
        // Call local state clear directly to avoid calling network logout
        localStorage.removeItem("sp_user_role");
        localStorage.removeItem("sp_logged_email");
        setUserRole(null);
        setLoggedInEmail("");
        setLoggedStudent(null);
        setAuthError("");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
        
        // Match student profile dynamically from server
        if (role === "student" && matchingEmail) {
          const matched = data.students.find((s: any) => s.email.toLowerCase() === matchingEmail.toLowerCase());
          if (matched) {
            const defaultMissions = [
              { id: "m1", title: "Aprende las 10 palabras indispensables en extranjería", reward: 60, progress: 2, target: 10, done: false },
              { id: "m2", title: "Lee los 3 pasos del proceso de homologación", reward: 45, progress: 1, target: 3, done: false },
              { id: "m3", title: "Escribe tu primer mensaje de presentación en la comunidad", reward: 50, progress: 0, target: 1, done: false }
            ];
            
            const updatedProfile = {
              country: matched.country.toLowerCase(),
              goal: matched.academicGoal,
              xp: matched.xp,
              streak: matched.streak || 1,
              level: matched.level || "A1",
              passedExams_v2: matched.passedExams_v2 || [],
              weeklyMissions: matched.weeklyMissions || defaultMissions,
              unlockedBadges: matched.unlockedBadges || ["sin_errores"],
              streakProtectedUsedThisWeek: !!matched.streakProtectedUsedThisWeek,
              lastActiveDate: matched.lastActiveDate || "",
              expiringStars: matched.expiringStars || null,
              alreadyAwarded: matched.alreadyAwarded || []
            };

            setLoggedStudent(matched);
            setProfile(updatedProfile);
            
            // Check daily connections and streak protections
            setTimeout(() => {
              checkDailyStreak(updatedProfile);
            }, 600);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userRole, loggedInEmail]);

  useEffect(() => {
    if (dbStats && dbStats.communityMessages && dbStats.communityMessages.length > 0) {
      setChats(dbStats.communityMessages);
    }
  }, [dbStats]);

  const syncStudentUpdate = async (updates: any) => {
    if (userRole !== "student" || !loggedStudent) return;
    try {
      const res = await fetch("/api/student/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: loggedStudent.id,
          updates
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLoggedStudent(data.student);
      }
    } catch (e) {
      console.error("Error backing up student XP / level update on database:", e);
    }
  };

  const reportAdView = async (adId: string) => {
    try {
      await fetch("/api/student/ads/increment-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: adId })
      });
    } catch (e) {
      console.error("Error reporting ad view:", e);
    }
  };

  useEffect(() => {
    if (userRole === "student" && loggedStudent) {
      const dbCountry = loggedStudent.country.toLowerCase();
      const dbGoal = loggedStudent.academicGoal;
      const dbXp = loggedStudent.xp;
      const dbLevel = loggedStudent.level;
      const dbStreak = loggedStudent.streak || 3;
      const dbPassed = loggedStudent.passedExams_v2 || [];

      const dbMissions = loggedStudent.weeklyMissions || [];
      const dbBadges = loggedStudent.unlockedBadges || [];
      const dbShield = !!loggedStudent.streakProtectedUsedThisWeek;
      const dbLastActive = loggedStudent.lastActiveDate || "";
      const dbExpiring = loggedStudent.expiringStars || null;
      const dbAwarded = loggedStudent.alreadyAwarded || [];

      if (
        profile.country !== dbCountry ||
        profile.goal !== dbGoal ||
        profile.xp !== dbXp ||
        profile.level !== dbLevel ||
        profile.streak !== dbStreak ||
        JSON.stringify(profile.passedExams_v2 || []) !== JSON.stringify(dbPassed) ||
        JSON.stringify(profile.weeklyMissions || []) !== JSON.stringify(dbMissions) ||
        JSON.stringify(profile.unlockedBadges || []) !== JSON.stringify(dbBadges) ||
        profile.streakProtectedUsedThisWeek !== dbShield ||
        profile.lastActiveDate !== dbLastActive ||
        JSON.stringify(profile.expiringStars || null) !== JSON.stringify(dbExpiring) ||
        JSON.stringify(profile.alreadyAwarded || []) !== JSON.stringify(dbAwarded)
      ) {
        syncStudentUpdate({
          country: profile.country,
          academicGoal: profile.goal,
          xp: profile.xp,
          level: profile.level,
          streak: profile.streak,
          passedExams_v2: profile.passedExams_v2 || [],
          weeklyMissions: profile.weeklyMissions || [],
          unlockedBadges: profile.unlockedBadges || [],
          streakProtectedUsedThisWeek: !!profile.streakProtectedUsedThisWeek,
          lastActiveDate: profile.lastActiveDate || "",
          expiringStars: profile.expiringStars || null,
          alreadyAwarded: profile.alreadyAwarded || []
        });
      }
    }
  }, [profile]);

  // Auth Portal actions
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    // 1. Compliance (Policies Acceptance) Verification
    if (!policiesAccepted) {
      setAuthError("Debe leer y aceptar expresamente las Condiciones Generales de Uso y la Política de Privacidad de EstudiaEspaña antes de poder continuar.");
      return;
    }

    // 2. Anti-Bot (CAPTCHA) Security Verification
    const expectedAnswer = captchaNum1 + captchaNum2;
    if (Number(captchaAnswer.trim()) !== expectedAnswer) {
      setAuthError(`La verificación de seguridad anti-bots (CAPTCHA) ha fallado. ¿Cuánto es ${captchaNum1} + ${captchaNum2}? Por favor, introduzca la suma correcta para certificar su acceso 100% humano.`);
      regenerateCaptcha();
      return;
    }

    const emailClean = studentEmailInput.trim().toLowerCase();

    // Mode: INICIAR SESIÓN (Login)
    if (studentActionTab === "login") {
      if (!emailClean) {
        setAuthError("Por favor, introduzca su Correo Electrónico o ID de Estudiante registrado.");
        return;
      }
      if (emailClean.includes("@")) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailClean)) {
          setAuthError("Formato de correo electrónico no válido. Por favor verifíquelo o use su código de estudiante.");
          return;
        }
      }

      try {
        const res = await fetch("/api/auth/student-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailClean,
            isOnlyLogin: true
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("sp_user_role", "student");
          localStorage.setItem("sp_logged_email", data.student.email);
          setUserRole("student");
          setLoggedInEmail(data.student.email);
          setLoggedStudent(data.student);
          setProfile({
            country: data.student.country.toLowerCase(),
            goal: data.student.academicGoal,
            xp: data.student.xp,
            streak: data.student.streak || 3,
            level: data.student.level,
            passedExams_v2: data.student.passedExams_v2 || []
          });
        } else {
          setAuthError(data.error || "Fallo al iniciar sesión.");
        }
      } catch (err: any) {
        setAuthError("No se pudo conectar con el servidor de autenticación.");
      }
    } 
    // Mode: CREAR CUENTA (Registration)
    else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailClean) {
        setAuthError("El correo electrónico es un dato obligatorio.");
        return;
      }
      if (!emailRegex.test(emailClean)) {
        setAuthError("Formato de correo electrónico inválido. El estudiante no puede inscribirse sin un correo en formato correcto (ejemplo: usuario@dominio.com).");
        return;
      }

      if (!studentNameInput.trim()) {
        setAuthError("El nombre del estudiante es un dato obligatorio.");
        return;
      }

      if (!studentLastNameInput.trim()) {
        setAuthError("El apellido del estudiante es un dato obligatorio.");
        return;
      }

      // Phone format validator (e.g., +212612345678, +34612345678, etc.)
      const phoneCleaned = studentPhoneInput.trim().replace(/[\s-()]/g, "");
      const phoneRegex = /^\+?\d{8,15}$/;
      if (!studentPhoneInput.trim()) {
        setAuthError("Por favor ingrese su número de teléfono. Es un dato obligatorio de contacto.");
        return;
      }
      if (!phoneRegex.test(phoneCleaned)) {
        setAuthError("Formato de número de teléfono incorrecto. El número de teléfono tiene que tener un formato correcto. Debe incluir prefijo y entre 8 y 15 dígitos (ej: +212612345678 o +34612345678).");
        return;
      }

      const ageNum = Number(studentAgeInput);
      if (!studentAgeInput.trim() || isNaN(ageNum) || ageNum < 14 || ageNum > 75) {
        setAuthError("Por favor ingrese una edad real válida (entre 14 y 75 años). Es un dato obligatorio.");
        return;
      }

      if (!studentCurrentCityInput.trim()) {
        setAuthError("Por favor ingrese la ciudad de residencia actual. Es un dato obligatorio.");
        return;
      }

      try {
        const res = await fetch("/api/auth/student-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailClean,
            name: studentNameInput.trim(),
            lastName: studentLastNameInput.trim(),
            phone: studentPhoneInput.trim(),
            country: studentCountryInput,
            gender: studentGenderInput,
            academicGoal: studentGoalInput,
            age: ageNum,
            currentEducation: studentCurrentEduInput,
            city: studentCurrentCityInput.trim(),
            targetCity: studentTargetCityInput,
            currentCountry: studentCurrentCountryInput,
            level: studentSpanishLevelInput,
            isOnlyLogin: false
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("sp_user_role", "student");
          localStorage.setItem("sp_logged_email", data.student.email);
          setUserRole("student");
          setLoggedInEmail(data.student.email);
          setLoggedStudent(data.student);
          setProfile({
            country: data.student.country.toLowerCase(),
            goal: data.student.academicGoal,
            xp: data.student.xp,
            streak: data.student.streak || 3,
            level: data.student.level,
            passedExams_v2: data.student.passedExams_v2 || []
          });
        } else {
          setAuthError(data.error || "Fallo en la creación de cuenta.");
        }
      } catch (err: any) {
        setAuthError("No se pudo conectar con el servidor para iniciar el registro.");
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) {
      setAuthError("Ingrese el correo administrativo y contraseña.");
      return;
    }
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmailInput.trim().toLowerCase(),
          password: adminPasswordInput
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("sp_user_role", "admin");
        localStorage.setItem("sp_admin_role", data.admin.role || "colaborador");
        localStorage.setItem("sp_logged_email", data.admin.email);
        setUserRole("admin");
        setLoggedInEmail(data.admin.email);
        setAuthError("");
      } else {
        setAuthError(data.error || "Credenciales administrativas incorrectas. Acceso exclusivo a colaboradores registrados.");
      }
    } catch (err) {
      setAuthError("Fallo de conexión al convalidar credenciales de colaborador.");
    }
  };

  const handleLogout = async () => {
    const email = localStorage.getItem("sp_logged_email");
    if (email && userRole === "student") {
      try {
        await fetch("/api/auth/student-logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
      } catch (e) {}
    }
    localStorage.removeItem("sp_user_role");
    localStorage.removeItem("sp_admin_role");
    localStorage.removeItem("sp_logged_email");
    setUserRole(null);
    setLoggedInEmail("");
    setLoggedStudent(null);
    setAuthError("");
  };


  // --- Active Tab and Languages ---
  const [lang, setLang] = useState<string>("fr");
  const [tab, setTab] = useState<string>("roadmap");
  const [visaCountry, setVisaCountry] = useState<string>("morocco");
  const [formationTab, setFormationTab] = useState<string>("fp_superior");
  const [selectedCityLife, setSelectedCityLife] = useState<string>("Madrid");

  // --- Search state inside sections ---
  const [transportSearch, setTransportSearch] = useState<string>("");
  const [formationsSearch, setFormationsSearch] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<any | null>(null);

  // --- Book Lesson States ---
  const [selectedLevel, setSelectedLevel] = useState<string>("A1");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lessonData, setLessonData] = useState<any>(null);
  const [loadingLesson, setLoadingLesson] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  
  // Exercise assessment answers
  const [exAnswers, setExAnswers] = useState<Record<number, any>>({});
  const [exResults, setExResults] = useState<Record<number, { ok: boolean; fb: string }>>({});

  // --- Level Advancement Exam States ---
  const [examActive, setExamActive] = useState<boolean>(false);
  const [selectedExamId, setSelectedExamId] = useState<number>(1);
  const [loadingExam, setLoadingExam] = useState<boolean>(false);
  const [examData, setExamData] = useState<any>(null);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<number>(0);
  const [examPassed, setExamPassed] = useState<boolean>(false);
  const [activeTarea, setActiveTarea] = useState<number>(1);

  // --- CV Generator States ---
  const [cvData, setCvData] = useState({
    name: "Ahmed Al-Mansoori",
    email: "ahmed.mansoori@gmail.com",
    role: "Desarrollador Web Full Stack Junior",
    city: "Madrid, España",
    edu: "Grado Superior en Desarrollo de Aplicaciones Web (DAW) / BootCamp FullStack",
    skills: "HTML5, CSS3, JavaScript, React, Node.js, Git, SQL, Español (A2), Árabe (Nativo), Inglés (B2)",
    exp: "Desarrollo de portfolio de aplicaciones responsivas utilizando React y Tailwind. Prácticas en proyectos colaborativos en GitHub y resolución de incidencias frontend."
  });
  const [cvHtml, setCvHtml] = useState<string>("");
  const [cvGenerating, setCvGenerating] = useState<boolean>(false);
  const [cvCopied, setCvCopied] = useState<boolean>(false);

  // --- 100-Question Career Quiz States ---
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(() => Array(100).fill(-1));

  // --- Interactive roadmap completion state ---
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const saved = localStorage.getItem("sp_roadmap_completed");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [1, 2]; // Default first two steps checked
  });

  useEffect(() => {
    localStorage.setItem("sp_roadmap_completed", JSON.stringify(completedSteps));
  }, [completedSteps]);

  // --- Community Chat States ---
  const [chats, setChats] = useState<Array<{ id: string; user: string; text: string; time: string; system?: boolean }>>([
    { id: "1", user: "Youssef_ma", text: "¡Hola! ¿Alguien ha solicitado el visado en Rabat recientemente?", time: "11:20 am" },
    { id: "2", user: "Sofia_es", text: "Hola Youssef, sí, la cita previa suele tardar unos 10 días en aparecer. ¡Organízate bien!", time: "11:22 am" },
    { id: "3", user: "Profesor de España 🤖", text: "💡 CONSEJO PRÁCTICO: Asegúrate de que tu seguro médico privado tenga cobertura del 100% repatración y sea 'sin copago'.", time: "11:23 am", system: true }
  ]);
  const [chatInp, setChatInp] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- Gamification & Star System Declarations ---
  const LEVELS = [
    { level: 0, minStars: 0, nameAr: "الطالب المبتدئ", nameEs: "El Principiante", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
    { level: 1, minStars: 100, nameAr: "المستكشف", nameEs: "El Explorador", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { level: 2, minStars: 300, nameAr: "المسافر", nameEs: "El Viajero", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { level: 3, minStars: 700, nameAr: "الطالب", nameEs: "El Estudiante", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { level: 4, minStars: 1500, nameAr: "المتقدم", nameEs: "El Avanzado", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
    { level: 5, minStars: 3000, nameAr: "الخبير", nameEs: "El Experto", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
  ];

  const getStudentLevelInfo = (stars: number) => {
    let active = LEVELS[0];
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (stars >= LEVELS[i].minStars) {
        active = LEVELS[i];
        break;
      }
    }
    const nextIndex = LEVELS.indexOf(active) + 1;
    const next = nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;
    return { active, next };
  };

  const getLevelString = (levelId: number) => {
    const map: Record<number, string> = { 0: "A1", 1: "A2", 2: "B1", 3: "B2", 4: "C1", 5: "C2" };
    return map[levelId] || "A1";
  };

  const [starToast, setStarToast] = useState<{ show: boolean; stars: number; reason: string } | null>(null);
  const [levelUpOverlay, setLevelUpOverlay] = useState<{ show: boolean; oldLevel: number; newLevel: number; levelName: string } | null>(null);

  const awardStars = (amount: number, reason: string, silent = false) => {
    setProfile(prev => {
      const oldStars = prev.xp || 0;
      const newStars = oldStars + amount;
      
      // Update weekly missions progress if relevant
      let updatedMissions = prev.weeklyMissions ? prev.weeklyMissions.map((m: any) => ({ ...m })) : [
        { id: "m1", title: "Aprende las 10 palabras indispensables en extranjería", reward: 60, progress: 0, target: 10, done: false },
        { id: "m2", title: "Lee los 3 pasos del proceso de homologación", reward: 45, progress: 0, target: 3, done: false },
        { id: "m3", title: "Escribe tu primer mensaje de presentación en la comunidad", reward: 50, progress: 0, target: 1, done: false }
      ];

      // Update specific mission progress
      if (reason.toLowerCase().includes("ejercicio") || reason.toLowerCase().includes("vocabulario") || reason.toLowerCase().includes("lección") || reason.toLowerCase().includes("práctica")) {
        const m1 = updatedMissions.find((m: any) => m.id === "m1");
        if (m1 && !m1.done) {
          m1.progress = Math.min(m1.target, m1.progress + 1);
          if (m1.progress >= m1.target) {
            m1.done = true;
            setTimeout(() => awardStars(m1.reward, `🏆 Misión Cumplida: ${m1.title}`), 400);
          }
        }
      }
      if (reason.toLowerCase().includes("visa") || reason.toLowerCase().includes("homologación") || reason.toLowerCase().includes("paso") || reason.toLowerCase().includes("guía")) {
        const m2 = updatedMissions.find((m: any) => m.id === "m2");
        if (m2 && !m2.done) {
          m2.progress = Math.min(m2.target, m2.progress + 1);
          if (m2.progress >= m2.target) {
            m2.done = true;
            setTimeout(() => awardStars(m2.reward, `🏆 Misión Cumplida: ${m2.title}`), 400);
          }
        }
      }
      if (reason.toLowerCase().includes("comunidad") || reason.toLowerCase().includes("mensaje") || reason.toLowerCase().includes("chat")) {
        const m3 = updatedMissions.find((m: any) => m.id === "m3");
        if (m3 && !m3.done) {
          m3.progress = Math.min(m3.target, m3.progress + 1);
          if (m3.progress >= m3.target) {
            m3.done = true;
            setTimeout(() => awardStars(m3.reward, `🏆 Misión Cumplida: ${m3.title}`), 400);
          }
        }
      }

      // Check level transition
      const oldLvlInfo = getStudentLevelInfo(oldStars);
      const newLvlInfo = getStudentLevelInfo(newStars);
      
      let newLevelState = prev.level;
      if (newLvlInfo.active.level !== oldLvlInfo.active.level) {
        newLevelState = getLevelString(newLvlInfo.active.level);
        // Push level up action
        setTimeout(() => {
          setLevelUpOverlay({
            show: true,
            oldLevel: oldLvlInfo.active.level,
            newLevel: newLvlInfo.active.level,
            levelName: newLvlInfo.active.nameEs
          });
        }, 300);
      }

      // Badges check
      const currentBadges = prev.unlockedBadges || [];
      const updatedBadges = [...currentBadges];

      if (reason.toLowerCase().includes("lección sin errores") && !updatedBadges.includes("sin_errores")) {
        updatedBadges.push("sin_errores");
        setTimeout(() => awardStars(25, "🏅 Insignia: Sin Errores (بلا أخطاء)", true), 500);
      }

      if (newLvlInfo.active.level >= 5 && !updatedBadges.includes("listo_espana")) {
        updatedBadges.push("listo_espana");
        setTimeout(() => awardStars(100, "🏅 Insignia: Listo para España (جاهز لإسبانيا)", true), 500);
      }

      if (reason.toLowerCase().includes("completar todos los pasos del visa") && !updatedBadges.includes("maestro_visa")) {
        updatedBadges.push("maestro_visa");
      }

      if (!silent) {
        setStarToast({ show: true, stars: amount, reason });
        setTimeout(() => setStarToast(null), 3500);
      }

      return {
        ...prev,
        xp: newStars,
        level: newLevelState,
        weeklyMissions: updatedMissions,
        unlockedBadges: updatedBadges
      };
    });
  };

  const checkDailyStreak = (studentObj: any) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const lastActive = studentObj.lastActiveDate || localStorage.getItem("sp_last_active_date") || "";
    const currentStreak = studentObj.streak || 1;
    
    if (lastActive === todayStr) {
      return;
    }

    let nextStreak = currentStreak;
    let usedShield = false;
    let starsReward = 0;
    let streakText = "";

    if (lastActive) {
      const activeDate = new Date(lastActive);
      const nowDate = new Date(todayStr);
      const diffTime = Math.abs(nowDate.getTime() - activeDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        nextStreak = currentStreak + 1;
        
        if (nextStreak >= 30) {
          starsReward = 80;
          streakText = "🔥 ¡Impresionante! Racha de 30 días seguidos alcanzada. Eres oficialmente un experto comprometido.";
        } else if (nextStreak >= 14) {
          starsReward = 50;
          streakText = "🔥 ¡Asombroso! Racha de 14 días seguidos de preparación educativa.";
        } else if (nextStreak >= 7) {
          starsReward = 30;
          streakText = "🔥 ¡Súper constante! Racha de 7 días seguidos.";
        } else if (nextStreak >= 3) {
          starsReward = 15;
          streakText = "🔥 ¡Excelente hábito! Racha de 3 días seguidos.";
        } else {
          starsReward = 5;
          streakText = "🔥 Racha diaria de 1 día activa.";
        }
      } else if (diffDays > 1) {
        if (!studentObj.streakProtectedUsedThisWeek) {
          usedShield = true;
          nextStreak = currentStreak;
          streakText = `🛡️ ¡Ufff! No entraste ayer, pero tu racha protectora semanal salvó tus ${currentStreak} días de racha. ¡Qué gran alivio!`;
        } else {
          nextStreak = 1;
          starsReward = 5;
          streakText = "😢 Se rompió tu racha diaria por inactividad. ¡Comencemos de nuevo con todas las ganas!";
        }
      }
    } else {
      nextStreak = 1;
      starsReward = 5;
      streakText = "✨ ¡Bienvenido a tu primer día de constancia diaria!";
    }

    localStorage.setItem("sp_last_active_date", todayStr);

    setProfile(prev => {
      const updatedBadges = prev.unlockedBadges || [];
      if (nextStreak >= 7 && !updatedBadges.includes("llama_7_dias")) {
        updatedBadges.push("llama_7_dias");
      }
      if (nextStreak >= 30 && !updatedBadges.includes("diamante_30_dias")) {
        updatedBadges.push("diamante_30_dias");
      }
      
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 2);
      
      return {
        ...prev,
        xp: prev.xp + starsReward,
        streak: nextStreak,
        streakProtectedUsedThisWeek: usedShield ? true : prev.streakProtectedUsedThisWeek,
        unlockedBadges: updatedBadges,
        lastActiveDate: todayStr,
        expiringStars: { amount: 45, expiresAt: expiringDate.toISOString().split("T")[0] }
      };
    });

    setTimeout(() => {
      alert(`🌅 ¡CONEXIÓN DIARIA EXITOSA!\n\n${streakText}\n\n⭐ Recompensa obtenida: +${starsReward} Estrellas (النجوم) por constancia.`);
    }, 1200);
  };


  // --- Text-to-Speech (native browser with high quality Spanish ES-es voices) ---
  const speakSpanish = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.85;
    
    // Find a proper Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.toLowerCase().includes("es-es")) || 
                    voices.find(v => v.lang.toLowerCase().startsWith("es"));
    if (esVoice) utterance.voice = esVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Helper for dynamic multi-language text fetching
  const t = (item: any) => {
    if (!item) return "";
    if (typeof item === "object") {
      return item[lang] || item["en"] || Object.values(item)[0] || "";
    }
    return item;
  };

  // Resolve minimum page for a given CEFR level
  const getMinPage = (lvl: string) => {
    return ["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(lvl) * 50 + 1;
  };

  // Resolve maximum page for a given CEFR level
  const getMaxPage = (lvl: string) => {
    return (["A1", "A2", "B1", "B2", "C1", "C2"].indexOf(lvl) + 1) * 50;
  };

  // Fetch the active topic based on page offset
  const getTopic = (lvl: string, page: number) => {
    const topics = customLevelTopics[lvl] || customLevelTopics.A1;
    const minP = getMinPage(lvl);
    const index = (page - minP) % topics.length;
    return topics[index >= 0 ? index : 0];
  };

  // --- API Integrations using Fetch ---
  // 1. Fetch Lesson Data
  const handleLoadLesson = async (lvl: string, pageNum: number) => {
    setLoadingLesson(true);
    setExAnswers({});
    setExResults({});
    const topic = getTopic(lvl, pageNum);

    try {
      const response = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: lvl,
          page: pageNum,
          topic: topic,
          targetLang: LANGUAGES.find(l => l.code === lang)?.label || "English"
        })
      });
      if (response.ok) {
        const data = await response.json();
        setLessonData(data);
        setIsOfflineMode(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429 || errorData.isQuota) {
          setIsOfflineMode(true);
        }
        throw new Error("Failed to consult lesson api");
      }
    } catch (e) {
      // Robust client fallback if server offline or api keys not set yet
      const fallback = getFallbackLessonData(lvl, topic, lang);
      setLessonData(fallback);
      setIsOfflineMode(true);
    } finally {
      setLoadingLesson(false);
    }
  };

  // 2. Fetch Level advancement exam
  const handleLoadExam = async (examId: number) => {
    setSelectedExamId(examId);
    setLoadingExam(true);
    setExamData(null);
    setExamAnswers({});
    setExamSubmitted(false);
    setActiveTarea(1);
 
    try {
      const response = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: selectedLevel,
          examId: examId,
          targetLang: LANGUAGES.find(l => l.code === lang)?.label || "English"
        })
      });
      if (response.ok) {
        const data = await response.json();
        setExamData(data);
        setIsOfflineMode(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429 || errorData.isQuota) {
          setIsOfflineMode(true);
        }
        throw new Error("Exam API down");
      }
    } catch (e) {
      // Default fallback offline examination
      setExamData(getFallbackExam(selectedLevel, examId, lang));
      setIsOfflineMode(true);
    } finally {
      setLoadingExam(false);
    }
  };

  // 3. Generate formatting optimized European-standard Spanish CV
  const handleGenerateCV = async () => {
    setCvGenerating(true);
    setCvHtml("");

    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cvData)
      });
      if (response.ok) {
        const result = await response.json();
        setCvHtml(result.cvHtml);
      } else {
        throw new Error("CV creation service failed");
      }
    } catch (e) {
      // Simple preview default template output in case API is temporarily waiting
      setCvHtml(`
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="margin: 0 0 5px 0; color: #1e3a8a; font-size: 24px;">${cvData.name}</h2>
          <p style="margin: 0; color: #64748b; font-size: 13px;">Email: ${cvData.email} | Ciudad: ${cvData.city}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
          <h3 style="color: #1e3a8a; font-size: 15px; margin-bottom: 5px;">OBJETIVO PROFESIONAL</h3>
          <p style="font-size: 12px; line-height: 1.5; color: #334155;">Joven con motivación para incorporarse al mercado laboral español en el cargo de: <strong>${cvData.role}</strong>.</p>
          <h3 style="color: #1e3a8a; font-size: 15px; margin-bottom: 5px; margin-top: 15px;">FORMACIÓN ACADÉMICA</h3>
          <p style="font-size: 12px; margin: 0; color: #334155;"><strong>${cvData.edu}</strong></p>
          <h3 style="color: #1e3a8a; font-size: 15px; margin-bottom: 5px; margin-top: 15px;">COMPETENCIAS Y APTITUDES</h3>
          <p style="font-size: 12px; color: #334155; line-height: 1.5;">${cvData.skills}</p>
          <h3 style="color: #1e3a8a; font-size: 15px; margin-bottom: 5px; margin-top: 15px;">EXPERIENCIA PROFESIONAL</h3>
          <p style="font-size: 12px; color: #334155; line-height: 1.5;">${cvData.exp}</p>
        </div>
      `);
    } finally {
      setCvGenerating(false);
    }
  };

  // Download high-quality PDF CV with fictitious disclaimer stamp
  const handleDownloadCVPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Page styling background neutral/white
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, "F");
      
      // Top header band (Deep blue/navy aesthetic)
      doc.setFillColor(30, 58, 138); // navy #1e3a8a
      doc.rect(0, 0, 210, 48, "F");
      
      // Name
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text((cvData.name || "Ejemplo Ficticio").toUpperCase(), 15, 22);
      
      // Subtitle (Role / Puesto)
      doc.setTextColor(245, 158, 11); // Amber accent
      doc.setFontSize(11);
      doc.text((cvData.role || "Puesto Objetivo").toUpperCase(), 15, 30);
      
      // Contact Info (Email & City)
      doc.setTextColor(230, 230, 230);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Contacto: ${cvData.email || "ejemplo@ficticio.com"}  |  Ciudad: ${cvData.city || "Madrid"}  |  Modelo de Referencia Ficticio`, 15, 38);
      
      // Main Body
      let y = 60;
      
      // Section: Perfil Profesional
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("PERFIL PROFESIONAL", 15, y);
      
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, y + 2, 195, y + 2);
      y += 8;
      
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const perfilText = `Joven con motivación para incorporarse al sector en el cargo de ${cvData.role || "su elección"}. Excelente adaptabilidad, compromiso y disposición de aprendizaje rápido en España. Este es un ejemplo de capacitación profesional de modelo de curriculum vitae.`;
      const splitPerfil = doc.splitTextToSize(perfilText, 180);
      doc.text(splitPerfil, 15, y);
      y += splitPerfil.length * 5 + 8;
      
      // Section: Formación Académica
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("FORMACIÓN ACADÉMICA", 15, y);
      
      doc.line(15, y + 2, 195, y + 2);
      y += 8;
      
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const splitEdu = doc.splitTextToSize(cvData.edu || "Sin Formación especificada", 180);
      doc.text(splitEdu, 15, y);
      y += splitEdu.length * 5 + 8;
      
      // Section: Competencias e Idiomas
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("COMPETENCIAS E IDIOMAS", 15, y);
      
      doc.line(15, y + 2, 195, y + 2);
      y += 8;
      
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitSkills = doc.splitTextToSize(cvData.skills || "Idiomas y competencias técnicas", 180);
      doc.text(splitSkills, 15, y);
      y += splitSkills.length * 5 + 8;
      
      // Section: Experiencia Práctica
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("EXPERIENCIA PRÁCTICA (Muestras de ejemplo)", 15, y);
      
      doc.line(15, y + 2, 195, y + 2);
      y += 8;
      
      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitExp = doc.splitTextToSize(cvData.exp || "Sin experiencia previa registrada", 180);
      doc.text(splitExp, 15, y);
      y += splitExp.length * 5 + 15;
      
      // Fictitious disclaimer stamp at the bottom
      doc.setDrawColor(220, 20, 60);
      doc.setLineWidth(0.5);
      doc.rect(15, y, 180, 22);
      
      doc.setTextColor(220, 20, 60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("AVISO IMPORTANTE: EJEMPLO DE CV DE REFERENCIA (MODELO FICTICIO)", 20, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Este documento es una maqueta de ejemplo con datos ficticios para guiar a los estudiantes en la preparacion de su perfil.", 20, y + 11);
      doc.text("Asegúrate de reemplazar toda la información con tus datos personales verídicos antes de postular.", 20, y + 16);
      
      const safeRole = (cvData.role || "Ejemplo").replace(/\s+/g, "-");
      doc.save(`CV-Ejemplo-${safeRole}.pdf`);
    } catch (err) {
      console.error("CV PDF export failed:", err);
      alert("Error al descargar el PDF del CV. Inténtalo de nuevo.");
    }
  };

  // Trigger lesson load whenever selected level or page changes
  useEffect(() => {
    handleLoadLesson(selectedLevel, currentPage);
  }, [selectedLevel, currentPage]);

  // Scroll to bottom of chat list whenever a new message is added
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  // Handle local exercise checking
  const handleVerifyExercise = (index: number, answerText: string, correctSpec: any, type: string) => {
    if (!answerText || answerText.trim() === "") return;
    let isCorrect = false;
    let feedback = "";

    if (type === "multiple-choice") {
      isCorrect = Number(answerText) === Number(correctSpec);
      feedback = isCorrect 
        ? "🎉 ¡CORRECTO! ¡Excelente razonamiento!" 
        : `❌ incorrecto. La respuesta formal correcta es: ${lessonData?.practice[index]?.options?.[correctSpec]}`;
    } else if (type === "fill-blank") {
      isCorrect = answerText.trim().toLowerCase() === String(correctSpec).toLowerCase();
      feedback = isCorrect 
        ? "🎉 ¡Muy bien hecho! +15 XP" 
        : `💡 Casi. La palabra correcta que completa la oración es: "${correctSpec}"`;
    } else if (type === "translation") {
      isCorrect = answerText.trim().toLowerCase().includes(String(correctSpec).toLowerCase().substring(0, 5));
      feedback = isCorrect 
        ? "🎉 ¡Excelente traducción! Tienes excelente comprensión." 
        : `💡 Intenta escribir algo similar a: "${correctSpec}"`;
    } else {
      isCorrect = true;
      feedback = "✨ ¡Revisado por IA! Has sumado +15 XP a tu cuenta.";
    }

    setExResults(prev => ({
      ...prev,
      [index]: { ok: isCorrect, fb: feedback }
    }));

    if (isCorrect) {
      awardStars(10, lang === "ar" ? "تمرين لغوي صحيح" : "Ejercicio resuelto correctamente");
    }
  };

  // Handle Level Advancement Exam compilation
  const handleAnswerExam = (qIndex: number, optionIndex: number) => {
    setExamAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitExam = () => {
    if (!examData) return;
    let correctCount = 0;
    (examData.questions || []).forEach((q: any, i: number) => {
      if (examAnswers[i] === q.correctIndex) {
        correctCount++;
      }
    });

    const passRatio = correctCount / (examData.questions || []).length;
    const passed = passRatio >= 0.6; // Pass at 60%

    setExamScore(correctCount);
    setExamPassed(passed);
    setExamSubmitted(true);

    if (passed) {
      const examKey = `${selectedLevel}-${selectedExamId}`;
      let isAdvancement = false;
      let nextLevelStr = "";

      setProfile(prev => {
        const currentPassed = prev.passedExams_v2 || [];
        const updatedPassed = currentPassed.includes(examKey)
          ? currentPassed
          : [...currentPassed, examKey];

        const allLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
        const currentIdx = allLevels.indexOf(prev.level);

        if (selectedLevel === prev.level && currentIdx < allLevels.length - 1) {
          isAdvancement = true;
          nextLevelStr = allLevels[currentIdx + 1];
          return {
            ...prev,
            level: nextLevelStr,
            passedExams_v2: updatedPassed
          };
        } else {
          return {
            ...prev,
            passedExams_v2: updatedPassed
          };
        }
      });

      // Award stars using our centralized gamification engine
      const starsToAward = isAdvancement ? 150 : 100;
      const reasonAr = isAdvancement ? "اجتياز امتحان الترقية للمستوى التالي" : "اجتياز اختبار الرتبة اللغوية";
      const reasonEs = isAdvancement ? "Examen de nivel superado con éxito (Ascenso)" : "Prueba de nivel superada";
      awardStars(starsToAward, lang === "ar" ? reasonAr : reasonEs);

      if (isAdvancement && nextLevelStr) {
        setSelectedLevel(nextLevelStr);
        setCurrentPage(getMinPage(nextLevelStr));
      }
    }
  };

  // Community Chat action
  const handleSendChatChatroom = async () => {
    if (!chatInp.trim()) return;
    const originalText = chatInp;
    setChatInp("");

    const userName = loggedStudent ? loggedStudent.name : "Invitado";

    try {
      // 1. Post student message to real DB
      const resPost = await fetch("/api/community/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userName,
          text: originalText,
          email: loggedInEmail || "Invitado"
        })
      });
      const dataPost = await resPost.json();
      if (!resPost.ok && dataPost.restricted) {
        alert(`🛑 SISTEMA DE MODERACIÓN MULTILINGÜE IA:\n\n${dataPost.error}`);
        return;
      }
      if (resPost.ok) {
        fetchStats(); // Dynamic refetch
        // Student receives +5 stars for contributing active conversation to the board
        awardStars(5, lang === "ar" ? "المشاركة في مجتمع الطلاب" : "Participación en comunidad");
      }
    } catch (e) {
      console.error("Error posting to database chatroom:", e);
    }

    // AI Language correction / hints logic
    const lower = originalText.toLowerCase().trim();
    let fallbackTip = "";

    if (lower.includes("yo quiere") || lower.includes("yo quiere estudiar")) {
      fallbackTip = "💡 Tip del Profesor: El verbo 'querer' es irregular en primera persona. Decimos 'Yo quiero estudiar' (e -> ie). ¡Buen intento, sigue practicando!";
    } else if (lower.includes("yo tener")) {
      fallbackTip = "💡 Tip del Profesor: Recuerda que 'tener' cambia en primera persona del presente. Se dice 'Yo tengo' (irregular: g-presente). ¡Sigue así!";
    } else if (lower.includes("espanol") && !lower.includes("español")) {
      fallbackTip = "💡 Tip Ortográfico: En español se usa la letra 'ñ'. Escribimos 'español'. Mantén pulsada la tecla 'n' para seleccionarla en tu teclado móvil.";
    } else if (lower.includes("yo gustar")) {
      fallbackTip = "💡 Tip Gramatical: Decimos 'Me gusta' en vez de 'yo gustar'. Ejemplo: 'Me gusta la cultura española'.";
    } else if (lower.includes("hola") || lower.includes("buenos dias") || lower.includes("que tal") || lower.includes("saludos")) {
      fallbackTip = "✨ ¡Bienvenido a nuestra comunidad de estudiantes españoles! ¿En qué ciudad de España estás planeando cursar tu formación profesional o estudios? Recuerda que tienes guías completas de ciudades en la pestaña de 'Guía de Ciudades' para explorar toda la información.";
    } else if (lower.includes("madrid") || lower.includes("barcelona") || lower.includes("valencia") || lower.includes("sevilla") || lower.includes("malaga")) {
      fallbackTip = "👍 ¡Un destino fantástico! Te sugiero que consultes la sección de 'Guía de Ciudades' donde puedes ver mapas, puntos de interés, y consejos prácticos sobre los supermercados de esa zona.";
    } else if (lower.includes("nie") || lower.includes("visado") || lower.includes("seguro") || lower.includes("empadronamiento")) {
      fallbackTip = "📋 Pro-Tip Comunidad: Comprueba las guías oficiales en la pestaña 'Etapas Clave'. El seguro de salud debe hacerse *antes* del visado, y el empadronamiento justo después de tener tu contrato de alquiler o residencia.";
    }

    try {
      const response = await fetch("/api/chat-correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: originalText })
      });
      if (response.ok) {
        const { tip } = await response.json();
        if (tip) {
          setTimeout(async () => {
            // Post AI Tip to the community DB too!
            await fetch("/api/community/post", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user: "Profesor de España 🤖",
                text: tip
              })
            });
            fetchStats();
            setProfile(prev => ({ ...prev, xp: prev.xp + 10 }));
          }, 930);
          return;
        }
      }
    } catch (e) {
      console.error("Gemini correction error, using robust offline fallback:", e);
    }

    // Trigger feedback tip
    if (fallbackTip) {
      setTimeout(async () => {
        await fetch("/api/community/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: "Profesor de España 🤖",
            text: fallbackTip
          })
        });
        fetchStats();
      }, 930);
    } else {
      // Trigger a lovely student response to keep interactions warm and dynamic
      setTimeout(async () => {
        const studentReplies = [
          "¡Hola! Bienvenido a la comunidad. ¡Mucho ánimo con tu aprendizaje!",
          "¡Hola! Yo también estoy estudiando español y preparando el visado. ¡Espero que nos veamos pronto!",
          "¡Hola compatriota! Cualquier duda que tengas sobre los estudios en España, puedes escribirla por aquí.",
          "¡Hola! Te recomiendo usar el Generador de CV Profesional y revisar los ejemplos de referencia en la segunda pestaña.",
          "¡Qué bien! Si necesitas practicar gramática, te animo a contestar los retos prácticos de la pestaña de 'Cursos de español'."
        ];
        const randomGreeting = studentReplies[Math.floor(Math.random() * studentReplies.length)];
        const randomUser = Math.random() > 0.5 ? "Sofia_es" : "Youssef_ma";

        await fetch("/api/community/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: randomUser,
            text: randomGreeting
          })
        });
        fetchStats();
      }, 2000);
    }
  };

  const handleReportPost = async (messageId: string, authorName: string) => {
    const reasonInp = window.prompt(`🚨 Denunciar Comentario de "${authorName}":\n\nPor favor, ingresa el motivo de la denuncia para informar a los administradores en el panel de Anomalías:`);
    if (reasonInp === null) return;
    const reason = reasonInp.trim() || "Envío de comentario sospechoso o inapropiado.";

    try {
      const res = await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          reason,
          reporterEmail: loggedInEmail || "Invitado"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("🛡️ ¡Denuncia Registrada!\n\nMuchas gracias por ayudarnos a mantener la comunidad limpia y segura. El equipo de administración revisará la anomalía de inmediato.");
        
        // Refresh messages
        if (data.communityMessages) {
          setChats(data.communityMessages);
        }
        fetchStats();
      } else {
        alert(data.error || "No se pudo registrar la denuncia.");
      }
    } catch (err: any) {
      alert("Error al enviar denuncia: " + err.message);
    }
  };

  const handleRequestAccompaniment = async () => {
    const studentEmail = loggedInEmail || localStorage.getItem("sp_logged_email") || "";
    if (!studentEmail) {
      alert("⚠️ Debes estar registrado e iniciar sesión con tu expediente para solicitar un acompañamiento paso a paso con R Consulting.");
      return;
    }

    const confirmMsg = lang === "fr" 
      ? "Voulez-vous envoyer une demande d'accompagnement personnalisé à R Consulting ? Un conseiller vous contactera bientôt."
      : lang === "ar"
      ? "هل تريد إرسال طلب مواكبة مخصصة إلى R Consulting؟ سيتصل بك مستشار قريبًا."
      : "¿Deseas enviar una solicitud de acompañamiento personalizado paso a paso a R Consulting? Un asesor experto revisará tu expediente y te contactará directamente.";

    if (!window.confirm(confirmMsg)) return;

    try {
      const studentName = loggedStudent ? `${loggedStudent.name} ${loggedStudent.lastName || ""}` : "Estudiante";
      const studentPhone = loggedStudent ? loggedStudent.phone : "";
      const res = await fetch("/api/community/accompaniment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail,
          studentPhone,
          studentName,
          details: `Solicitud de acompañamiento paso a paso desde el portal estudiantil (R Consulting).`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const successMsg = lang === "fr"
          ? "Félicitations ! Votre demande d'accompagnement R Consulting a été bien enregistrée. Nous vous contacterons étape par étape."
          : lang === "ar"
          ? "تهانينا! تم تسجيل طلب المواكبة من R Consulting بنجاح. سنتواصل معك خطوة بخطوة."
          : "¡Excelente! Tu solicitud de acompañamiento exclusivo de R Consulting ha sido registrada correctamente. Un asesor te contactará paso a paso por correo o teléfono.";
        alert(successMsg);
        fetchStats();
      } else {
        alert(data.error || "No se pudo registrar la solicitud.");
      }
    } catch (err: any) {
      alert("Error de conexión: " + err.message);
    }
  };

  const handleBookTutor = (name: string) => {
    alert(`✅ Reserva Registrada con Éxito\n\nProfesor: ${name}\n\nUn correo electrónico con el enlace de la reunión de Zoom para coordinar su sesión ha sido enviado.`);
  };

  const handleDownloadCityPDF = (cityObj: typeof STUDENT_CITIES_GUIDE[0]) => {
    try {
      const doc = new jsPDF();
      
      // Page styling background slate
      doc.setFillColor(12, 18, 34); // deep slate #0c1222
      doc.rect(0, 0, 210, 297, "F");
      
      doc.setTextColor(245, 158, 11); // Amber
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SPAIN STUDY PORTAL", 105, 35, { align: "center" });
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(`Official Student Guide & City Map: ${cityObj.city.toUpperCase()} ${cityObj.flag}`, 105, 48, { align: "center" });
      
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(1);
      doc.line(20, 56, 190, 56);
      
      // Box 1: Student Events
      doc.setFillColor(27, 37, 59); // subtle gray-blue
      doc.rect(20, 68, 170, 48, "F");
      
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(11);
      doc.text("1. EVENTS, SALSA & STUDENT LIFE ACTIVITIES", 25, 76);
      doc.setTextColor(230, 230, 230);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      
      const eventsText = cityObj.events[lang as keyof typeof cityObj.events] || cityObj.events.es;
      const splitEvents = doc.splitTextToSize(eventsText, 160);
      doc.text(splitEvents, 25, 84);
      
      // Box 2: Meeting Locals & Friends
      doc.setFillColor(27, 37, 59);
      doc.rect(20, 126, 170, 48, "F");
      
      doc.setTextColor(52, 211, 153); // emerald green
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. INTEGRATION & MAKING LOCAL FRIENDS", 25, 134);
      doc.setTextColor(230, 230, 230);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      
      const friendsText = cityObj.friends[lang as keyof typeof cityObj.friends] || cityObj.friends.es;
      const splitFriends = doc.splitTextToSize(friendsText, 160);
      doc.text(splitFriends, 25, 142);
      
      // Box 3: Smart Supermarket Savings index
      doc.setFillColor(27, 37, 59);
      doc.rect(20, 184, 170, 48, "F");
      
      doc.setTextColor(96, 165, 250); // soft blue
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("3. SUPERMARKET RATINGS & BUDGETING", 25, 192);
      doc.setTextColor(230, 230, 230);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      
      const marketText = `Rankings: ${cityObj.supermarkets.ranking[lang as keyof typeof cityObj.supermarkets.ranking] || cityObj.supermarkets.ranking.es}\nTips: ${cityObj.supermarkets.tips[lang as keyof typeof cityObj.supermarkets.tips] || cityObj.supermarkets.tips.es}`;
      const splitMarket = doc.splitTextToSize(marketText, 160);
      doc.text(splitMarket, 25, 200);

      // Map info footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8.5);
      doc.text("Generated via Spain Study Student Portal. Verify live schedule and locations continuously.", 105, 260, { align: "center" });
      
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(10);
      doc.text(`Download completed successfully. Save this PDF on your device offline!`, 105, 275, { align: "center" });

      doc.save(`Spain-Study-${cityObj.city}-Guide.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error generating PDF Guide. Please try again.");
    }
  };

  const renderPoliciesModal = () => {
    if (!showPoliciesModal) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" onClick={() => setShowPoliciesModal(false)}>
        <div 
          className="relative w-full max-w-3xl bg-[#090d1a] border-2 border-[#1e2e4b] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Decorative Top Bar */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
          
          {/* Modal Tabs / Header */}
          <div className="p-6 pb-4 border-b border-[#142137] bg-[#070b14] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  {lang === "es" ? "Centro de Políticas y Normativas" : 
                   lang === "ar" ? "مركز السياسات والأنظمة" : 
                   lang === "fr" ? "Centre de Politiques & Règlements" : 
                   "Policies & Regulations Center"}
                </h3>
              </div>
              <button 
                onClick={() => setShowPoliciesModal(false)}
                className="p-1.5 rounded-xl bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-all cursor-pointer shadow-sm text-xs px-2.5 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 p-1 bg-gray-950/80 rounded-xl border border-gray-800/60 w-full overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActivePolicyTab("terms")}
                className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                  activePolicyTab === "terms" 
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/10" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {lang === "es" ? "Condiciones de Uso" : lang === "ar" ? "شروط الاستخدام" : "Conditions d'Utilisation"}
              </button>
              <button
                type="button"
                onClick={() => setActivePolicyTab("privacy")}
                className={`flex-1 min-w-[120px] text-center py-2.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                  activePolicyTab === "privacy" 
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/10" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {lang === "es" ? "Privacidad y Datos" : lang === "ar" ? "الخصوصية والبيانات" : "Confidentialité & Données"}
              </button>
            </div>
          </div>

          {/* Modal Body Scroll Container */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0a0f1d] text-gray-300">
            {activePolicyTab === "terms" && (
              <div className="space-y-4">
                <div className="border-b border-gray-800/50 pb-3">
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                    {TERMS_OF_USE.title}
                  </h4>
                  <span className="text-[10px] text-gray-500 font-mono block mt-1">
                    {TERMS_OF_USE.subtitle} • {TERMS_OF_USE.version}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {TERMS_OF_USE.sections.map((sec, idx) => (
                    <div key={idx} className="bg-[#0e1627]/60 p-4 rounded-xl border border-gray-800/40 space-y-1.5">
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="text-amber-500 font-mono bg-amber-500/10 w-5 h-5 flex items-center justify-center rounded-lg border border-amber-500/20 text-[10px]">
                          {sec.num}
                        </span>
                        {sec.title}
                      </h5>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans font-normal">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-gray-500 pt-2 text-center font-mono">
                  {TERMS_OF_USE.footer}
                </p>
              </div>
            )}

            {activePolicyTab === "privacy" && (
              <div className="space-y-4">
                <div className="border-b border-gray-800/50 pb-3">
                  <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                    {PRIVACY_POLICY.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-2 italic font-sans leading-relaxed">
                    {PRIVACY_POLICY.introduction}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {PRIVACY_POLICY.sections.map((sec, idx) => (
                    <div key={idx} className="bg-[#0e1627]/60 p-4 rounded-xl border border-gray-800/40 space-y-1.5">
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="text-amber-500 font-mono bg-amber-500/10 w-5 h-5 flex items-center justify-center rounded-lg border border-amber-500/20 text-[10px]">
                          {sec.num}
                        </span>
                        {sec.title}
                      </h5>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans font-normal">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-gray-500 pt-2 text-center font-mono">
                  {PRIVACY_POLICY.footer}
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-[#070b14] border-t border-[#142137] flex justify-end gap-3 shrink-0">
            <button 
              type="button"
              onClick={() => setShowPoliciesModal(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold tracking-wide cursor-pointer transition-colors"
            >
              {lang === "es" ? "Entendido, cerrar" : lang === "ar" ? "إغلاق" : lang === "fr" ? "Fermer" : "Close"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (userRole === "admin") {
    return (
      <div className="min-h-screen bg-[#070a13] text-gray-200 flex flex-col font-sans select-none antialiased">
        <header className="bg-[#0c1222] border-b border-[#1b253b] p-4 flex items-center justify-between flex-wrap gap-4 shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-[#070a13] w-10 h-10 rounded-xl flex items-center justify-center font-black text-2xl shadow-md font-sans">
              🇪🇸
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                Atrévete a España <span className="text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold tracking-widest">COLLABORATOR PORTAL</span>
              </h1>
              <p className="text-xs text-gray-400 font-sans font-medium">Consola de Control de Negocio & Analítica BI en Tiempo Real</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-gray-400">Bienvenido, <strong>Administrador / Colaborador</strong></span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
            >
              Cerrar Sesión Pro
            </button>
          </div>
        </header>
        <AdminDashboard 
          lang={lang} 
          onLogout={handleLogout} 
          dbStats={dbStats} 
          onRefreshStats={fetchStats} 
          t={t} 
        />
        {renderPoliciesModal()}
      </div>
    );
  }

  if (userRole === null) {
    return (
      <div className="min-h-screen bg-[#070a13] text-gray-200 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
        <div className="max-w-4xl w-full space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-4xl sm:text-5xl">🇪🇸 ✈️ 🎓</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              Atrévete a España
            </h1>
            <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed font-sans">
              La plataforma de acompañamiento integral y preparación de español para alumnos de Marruecos, Argelia y otros países árabes.
            </p>
          </div>

          <div className="bg-[#0b1222] border-2 border-[#1c2e4f] rounded-3xl overflow-hidden shadow-2xl">
            {/* Tab switchers */}
            <div className="flex border-b border-[#1c2e4f] bg-[#080d1a]">
              <button
                type="button"
                onClick={() => { setActivePortalTab("student"); setAuthError(""); }}
                className={`flex-1 py-4 text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors ${activePortalTab === "student" ? 'bg-[#0b1222] text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white hover:bg-gray-800/20'}`}
              >
                🎓 Portal para Estudiantes
              </button>
              <button
                type="button"
                onClick={() => { setActivePortalTab("creator"); setAuthError(""); }}
                className={`flex-1 py-4 text-xs sm:text-sm font-bold tracking-wider uppercase transition-colors ${activePortalTab === "creator" ? 'bg-[#0b1222] text-amber-400 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white hover:bg-gray-800/20'}`}
              >
                🏢 Portal de Anfitriones y Creadores
              </button>
            </div>

            {/* Portal Tab content */}
            <div className="p-6 sm:p-8">
              {authError && (
                <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/20 rounded-2xl text-xs text-red-500 font-medium font-sans">
                  ⚠️ {authError}
                </div>
              )}

              {activePortalTab === "student" && (
                <div className="flex bg-[#070a13] p-1.5 rounded-2xl gap-2 border border-gray-800/80 mb-6 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => { setStudentActionTab("register"); setAuthError(""); }}
                    className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all ${studentActionTab === "register" ? "bg-amber-500 text-black font-extrabold shadow shadow-amber-500/10" : "text-gray-400 hover:text-white"}`}
                  >
                    📝 Crear Cuenta (Registro)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStudentActionTab("login"); setAuthError(""); }}
                    className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all ${studentActionTab === "login" ? "bg-amber-500 text-black font-extrabold shadow shadow-amber-500/10" : "text-gray-400 hover:text-white"}`}
                  >
                    🔑 Iniciar Sesión (Entrar)
                  </button>
                </div>
              )}

              {activePortalTab === "student" ? (
                <form onSubmit={handleStudentLogin} className="space-y-5 animate-fade-in">
                  
                  {studentActionTab === "login" ? (
                    <div className="space-y-4 animate-fade-in bg-gray-900/10 p-5 rounded-3xl border border-gray-800/40">
                      <div className="space-y-2 border-b border-gray-800/60 pb-3">
                        <p className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Acceso Estudiante Registrado</p>
                        <p className="text-xs text-gray-300 leading-snug font-sans">
                          Introduce la dirección de correo electrónico con la que te registraste o introduce tu código identificador único de estudiante (<span className="text-amber-400 font-mono font-bold">AE-ACCT-XXXXX</span>).
                        </p>
                      </div>

                      <div className="space-y-4 max-w-md mx-auto pt-2">
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1.5">Correo Electrónico o Código de Estudiante</label>
                          <input
                            type="text"
                            placeholder="Ej: sofia@gmail.com o AE-ACCT-10001"
                            value={studentEmailInput}
                            onChange={(e) => setStudentEmailInput(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-3.5 text-xs text-white outline-none focus:border-amber-500 font-serif"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-fade-in">
                      <div className="space-y-2 border-b border-gray-800/60 pb-3">
                        <p className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Inscripción Obligatoria de Alumno - Registro de Expediente Único</p>
                        <p className="text-xs text-gray-400 leading-snug font-sans">
                          Por favor, completa todos tus datos personales, académicos y de destino reales. Su expediente iniciará con un Score de <strong className="text-emerald-400">0 XP</strong>.
                        </p>
                        {dbStats?.subscriptionEnabled === false ? (
                          <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-400 font-sans flex items-center gap-2">
                            <span>🎁</span>
                            <span><strong>¡Acceso Libre y Gratuito!</strong> La suscripción de pago mensual ha sido desactivada por el administrador.</span>
                          </div>
                        ) : (
                          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 font-sans flex items-center gap-2">
                            <span>💶</span>
                            <span><strong>Membresía Premium:</strong> Requiere una cuota de acceso de {dbStats?.subscriptionPrice || 59}€/mes.</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* COLUMNA 1: DATOS PERSONALES */}
                        <div className="space-y-3.5 bg-gray-900/20 p-4 rounded-2xl border border-gray-800/40">
                          <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider font-mono">1. Datos Personales</h4>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Nombre</label>
                              <input
                                type="text"
                                placeholder="Ej: Sofia"
                                value={studentNameInput}
                                onChange={(e) => setStudentNameInput(e.target.value)}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                                required={studentActionTab === "register"}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Apellido</label>
                              <input
                                type="text"
                                placeholder="Ej: Mansouri"
                                value={studentLastNameInput}
                                onChange={(e) => setStudentLastNameInput(e.target.value)}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                                required={studentActionTab === "register"}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Número de Teléfono</label>
                              <input
                                type="tel"
                                placeholder="+212 612-345678"
                                value={studentPhoneInput}
                                onChange={(e) => setStudentPhoneInput(e.target.value)}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                                required={studentActionTab === "register"}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Edad</label>
                              <input
                                type="number"
                                min="14"
                                max="75"
                                placeholder="20"
                                value={studentAgeInput}
                                onChange={(e) => setStudentAgeInput(e.target.value)}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                                required={studentActionTab === "register"}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Correo Electrónico Oficial</label>
                            <input
                              type="email"
                              placeholder="sofia@gmail.com"
                              value={studentEmailInput}
                              onChange={(e) => setStudentEmailInput(e.target.value)}
                              className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                              required={studentActionTab === "register"}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1 font-sans">Género</label>
                            <select
                              value={studentGenderInput}
                              onChange={(e) => setStudentGenderInput(e.target.value)}
                              className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                            >
                              <option value="Femenino">Femenino</option>
                              <option value="Masculino">Masculino</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1 font-sans">Nivel Inicial de Español (No editable después)</label>
                            <select
                              value={studentSpanishLevelInput}
                              onChange={(e) => setStudentSpanishLevelInput(e.target.value)}
                              className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                            >
                              <option value="A1">A1 - Inicial Básico</option>
                              <option value="A2">A2 - Elemental</option>
                              <option value="B1">B1 - Intermedio</option>
                              <option value="B2">B2 - Intermedio Alto</option>
                              <option value="C1">C1 - Avanzado</option>
                              <option value="C2">C2 - Superior Dominio</option>
                            </select>
                          </div>
                        </div>

                        {/* COLUMNA 2: ORIGEN, RESIDENCIA Y ACADÉMICO */}
                        <div className="space-y-3.5 bg-gray-900/20 p-4 rounded-2xl border border-gray-800/40">
                          <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider font-mono">2. Ubicación y Metas Académicas</h4>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">País Nacimiento (Origen)</label>
                              <select
                                value={studentCountryInput}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setStudentCountryInput(val);
                                  // Auto sync current location on select
                                  setStudentCurrentCountryInput(val);
                                }}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                              >
                                <option value="Morocco">🇲🇦 Marruecos</option>
                                <option value="Algeria">🇩🇿 Argelia</option>
                                <option value="Tunisia">🇹🇳 Túnez</option>
                                <option value="Egypt">🇪🇬 Egipto</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">País Residencia Actual</label>
                              <select
                                value={studentCurrentCountryInput}
                                onChange={(e) => setStudentCurrentCountryInput(e.target.value)}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                              >
                                <option value="Morocco">🇲🇦 Marruecos</option>
                                <option value="Algeria">🇩🇿 Argelia</option>
                                <option value="Tunisia">🇹🇳 Túnez</option>
                                <option value="Egypt">🇪🇬 Egipto</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Ciudad Actual</label>
                              <input
                                type="text"
                                placeholder="Ej: Casablanca"
                                value={studentCurrentCityInput}
                                onChange={(e) => setStudentCurrentCityInput(e.target.value)}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                                required={studentActionTab === "register"}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Ciudad Destino (España)</label>
                              <select
                                value={studentTargetCityInput}
                                onChange={(e) => setStudentTargetCityInput(e.target.value)}
                                className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                              >
                                <option value="Madrid">Madrid</option>
                                <option value="Barcelona">Barcelona</option>
                                <option value="Valencia">Valencia</option>
                                <option value="Sevilla">Sevilla</option>
                                <option value="Zaragoza">Zaragoza</option>
                                <option value="Granada">Granada</option>
                                <option value="Málaga">Málaga</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Formación Actual cursada</label>
                            <select
                              value={studentCurrentEduInput}
                              onChange={(e) => setStudentCurrentEduInput(e.target.value)}
                              className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                            >
                              <option value="Bachillerato">Bacalauréat / Bachillerato</option>
                              <option value="Estudios Universitarios Graduado">Estudios Universitarios (Licenciatura)</option>
                              <option value="Formación Profesional Inicial">FP Inicial o Medio</option>
                              <option value="Máster Completo">Máster / Postgrado</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Formación de Interés (España)</label>
                            <select
                              value={studentGoalInput}
                              onChange={(e) => setStudentGoalInput(e.target.value)}
                              className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 font-sans"
                            >
                              <option value="FP Grado Superior">FP Grado Superior (2 años)</option>
                              <option value="Universidad">Universidad (Estudios de Grado)</option>
                              <option value="Grado Medio">FP Grado Medio (Técnico)</option>
                              <option value="Máster">Máster de Postgrado Oficial</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* POLICIES & TERMS COMPLIANCE CHECKBOX - MANDATORY FOR BOTH MODES */}
                  <div className="bg-gray-950/40 p-4.5 rounded-2xl border border-[#1c2e4f] space-y-3 mt-4">
                    <div className="flex items-start gap-3 select-none">
                      <input
                        type="checkbox"
                        id="policy-accept-checkbox"
                        checked={policiesAccepted}
                        onChange={(e) => setPoliciesAccepted(e.target.checked)}
                        className="mt-1 accent-amber-500 rounded cursor-pointer w-4 h-4 shrink-0"
                      />
                      <span className="text-xs text-gray-300 leading-relaxed font-sans">
                        He leído, comprendo y acepto expresamente las{" "}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePolicyTab("terms"); setShowPoliciesModal(true); }}
                          className="text-amber-400 underline hover:text-amber-300 font-semibold inline-block focus:outline-none cursor-pointer"
                        >
                          Condiciones Generales de Uso
                        </button>{" "}
                        y la{" "}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActivePolicyTab("privacy"); setShowPoliciesModal(true); }}
                          className="text-amber-400 underline hover:text-amber-300 font-semibold inline-block focus:outline-none cursor-pointer"
                        >
                          Política de Tratamiento de Datos y Privacidad
                        </button>{" "}
                        de EstudiaEspaña.
                      </span>
                    </div>
                  </div>

                  {/* SECURE ANTI-BOT CAPTCHA COMPONENT */}
                  <div className="bg-gray-950/60 p-4 rounded-2xl border-2 border-dashed border-[#1c2e4f]/80 space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🛡️</span>
                        <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">Verificación Humana Obligatoria Anti-Bots</h4>
                      </div>
                      <button
                        type="button"
                        onClick={regenerateCaptcha}
                        className="text-[10px] text-gray-400 hover:text-amber-400 flex items-center gap-1 font-mono hover:underline focus:outline-none cursor-pointer"
                        title="Cambiar operación matemática"
                      >
                        🔄 Cambiar operación
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-normal font-sans">
                      Resuelva esta sencilla suma matemática para certificar que es un estudiante humano y evitar accesos robotizados automatizados:
                    </p>
                    <div className="flex items-center gap-4 bg-[#070a13] p-3 rounded-xl border border-gray-800">
                      <div className="text-xs font-bold font-mono text-white tracking-wider px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        ¿Cuánto es {captchaNum1} + {captchaNum2}?
                      </div>
                      <span className="text-white font-mono font-bold text-xs">=</span>
                      <input
                        type="number"
                        placeholder="Escribe el resultado..."
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        className="flex-1 bg-[#070a13] border-b border-gray-700 focus:border-amber-500 text-xs text-white font-semibold font-mono p-1 outline-none text-center"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl cursor-pointer transition-transform duration-150 transform active:scale-95 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 font-sans text-center mt-5"
                  >
                    {studentActionTab === "login" ? "🚀 Acceder a mi Expediente" : "🚀 Registrar mi Expediente y Acceder"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold font-sans">Consola Única para Colaboradores y Administradores</p>
                    <p className="text-xs text-gray-400 leading-snug font-sans">Panel administrativo con métricas SAAS, filtros de candidatos a empresas, alertas de conversión de colaboradores e IA Advisor de soporte.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1.5 font-sans">Correo del Administrador</label>
                      <input
                        type="email"
                        placeholder="ejemplo@atrevete.com"
                        value={adminEmailInput}
                        onChange={(e) => setAdminEmailInput(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 font-sans"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1.5 font-sans col-span-1">Contraseña Maestra</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 font-sans"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl cursor-pointer transition-transform mt-4 flex items-center justify-center gap-2 font-sans text-center"
                  >
                    Iniciar Consola de Colaboradores ➔
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        {renderPoliciesModal()}
      </div>
    );
  }

  // Render the Gamification Dashboard Card (Bento Style with progress, missions, badges, and loss prevention cues)
  const renderGamificationDashboard = () => {
    const stars = profile.xp || 0;
    const { active: activeLvl, next: nextLvl } = getStudentLevelInfo(stars);
    
    // Calculate progress percent to next level
    let progressPercent = 100;
    let starsNeededForNext = 0;
    if (nextLvl) {
      const currentLevelMin = activeLvl.minStars;
      const nextLevelMin = nextLvl.minStars;
      const gainedInCurrentRange = stars - currentLevelMin;
      const totalRange = nextLevelMin - currentLevelMin;
      progressPercent = Math.min(100, Math.max(0, (gainedInCurrentRange / totalRange) * 100));
      starsNeededForNext = nextLevelMin - stars;
    }

    const nextUnlocks: Record<number, string> = {
      1: lang === "ar" 
         ? "فتح اللغة الإسبانية A2، خطوات جلب الفيزا 2 و 3، ومعلومات مدينتي برشلونة وفالنسيا." 
         : "Español A2 completo, Pasos Visa 2 y 3, Ciudades Barcelona y Valencia.",
      2: lang === "ar"
         ? "فتح اللغة الإسبانية B1، كامل خطوات ملف الفيزا، دليل السكن الطلابي المتكامل، استكشاف 8 مدن إسبانية."
         : "Español B1 completo, Guía Visa completa, Guía de alojamiento completa, 8 Ciudades nacionales.",
      3: lang === "ar"
         ? "فتح الإسبانية B2، دليل NIE المتقدم، دليل البنوك والحسابات، ومعلومات تخصصات التكوين المهني بالتفصيل."
         : "Español B2 completo, Guía NIE avanzada, Guía bancaria completa, Especialidades FP con descripción.",
      4: lang === "ar"
         ? "فتح الإسبانية C1، دليل الضمان الاجتماعي والصحة، تخصصات الجامعات والماسترات، وسيمولاتور اختبارات DELE."
         : "Español C1 completo, Guía Seguridad Social + Sanidad, Carreras universitarias y Másteres, Simulacro DELE B2.",
      5: lang === "ar"
         ? "فتح الإسبانية C2، امتحانات DELE الرسمية المتقدمة، وباقة التوجيه VIP الشاملة مع فريق R Consulting."
         : "Español C2 completo, Simulacro DELE C1/C2, Guías de Investigación y Coordinador VIP."
    };

    const badgesData = [
      { id: "llama_7_dias", icon: "🔥", label: lang === "ar" ? "لهيب الأسبوع" : "Racha 7D", desc: lang === "ar" ? "حافظ على رصيد متواصل لـ 7 أيام" : "Mantén una racha de 7 días seguidos" },
      { id: "diamante_30_dias", icon: "💎", label: lang === "ar" ? "الجوهرة الصلبة" : "Racha 30D", desc: lang === "ar" ? "التزام حديدي متصل لـ 30 يوماً" : "Racha ininterrumpida de 30 días" },
      { id: "sin_errores", icon: "🎯", label: lang === "ar" ? "المتقن" : "Sin Errores", desc: lang === "ar" ? "أكملت درساً كاملاً بـ 0 خطأ!" : "Completa una lección con calificación del 100%" },
      { id: "listo_espana", icon: "🇪🇸", label: lang === "ar" ? "جاهز لإسبانيا" : "Listo España", desc: lang === "ar" ? "الوصول للمستوى 5 (3000 نجمة)" : "Alcanza la etapa máxima de Experto" },
      { id: "embajador", icon: "🌍", label: lang === "ar" ? "السفير" : "Embajador", desc: lang === "ar" ? "دعوة الأصدقاء ومشاركة الدليل" : "Invita a compañeros a preparar su visa" },
      { id: "estrella_semana", icon: "⭐", label: lang === "ar" ? "نجم الأسبوع" : "Top Semanal", desc: lang === "ar" ? "الولوج لقائمة نجوم الأسبوع" : "Consigue estrellas récord esta semana" },
      { id: "dele_ready", icon: "🎓", label: lang === "ar" ? "مستعد للديل" : "DELE Ready", desc: lang === "ar" ? "إكمال رصيد الاختبارت المحاكية" : "Completa simulaciones de examen exitosas" },
      { id: "experto_pisos", icon: "🏠", label: lang === "ar" ? "خبير السكن" : "Experto Pisos", desc: lang === "ar" ? "تصفح ومراجعة كدائل الشقق بالكامل" : "Lee todas las guías de alquileres" },
      { id: "maestro_visa", icon: "📋", label: lang === "ar" ? "عبقري الفيزا" : "Maestro Visa", desc: lang === "ar" ? "أنهيت إعداد ومعاينة كل أوراق الملف" : "Revisa el dossier nacional de inmigración" }
    ];

    const isExpiringStarsActive = !!profile.expiringStars;

    return (
      <div className="bg-[#0b1020] border-2 border-amber-500/25 p-5 rounded-3xl shadow-2xl space-y-5 text-left mb-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        
        {/* Header content and metrics */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-xl font-bold text-[#0c1222] shadow-md animate-pulse">
              🏆
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-mono block uppercase tracking-wider">{lang === "ar" ? "الرتبة التعليمية والتقدم" : "NIVEL DE PREPARACIÓN"}</span>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                <span>{lang === "ar" ? "المستوى" : "Nivel"} {activeLvl.level}</span>
                <span className="text-gray-600">•</span>
                <span className="text-amber-400">{lang === "ar" ? activeLvl.nameAr : activeLvl.nameEs}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-[#070a13] border border-gray-800 px-3.5 py-1.5 rounded-xl text-center">
              <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider">{lang === "ar" ? "النجوم المكتسبة ⭐" : "Estrellas (النجوم)"}</span>
              <strong className="text-amber-400 text-xs font-black font-mono">{stars} Nujum ⭐</strong>
            </div>

            <div className="bg-[#120f0d] border border-orange-500/15 px-3 py-1 bg-orange-500/5 rounded-xl flex items-center gap-1.5 text-xs text-orange-400 shrink-0">
              <span className="text-sm">🛡️</span>
              <div>
                <span className="text-[8px] text-gray-500 block leading-tight font-black uppercase">{lang === "ar" ? "حماية الغياب" : "Protección Racha"}</span>
                <span className="font-bold text-[10px]">{profile.streakProtectedUsedThisWeek ? (lang === "ar" ? "استعملت" : "Utilizada") : (lang === "ar" ? "جاهزة" : "Lista")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Representation & Next Unlocks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-normal">
          <div className="lg:col-span-8 space-y-2.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-gray-400">{lang === "ar" ? "رصيدك الحالي:" : "Mi Balance:"} <strong>{stars} ⭐</strong></span>
              <span className="text-gray-300 font-bold">{progressPercent.toFixed(0)}%</span>
              <span className="text-gray-400">{lang === "ar" ? "الهدف التالي:" : "Siguiente Nivel:"} <strong>{nextLvl ? nextLvl.minStars : "Max"} ⭐</strong></span>
            </div>
            
            <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-800/60 flex text-left">
              <div 
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            {nextLvl && (
              <p className="text-[11px] text-gray-400 leading-normal animate-fadeIn">
                💡 {lang === "ar" ? `تحتاج إلى ${starsNeededForNext} نجمة إضافية للوصول إلى المستوى ${nextLvl.level} (${nextLvl.nameAr}).` : `Faltan ${starsNeededForNext} estrellas para la etapa ${nextLvl.level} (${nextLvl.nameEs}).`} 
                <span className="text-amber-400 block mt-1 font-bold">
                  🔮 {lang === "ar" ? "سيفتح لك:" : "Desbloqueos:"} {nextUnlocks[nextLvl.level]}
                </span>
              </p>
            )}
          </div>

          <div className="lg:col-span-4 space-y-2 lg:border-l lg:border-gray-800/80 lg:pl-5">
            {/* Loss-Aversion Indicator */}
            <div className="bg-red-500/5 border border-red-500/15 p-3 rounded-2xl text-[10px]">
              <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1 uppercase tracking-wider font-mono">
                <span className="text-xs animate-pulse">⚠️</span>
                <span>{lang === "ar" ? "مخاطر فقدان النقود" : "Expira pronto"}</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {isExpiringStarsActive 
                  ? (lang === "ar" ? "لديك بونص نجوم يومي نشط وسيفقد مفعوله خلال 48 ساعة إن لم تسجل نشاطاً تعليمياً اليوم." : "Racha activa. Si pasas más de 3 días inactivo, tus estrellas extra caducarán y tu multiplicador se reiniciará.")
                  : (lang === "ar" ? "النجوم المكتسبة بنشاطات التعلم تحتاج لدخول دائم. أكثر من 72 ساعة خمول ستلغي مكافأة المضاعف." : "Las estrellas extra de constancia caducan tras 3 días de inactividad de estudio. ¡Sigue aprendiendo hoy!")}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Time-limited missions */}
        <div className="space-y-3 pt-4 border-t border-gray-800/80">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>⏰</span> {lang === "ar" ? "المهمات الطلابية الأسبوعية" : "Misiones Semanales (Expira el Lunes)"}
            </h4>
            <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 px-2 py-0.5 rounded">
              7 días límite
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(profile.weeklyMissions || []).map((m: any) => (
              <div 
                key={m.id} 
                className={`p-3 rounded-2xl border transition-all ${
                  m.done 
                    ? "bg-emerald-500/5 border-emerald-500/15 opacity-70" 
                    : "bg-[#070a13] border-gray-850 hover:border-gray-850"
                }`}
              >
                <div className="flex justify-between items-center gap-1">
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    m.done ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                  }`}>
                    {m.done ? (lang === "ar" ? "تم التحقيق" : "CUMPLIDO") : `⭐ +${m.reward}`}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono font-bold">{m.progress}/{m.target}</span>
                </div>
                <p className="text-[10px] font-bold text-gray-200 mt-2 line-clamp-2 h-8 leading-snug">{m.title}</p>
                <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full rounded-full transition-all ${m.done ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${(m.progress / m.target) * 105}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gamified Social Badges Container */}
        <div className="space-y-3 pt-4 border-t border-gray-800/80">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
              🏆 {lang === "ar" ? "أوسمة وشارات التميز والمشاركة الاجتماعية" : "Insignias de Honor y Carácter Social"}
            </h4>
            
            <button
              onClick={() => {
                const updatedBadges = profile.unlockedBadges || [];
                if (!updatedBadges.includes("embajador")) {
                  const withEmb = [...updatedBadges, "embajador"];
                  setProfile(prev => ({
                    ...prev,
                    unlockedBadges: withEmb,
                    xp: prev.xp + 50
                  }));
                  alert(lang === "ar" 
                    ? "🌍 رائع! قمت بمشاركة التطبيق المترجم بنجاح مع أصدقائك في المغرب/الجزائر. كسبت وسام السفيـر (السفير) +50 نجمة ⭐!" 
                    : "🌍 ¡Estupendo! Compartiste el portal de visados con tus compañeros. Se ha desbloqueado la insignia de EMBAJADOR (السفير) y ganas +50 estrellas bonus ⭐.");
                } else {
                  alert(lang === "ar" ? "حسابك يملك بالفعل وسام السفير المعتمد." : "Ya posees esta insignia de Embajador en tu perfil.");
                }
              }}
              className="text-[9px] bg-blue-500/10 hover:bg-blue-500 hover:text-black border border-blue-500/25 text-blue-400 font-bold px-3 py-1 rounded-xl transition cursor-pointer shrink-0"
            >
              🤝 {lang === "ar" ? "دعوة الأصدقاء (+50 نجمة)" : "Invitar Amigos (+50 ⭐)"}
            </button>
          </div>

          <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-thin">
            {badgesData.map(b => {
              const belongs = (profile.unlockedBadges || []).includes(b.id);
              return (
                <div 
                  key={b.id}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-help relative group shrink-0 w-[84px] ${
                    belongs 
                      ? "bg-gradient-to-b from-[#11192e] to-[#070a13] border-amber-500/30 shadow-md animate-fadeIn" 
                      : "bg-[#070a13] border-gray-900 opacity-20"
                  }`}
                  title={`${b.label}: ${b.desc}`}
                >
                  <span className="text-xl block">{b.icon}</span>
                  <span className="text-[8px] font-bold text-gray-300 block truncate mt-1.5 leading-none">{b.label}</span>
                  
                  {/* Hover tooltips */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-36 p-2 bg-black border border-gray-800 rounded-xl text-[9px] text-left text-gray-300 hidden group-hover:block z-50 shadow-2xl leading-relaxed">
                    <strong className="text-amber-400 block">{b.label}</strong>
                    <span>{b.desc}</span>
                    <span className="block mt-1 font-semibold font-mono text-gray-500">{belongs ? "✓ DESBLOQUEADO" : "🔒 BLOQUEADO"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-height-screen bg-[#070a13] text-gray-200 flex flex-col font-sans select-none antialiased">
      
      {/* HEADER BANNER */}
      <header className="sticky top-0 z-50 bg-[#0c1222] border-b border-[#1b253b] px-4 py-3 flex items-center justify-between flex-wrap gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 text-[#070a13] w-10 h-10 rounded-xl flex items-center justify-center font-black text-2xl shadow-md">
            🇪🇸
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-2 font-sans font-medium">
              Spain Study Portal
              {loggedStudent ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-mono tracking-widest px-2 py-0.5 rounded uppercase font-bold">
                    Alumno: {loggedStudent.name}
                  </span>
                  {loggedStudent.premiumStatus ? (
                    <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded uppercase font-black">
                      💎 Premium
                    </span>
                  ) : loggedStudent.freeTierExempt ? (
                    <span className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded uppercase font-black font-sans">
                      🎟️ Licencia Free / Beca
                    </span>
                  ) : (
                    <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded uppercase font-black">
                      ⏳ Acceso Regular
                    </span>
                  )}
                </div>
              ) : (
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-widest px-2 py-0.5 rounded uppercase">
                  ARABIC-ACCESSIBLE
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400 font-sans">
              {lang === "ar" ? "بوابة الإعداد الشاملة والتعليمية للطلاب العرب الراغبين بالدراسة والعمل في إسبانيا" :
               lang === "fr" ? "Portail interactif de préparation et d'espagnol pour étudiants arabes en Espagne" :
               lang === "es" ? "Portal de preparación educativa para estudiantes árabes en España" :
               "Interactive preparation and vocabulary handbook for Arab students in Spain"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Native Language Select Switcher */}
          <div className="bg-[#070a13] border border-[#1e293b] p-1 rounded-xl flex gap-1 items-center">
            {LANGUAGES.map(l => (
              <button 
                key={l.code}
                id={`lang-btn-${l.code}`}
                onClick={() => setLang(l.code)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-transform focus:outline-none ${lang === l.code ? 'bg-amber-500 text-gray-900 font-bold scale-105 shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                <span className="mr-1">{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>

          {/* Real-time Game stats engine */}
          <div className="flex items-center gap-3 bg-[#070a13] border border-[#1e293b] px-3 py-1.5 rounded-xl shadow-inner font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500 font-sans uppercase">Score</span>
              <span className="text-emerald-400 font-bold">{profile.xp} XP</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-amber-400 font-bold">{profile.streak}d</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500 font-sans uppercase">CEFR</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">{profile.level}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CORE FRAMEWORK BODY */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR NAVIGATION & SELECTIVE STUDENT FILE */}
        <aside className="w-full md:w-[260px] flex-shrink-0 flex flex-col gap-4">
          
          {/* Main sections Navigation rail */}
          <nav className="bg-[#0c1222] border border-[#1b253b] p-2 rounded-2xl flex flex-col gap-1.5 shadow-md" id="nav-rail">
            {customNavItems.map(n => {
              const active = tab === n.key;
              return (
                <button
                  key={n.key}
                  id={`nav-item-${n.key}`}
                  onClick={() => { setTab(n.key); setExamActive(false); }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${active ? 'bg-amber-500 text-[#070a13] font-bold shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}
                >
                  <span className="text-base">{n.icon}</span>
                  <span>{t(n)}</span>
                  {n.key === "ebook" && (
                    <span className="ml-auto bg-black/15 text-[9px] font-mono px-1.5 py-0.5 rounded text-white">Active</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick profile goals coordinator */}
          <div className="bg-[#0c1222] border border-[#1b253b] p-4 rounded-2xl shadow-md">
            <h3 className="text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase mb-3 flex items-center gap-2">
              <User size={12} className="text-amber-500" />
              {lang === "ar" ? "بيانات ملفي وهدفي" :
               lang === "fr" ? "Profil & Objectif" :
               lang === "es" ? "Mi Expediente de metas" :
               "My Goal & Origin"}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  {lang === "ar" ? "البلد الأصلي" : lang === "fr" ? "Pays d'Origine" : "Country of Origin"}
                </label>
                <select 
                  value={profile.country}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfile(prev => ({ ...prev, country: val }));
                    setVisaCountry(val);
                  }}
                  className="w-full bg-[#070a13] border border-[#232f4e] rounded-lg text-xs p-2 text-white outline-none focus:border-amber-500"
                >
                  <option value="morocco">🇲🇦 Maroc / المغرب</option>
                  <option value="algeria">🇩🇿 Algérie / الجزائر</option>
                  <option value="tunisia">🇹🇳 Tunisie / تونس</option>
                  <option value="egypt">🇪🇬 Égypte / مصر</option>
                  <option value="jordan">🇯🇴 Jordanie / الأردن</option>
                  <option value="lebanon">🇱🇧 Liban / لبنان</option>
                  <option value="gulf_gcc">🇸🇦🇦🇪 Pays du Golfe / الخليج</option>
                  <option value="iraq_syria">🇮🇶🇸🇾 Irak & Syrie / العراق وسوريا</option>
                  <option value="middleeast">🌍 Autre Moyen-Orient / باقي الشرق الأوسط</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">
                  {lang === "ar" ? "الهدف الدراسي المخطط له" : lang === "fr" ? "Projet en Espagne" : "Target Study Route"}
                </label>
                <select
                  value={profile.goal}
                  onChange={(e) => setProfile(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full bg-[#070a13] border border-[#232f4e] rounded-lg text-xs p-2 text-white outline-none focus:border-amber-500"
                >
                  <option value="FP Grado Superior">FP Grado Superior (2 ans)</option>
                  <option value="FP Grado Medio">FP Grado Medio (2 ans)</option>
                  <option value="Universidad (Grado)">Estudios Universitarios (Grado)</option>
                  <option value="Máster Universitario">Máster Universitario (60 ECTS)</option>
                  <option value="Doctorado o Investigación">Doctorado (PhD)</option>
                </select>
              </div>

              <div className="p-3 bg-[#070a13] border border-[#1b253b] rounded-xl text-[11px] text-gray-400 leading-relaxed font-sans mt-2">
                <span className="text-amber-400 font-bold block mb-1">🎯 {lang === "ar" ? "توجيه ذكي" : "Advice for you"}</span>
                {profile.goal.includes("FP") 
                  ? (lang === "ar" ? "للتسجيل في التكوين المهني FP، ننصحك بالتقديم السريع على معادلة شهادة البكالوريا Homologación لوزارة التربية، تستغرق المعالجة من 6 إلى 12 شهراً." :
                     "Pour démarrer un programme de Formation Professionnelle FP, préparez en priorité l'homologation de votre diplôme de Baccalauréat auprès du Ministère espagnol.")
                  : (lang === "ar" ? "للدراسة بالجامعة، ابدأ بالاتصال بـ UNEDasiss لإرسال درجاتك واجتياز مواد PCE الاختيارية لرفع معدل القبول." :
                     "Pour l'admission directe en Licence, vous devez passer les examens PCE de Selectividad via l'organisme UNEDasiss.")
                }
              </div>
            </div>
          </div>

          {/* R Consulting Accompaniment Request Banner */}
          <div className="bg-gradient-to-br from-[#0c1222] to-[#121c33] border-2 border-amber-500/30 p-4 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
                {lang === "fr" ? "Aide Personnalisée ?" : lang === "ar" ? "مساعدة مخصصة؟" : "¿Ayuda Personalizada?"}
              </h4>
            </div>
            
            <p className="text-[11px] text-gray-200 leading-normal font-sans">
              {lang === "fr" ? "Tu as besoin d'aide personnalisée ? R Consulting t'accompagne étape par étape." :
               lang === "ar" ? "هل تحتاج إلى مساعدة مخصصة؟ شركة R Consulting ترافقك خطوة بخطوة لدعم ملفك بالكامل." :
               "¿Necesitas ayuda personalizada? R Consulting te acompaña paso a paso en todo el proceso de visado, matrícula y llegada."}
            </p>

            <button
              onClick={handleRequestAccompaniment}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs rounded-xl shadow-md transition-all font-sans flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>📩</span>
              {lang === "fr" ? "Demander l'accompagnement" : lang === "ar" ? "طلب المواكبة" : "Solicitar Acompañamiento"}
            </button>
          </div>
        </aside>

        {/* PRIMARY INTERACTIVE CONTENT REGION */}
        <main className="flex-1 min-w-0 flex flex-col gap-6" id="primary-student-main">
          
          {/* TOP DYNAMIC GAMIFIED HUD */}
          {userRole === "student" && renderGamificationDashboard()}

          {/* Dynamic Ad Banner */}
          {userRole === "student" && dbStats?.ads && (
            <AdBanner 
              section={tab} 
              ads={dbStats.ads} 
              onRender={reportAdView} 
            />
          )}
          
          {/* TAB 1: FULL ROADMAP VIEW */}
          {tab === "roadmap" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Map className="text-amber-500" />
                    {lang === "ar" ? "خارطة طريق الطالب في إسبانيا" :
                     lang === "fr" ? "Feuille de Route de l'Étudiant Voyageur" :
                     lang === "es" ? "Hoja de Ruta de Extranjería y Academia" :
                     "Comprehensive Pathway Map"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "الخطوات الكاملة منذ الفكرة وقبول المؤسسة حتى العمل والمنظومة الضريبية" :
                     "Les étapes clés ordonnées de manière séquentielle pour accomplir votre parcours à succès en Espagne."}
                  </p>
                </div>
                <button
                  onClick={() => downloadRoadmapPDF(customRoadmapSteps, lang)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                </button>
              </div>

              {/* Strict Scope Disclaimer */}
              <div className="bg-amber-500/5 border border-amber-500/20 px-4 py-3 rounded-2xl text-xs text-amber-400 leading-relaxed flex items-start gap-2.5 mb-6">
                <AlertTriangle size={18} className="flex-shrink-0 text-amber-500" />
                <div>
                  <strong>{lang === "ar" ? "تنبيه إخلاء مسؤولية قانوني:" : "Information & Avertissement Légal :"}</strong>{" "}
                  {lang === "ar" ? "هذه المعلومات لأغراض إرشادية وتدريبية تم تجميعها من واقع قوانين الهجرة الإسبانية. ننصحك دائماً بمراجعة الموقع الرسمي للخارجية الإسبانية أو مكاتب الهجرة المختصة لكون اللوائح متغيرة على الدوام." :
                   "Ce guide est conçu par notre expert d'IA à des fins éducatives et de consolidation. Il ne remplace en aucun caso les services d'un procureur ou avocat spécialisé. Veuillez consulter les sites officiels (Sede Extranjería/Consulat) pour le suivi légal."}
                </div>
              </div>

              {/* Sequenced Roadmap list */}
              <div className="relative pl-6 border-l border-gray-800 space-y-8 my-4">
                {customRoadmapSteps.map((step, i) => {
                  const stars = profile.xp || 0;
                  const stepNum = i + 1;
                  let isLocked = false;
                  let requiredLevel = 0;
                  let requiredStars = 0;

                  if (stepNum >= 4) {
                    requiredLevel = 2;
                    requiredStars = 300;
                    if (stars < 300) isLocked = true;
                  } else if (stepNum >= 2) {
                    requiredLevel = 1;
                    requiredStars = 100;
                    if (stars < 100) isLocked = true;
                  }

                  if (isLocked) {
                    return (
                      <div key={step.n} className="p-4 bg-gray-900/10 border-2 border-dashed border-gray-800/80 rounded-xl relative opacity-40 select-none text-left">
                        <div className="absolute -left-[37px] top-1.5 w-7 h-7 rounded-full bg-[#1b253b] text-gray-400 border-2 border-gray-800 flex items-center justify-center text-xs font-bold">
                          🔒
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                              🔒 {lang === "ar" ? `الخطوة ${step.n} مغلقة` : `Paso ${step.n} Bloqueado`} (Nivel {requiredLevel})
                            </span>
                            <h4 className="font-bold text-sm text-gray-500 mt-2 leading-relaxed">
                              {t(step)}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {lang === "ar" 
                                ? `يتطلب المستوى ${requiredLevel} (${requiredStars} نجمة ⭐). متبقي لك ${requiredStars - stars} نجمة لفتحه.`
                                : `Requiere Nivel ${requiredLevel} (${requiredStars} ⭐). Te faltan ${requiredStars - stars} estrellas para desbloquear.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const isCompleted = completedSteps.includes(step.n);
                  const toggleStep = () => {
                    if (isCompleted) {
                      setCompletedSteps(prev => prev.filter(item => item !== step.n));
                    } else {
                      setCompletedSteps(prev => [...prev, step.n]);
                      
                      // AWARD STARS action: marking a step as completed awards +15 Stars!
                      awardStars(15, lang === "ar" ? "إتمام خطوة في مسار الهجرة" : "Paso de guía completado");
                    }
                  };

                  return (
                    <div key={step.n} className="relative">
                      {/* Interactive round pointer (Clickable checkoff shortcut) */}
                      <button 
                        onClick={toggleStep}
                        title={isCompleted ? "Marcar como pendiente" : "Marcar como completado"}
                        className={`absolute -left-[37px] top-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border-2 shadow transition-all hover:scale-110 cursor-pointer ${
                          isCompleted 
                            ? 'bg-emerald-500 text-[#070a13] border-emerald-400' 
                            : 'bg-gray-900 text-amber-500 border-amber-500/35 hover:border-amber-400'
                        }`}
                      >
                        {isCompleted ? "✔" : step.n}
                      </button>

                      <div 
                        onClick={toggleStep}
                        className={`p-4 rounded-xl shadow-sm transition-all border cursor-pointer select-none ${
                          isCompleted 
                            ? 'bg-[#0c1a23] border-emerald-550/30' 
                            : 'bg-[#070a13] border-[#1b253b] hover:border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 justify-between">
                          <h4 className={`font-bold text-sm tracking-tight transition-colors ${isCompleted ? 'text-emerald-300' : 'text-gray-100'}`}>
                            {t(step)}
                          </h4>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStep();
                            }}
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                              isCompleted 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700/60'
                            }`}
                          >
                            {isCompleted 
                              ? (lang === "ar" ? "مكتمل ✓" : "Completado ✓") 
                              : (lang === "ar" ? "تحديد كمكتمل" : "Marcar completado")}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{t(step.sub)}</p>
                        
                        <div className="flex gap-1.5 flex-wrap mt-3">
                          {step.tags[lang]?.map((tg, idx) => (
                            <span key={idx} className="bg-gray-800/60 border border-gray-700/50 text-gray-400 text-[10px] px-2 py-0.5 rounded font-mono">
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VISA BY COUNTRY COORDINATOR */}
          {tab === "visa" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl">
              <div className="mb-5 flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe className="text-amber-500" />
                    {lang === "ar" ? "دليل الهجرة ووثائق التأشيرة" : "Visa Etudiant & Consulates de votre Pays"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "حدد بلدك لمعرفة تفاصيل القنصلية والمستندات المطلوبة بدقة" : "Matériel d'inscription requis en fonction de votre nationalité et démarches consulaires."}
                  </p>
                </div>
                <button
                  onClick={() => downloadVisaPDF(customVisaData[visaCountry], visaCountry, lang)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                </button>
              </div>

              {/* Country Tabs select menu */}
              <div className="flex gap-2 flex-wrap bg-[#070a13] p-1 border border-gray-800/80 rounded-2xl mb-6">
                {Object.entries(customVisaData).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setVisaCountry(key)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl focus:outline-none transition-colors ${visaCountry === key ? 'bg-amber-500 text-gray-900 font-bold' : 'text-gray-400 hover:text-white'}`}
                  >
                    {t((value as any).name)}
                  </button>
                ))}
              </div>

              {/* Selected Country Data Panels */}
              {(() => {
                const data = customVisaData[visaCountry] || customVisaData.morocco;
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-[#070a13] border border-blue-500/10 rounded-2xl">
                        <span className="text-[10px] text-blue-400 uppercase tracking-widest font-mono">
                          {lang === "ar" ? "القنصليات والجهات الرسمية المختصة" : "Autorités Consulaires de Référence / Competent Consulates"}
                        </span>
                        <h4 className="font-bold text-white text-xs mt-1.5 leading-relaxed">{t(data.consulate)}</h4>
                      </div>
                    </div>

                    <div className="border-t border-gray-800 pt-5">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckSquare size={14} className="text-amber-500" />
                        {lang === "ar" ? "الوثائق الإلزامية في الملف" : "Dossier légal requis (Pièces Obligatoires)"}
                      </h3>

                      <div className="space-y-4">
                        {data.docs.map((doc, idx) => (
                          <div key={idx} className="bg-[#070a13] border border-[#1b253b] p-4 rounded-xl flex items-start gap-3 hover:border-amber-500/25 transition-all">
                            <span className="bg-amber-500/10 text-amber-400 text-xs font-bold h-6 w-6 rounded-lg flex items-center justify-center shrink-0">
                              {idx+1}
                            </span>
                            <div>
                              <h5 className="font-bold text-xs text-white leading-tight">{t(doc.n)}</h5>
                              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{t(doc.desc)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro tip */}
                    <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl text-xs text-blue-400 leading-relaxed flex items-start gap-2.5">
                      <Volume2 size={16} className="shrink-0 text-blue-400 mt-0.5" />
                      <div>
                        <strong>💡 {lang === "ar" ? "نصيحة هامة بخصوص التمويل:" : "Règle absolue des caisses de devises :"}</strong>{" "}
                        {lang === "ar" ? "تطلب السلطات الإسبانية إيداعات كافية تساوي مؤشر IPREM (حالياً حوالي 600 يورو شهرياً). يُفضل تفعيل كفالة الأب أو الأم بتقديم كشف حساب مصرفي يغطي آخر 6 أشهر مع ترجمة الضمان المالي." :
                         "L'IPREM espagnol exige au minimum 600€ par mois pour les étudiants. Pour renforcer votre demande, joignez les relevés bancaires d'un garant direct couvrant 6 mois."}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: STUDY PROGRAMS EXPLORER */}
          {tab === "formations" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl">
              <div className="mb-5 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-amber-500" />
                    {lang === "ar" ? "استكشاف البرامج الدراسية وتكاليفها" : "Formations & Programmes Pratiques"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "تفاصيل التكوين المهني والجامعات من حيث القبول والآفاق المهنية" : "Consultez les conditions requises pour chaque niveau : conditions de diplôme ou bourses."}
                  </p>
                </div>
                <button
                  onClick={() => downloadFormationsPDF(customFormations[formationTab]?.families || [], formationsSearch, selectedSpecialty, lang)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(customFormations).map(key => {
                    const stars = profile.xp || 0;
                    let isLockedTab = false;
                    if (key === "universidad" || key === "master") {
                      isLockedTab = stars < 1500;
                    } else if (key === "doctorado") {
                      isLockedTab = stars < 3000;
                    }
                    return (
                      <button
                        key={key}
                        onClick={() => setFormationTab(key)}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl focus:outline-none transition-colors flex items-center gap-1.5 ${formationTab === key ? 'bg-amber-500 text-gray-900 font-bold' : 'text-gray-400 hover:text-white bg-gray-800/40'}`}
                      >
                        <span>{t(customFormations[key])}</span>
                        {isLockedTab && <span className="text-[10px] text-amber-500">🔒</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="relative max-w-xs w-full">
                  <input 
                    type="text" 
                    placeholder={
                      lang === "ar" ? "ابحث عن قسيمة أو تخصص..." :
                      lang === "es" ? "Buscar especialidad o salida..." :
                      lang === "en" ? "Search specialty or career..." :
                      "Rechercher une spécialité..."
                    }
                    value={formationsSearch}
                    onChange={(e) => setFormationsSearch(e.target.value)}
                    className="w-full bg-[#070a13] border border-gray-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white outline-none focus:border-amber-500 transition-colors"
                  />
                  <span className="absolute left-3 top-2 text-gray-500 text-xs">🔍</span>
                </div>
              </div>

              {(() => {
                const f = customFormations[formationTab];
                const stars = profile.xp || 0;
                let isLocked = false;
                let requiredStars = 0;
                let requiredLevel = 0;

                if (formationTab === "universidad" || formationTab === "master") {
                  requiredStars = 1500;
                  requiredLevel = 4;
                  if (stars < 1500) isLocked = true;
                } else if (formationTab === "doctorado") {
                  requiredStars = 3000;
                  requiredLevel = 5;
                  if (stars < 3000) isLocked = true;
                }

                if (isLocked) {
                  return (
                    <div className="bg-[#070a13] border-2 border-dashed border-amber-500/25 p-12 rounded-2xl text-center space-y-5 my-4 animate-fadeIn text-left">
                      <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                        🔒
                      </div>
                      <div className="space-y-1.5 text-center">
                        <h3 className="text-base font-black text-white">
                          {lang === "ar" ? `هذا البرنامج مغلق` : `Programa Académico Bloqueado`}
                        </h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed text-center">
                          {lang === "ar"
                            ? `الولوج لمعلومات الجامعات والماسترات والدكتوراه يتطلب مستوى ${requiredLevel} ورصيد لا يقل عن ${requiredStars} نجمة ⭐ لفتح معلومات الشعبة بدقة.`
                            : `El acceso a programas universitarios, másteres y doctorados requiere la Etapa ${requiredLevel} (${requiredStars} estrellas ⭐) del portal.`}
                        </p>
                      </div>
                      
                      <div className="p-3.5 bg-amber-500/5 rounded-xl border border-[#1b253b] max-w-xs mx-auto text-center font-mono text-xs">
                        <span className="text-gray-400 block text-[10px] uppercase">Rango Actual:</span>
                        <strong className="text-amber-400 text-sm font-black">{stars} Nujum ⭐</strong>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Faltan <strong className="text-white bg-amber-500/10 px-1.5 py-0.5 rounded">{requiredStars - stars}</strong> estrellas para abrir esta categoría.
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormationTab("fp_medio")}
                          className="px-4 py-1.5 bg-[#121c33] border border-gray-800 text-white font-bold text-xs rounded-xl hover:bg-[#1a2d4f] cursor-pointer"
                        >
                          {lang === "ar" ? "تصفح التكوين المهني (مفتوح)" : "Ver Formación FP (Abierta)"}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* General Meta card */}
                    <div className="p-5 bg-[#070a13] border border-[#1b253b] rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{f.tag} Category</span>
                        <h3 className="text-base font-bold text-white mt-1.5">{t(f)}</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-md">
                          {lang === "ar" ? "مسارات منسقة للمواءمة مع متطلبات سوق العمل المحلي الإسباني" : "Diplômes hautement appréciés par les entreprises ibériques."}
                        </p>
                      </div>
                      <div className="space-y-1.5 shrink-0 text-left md:text-right font-mono text-xs">
                        <div>
                          <span className="text-gray-500 uppercase mr-2">{lang === "ar" ? "المدة:" : lang === "fr" ? "Durée:" : "Duración:"}</span> 
                          <span className="text-white font-bold">{t(f.duration)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Entry standards */}
                    <div className="p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
                      <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3">
                        {lang === "ar" ? "شروط التسجيل والقبول الإلزامية:" : "Conditions réglementaires pour postuler :"}
                      </h4>
                      <ul className="space-y-2">
                        {f.access.map((acc, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">✔</span>
                            <span>{acc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {f.note && (
                      <div className="bg-amber-500/5 text-amber-400 border border-amber-500/20 p-4 rounded-xl text-xs">
                        <strong>💡 Highlight:</strong> {t(f.note)}
                      </div>
                    )}

                    {/* Available branches and jobs */}
                    {f.families && (() => {
                      const filteredFamilies = f.families.filter(fam => {
                        const s = formationsSearch.toLowerCase();
                        const nameMatch = t(fam.name).toLowerCase().includes(s);
                        const salidasMatch = fam.salidas[lang]?.some(sal => sal.toLowerCase().includes(s)) || false;
                        return nameMatch || salidasMatch;
                      });

                      if (filteredFamilies.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500 text-xs border border-[#1b253b] border-dashed rounded-2xl bg-[#070a13]/50">
                            {lang === "ar" ? "لم يتم العثور على تخصصات تطابق بحثك." : 
                             lang === "es" ? "No se encontraron especialidades que coincidan con tu búsqueda." : 
                             lang === "en" ? "No specialties found matching your search." :
                             "Aucune spécialité ne correspond à votre recherche."}
                          </div>
                        );
                      }

                      return (
                        <div>
                          <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-4 font-sans">
                            {lang === "ar" ? "العائلات المهنية المتاحة وآفاق العمل:" :
                             lang === "es" ? "Especialidades Recomendadas y Salidas Profesionales:" :
                             lang === "en" ? "Recommended Specialties & Career Prospects:" :
                             "Spécialités Majeures Recommandées & Débouchés :"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredFamilies.map((fam, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setSelectedSpecialty(fam)}
                                className="bg-[#070a13] border border-[#1b253b] hover:border-amber-500/40 p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 group"
                              >
                                <div>
                                  <h5 className="font-bold text-xs text-white mb-3 tracking-tight border-b border-gray-800 pb-2 group-hover:text-amber-300 transition-colors">{t(fam.name)}</h5>
                                  <div className="space-y-2">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                                      {lang === "ar" ? "الوظائف والفرص:" :
                                       lang === "es" ? "Puestos y salidas:" :
                                       lang === "en" ? "Careers & profiles:" :
                                       "Métiers & Profils :"}
                                    </span>
                                    <div className="flex gap-1.5 flex-wrap">
                                      {fam.salidas[lang]?.map((sal, sIdx) => {
                                        const isHighlighted = formationsSearch && sal.toLowerCase().includes(formationsSearch.toLowerCase());
                                        return (
                                          <span key={sIdx} className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                                            isHighlighted 
                                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-medium' 
                                              : 'bg-gray-800 border-gray-700/60 text-gray-300 group-hover:border-gray-600/80'
                                          }`}>
                                            {sal}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-800/60 flex justify-between items-center text-[10px] text-amber-500/80 group-hover:text-amber-400 font-medium transition-colors">
                                  <span>
                                    {lang === "ar" ? "اضغط لعرض ما يدرس بالتفصيل ➔" :
                                     lang === "es" ? "Ver detalles y asignaturas ➔" :
                                     lang === "en" ? "View curriculum & modules ➔" :
                                     "Voir les matières enseignées ➔"}
                                  </span>
                                  <span className="text-xs">✦</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}

              {/* 100-QUESTION FUN CAREER PATH QUIZ */}
              <div id="career-quiz-section" className="mt-8 pt-8 border-t border-[#1b253b] space-y-6">
                {!quizActive ? (
                  // START INVITATION CARD
                  <div className="bg-gradient-to-br from-[#0c1222] to-[#12192b] border-2 border-dashed border-amber-500/20 p-6 rounded-2xl text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-xl text-amber-400 animate-pulse">
                      🎯
                    </div>
                    <div className="max-w-xl mx-auto space-y-2">
                      <h3 className="text-lg font-bold text-white">
                        {lang === "ar" ? "🎯 اختبار التوجيه المهني الكبير (100 سؤال) لإسبانيا" : 
                         lang === "fr" ? "🎯 Le Grand Test d'Orientation Pro (100 Questions) - Espagne" :
                         lang === "es" ? "🎯 El Gran Test de Orientación de 100 Preguntas en España" :
                         "🎯 The Great 100-Question Orientation Test for Spain"}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans">
                        {lang === "ar" ? "أجب عن اختبار مرح وتفاعلي من 100 سؤال قصير ومدروس يقيس مهاراتك وميولك، لتحديد التخصص المهني أو رخصة العمل في إسبانيا التي تلائمك مع توضيح كامل لآفاق العمل والرواتب." :
                         lang === "fr" ? "Répondez à un test amusant de 100 questions rapides pour évaluer vos affinités professionnelles et découvrir quelle formation, licence ou diplôme réglementé espagnol correspond le mieux à vos talents." :
                         lang === "es" ? "Participa en un divertido test interactivo de exactamente 100 preguntas sobre tus intereses. Determina qué formación profesional, grado de licencia comercial o sector laboral en España se adapta mejor a tu personalidad y salidas comerciales." :
                         "Participate in a fun interactive test of exactly 100 questions. Determine which Spanish professional training, commercial licenses, or career fields match your skills and job market prospects."}
                      </p>
                    </div>

                    {/* CONFORT / PRIVACIDAD BANNER GENERAL DE SEGURIDAD CONTRA PREGUNTAS INDESEADAS */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-left max-w-xl mx-auto space-y-1">
                      <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                        🛡️ {lang === "ar" ? "التزام بالراحة والخصوصية التامة:" : 
                             lang === "fr" ? "Confidentialité & Confort de l'Apprenant :" : 
                             "Garantía de Respeto, Comodidad y Privacidad:"}
                      </p>
                      <p className="text-[10px] text-gray-300 leading-normal font-sans">
                        {lang === "ar" ? "جميع أسئلة هذا الاختبار مهنية وأكاديمية ومصممة لمساعدتك على التوجيه بامتياز. نلتزم التزاماً صارماً بتجنب أي أسئلة شخصية، محرجة، غير ملائمة أو غير مريحة للمستخدم." :
                         lang === "fr" ? "Toutes les questions sont purement orientatives, académiques et neutres. Nous interdisons toute question indiscrète, personnelle ou inconfortable afin de vous garantir une expérience sereine." :
                         "Todas las preguntas de este test son estrictamente de carácter educativo, profesional y orientativo. No recopilamos datos sensibles ni formulamos preguntas de índole privada, incómoda o personal."}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setQuizActive(true);
                        setQuizIndex(0);
                        setQuizAnswers(Array(100).fill(-1));
                      }}
                      className="px-6 py-3 bg-amber-500 text-gray-950 font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-amber-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg cursor-pointer inline-block"
                    >
                      🚀 {lang === "ar" ? "ابدأ اختبار التوجيه للتكوين والعمل" : "¡Empezar Test de Orientación!"}
                    </button>
                  </div>
                ) : quizIndex < 100 ? (
                  // ACTIVE QUESTION RUNNER
                  (() => {
                    const qObj = HUNDRED_QUESTIONS[quizIndex];
                    const progressVal = Math.round(((quizIndex) / 100) * 100);
                    const completedCount = quizAnswers.filter(a => a !== -1).length;
                    
                    return (
                      <div className="bg-[#070a13] border border-[#1b253b] p-6 rounded-2xl space-y-5 relative overflow-hidden">
                        {/* Elegant Progress header */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-gray-500 uppercase tracking-widest text-[9px]">
                            {lang === "ar" ? `قسم: ${qObj.category.toUpperCase()}` : `SECCIÓN DE INTERÉS: ${qObj.category.toUpperCase()}`}
                          </span>
                          <span className="font-mono font-bold text-amber-400">
                            {lang === "ar" ? `${quizIndex + 1} / 100 سؤال` : `Pregunta ${quizIndex + 1} de 100`}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-350"
                            style={{ width: `${progressVal}%` }}
                          />
                        </div>

                        {/* Display Question Box */}
                        <div className="bg-[#0c1222] border border-gray-800 p-6 rounded-2xl text-center min-h-[100px] flex items-center justify-center animate-fade-in">
                          <p className="text-sm md:text-base font-bold text-white tracking-wide leading-relaxed select-none">
                            {lang === "ar" ? qObj.ar : lang === "fr" ? qObj.fr : lang === "en" ? qObj.en : qObj.es}
                          </p>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => {
                              const newAns = [...quizAnswers];
                              newAns[quizIndex] = 5; // HIGHLY AGREE
                              setQuizAnswers(newAns);
                              setQuizIndex(prev => prev + 1);
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-350 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                          >
                            🟢 {lang === "ar" ? "نعم، أوافق بشدة" : lang === "fr" ? "Oui, totalement d'accord" : "Sí, totalmente de acuerdo"}
                          </button>

                          <button
                            onClick={() => {
                              const newAns = [...quizAnswers];
                              newAns[quizIndex] = 2; // NEUTRAL
                              setQuizAnswers(newAns);
                              setQuizIndex(prev => prev + 1);
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                          >
                            🟡 {lang === "ar" ? "محايد / أحياناً" : lang === "fr" ? "Neutre / Parfois" : "Neutro / A veces"}
                          </button>

                          <button
                            onClick={() => {
                              const newAns = [...quizAnswers];
                              newAns[quizIndex] = 0; // DISAGREE
                              setQuizAnswers(newAns);
                              setQuizIndex(prev => prev + 1);
                            }}
                            className="flex-1 py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-350 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                          >
                            🔴 {lang === "ar" ? "لا، لا أوافق أبداً" : lang === "fr" ? "Pas d'accord" : "No, en absoluto"}
                          </button>
                        </div>

                        {/* Extra controls footer */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-800 text-[10px] text-gray-500 font-sans">
                          <button
                            disabled={quizIndex === 0}
                            onClick={() => setQuizIndex(prev => Math.max(0, prev - 1))}
                            className="flex items-center gap-1 hover:text-white disabled:opacity-40 disabled:hover:text-gray-500 transition-colors"
                          >
                            ← {lang === "ar" ? "السابق" : "Anterior / Back"}
                          </button>

                          <button
                            onClick={() => {
                              // Auto responds randomly to remaining questions to let them inspect end report
                              const filled = quizAnswers.map((val, idx) => {
                                if (idx < quizIndex) return val;
                                // Randomly 5, 2 or 0
                                const arr = [0, 2, 5];
                                return arr[Math.floor(Math.random() * arr.length)];
                              });
                              setQuizAnswers(filled);
                              setQuizIndex(100);
                            }}
                            className="text-amber-500/80 hover:text-amber-400 font-mono underline"
                          >
                            ⚡ {lang === "ar" ? "تعبئة تلقائية سريعة للاختبار (معاينة)" : "Rellenar respuestas restantes (Simular)"}
                          </button>

                          <button
                            onClick={() => {
                              setQuizActive(false);
                            }}
                            className="hover:text-rose-400 font-medium"
                          >
                            ❌ {lang === "ar" ? "إلغاء وجدول" : "Cancelar / Reset"}
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // QUIZ CONCLUDED - DETAILED DASHBOARD REPORT
                  (() => {
                    let tech = 0, health = 0, business = 0, hospitality = 0, creative = 0;
                    HUNDRED_QUESTIONS.forEach((q, idx) => {
                      const uAns = quizAnswers[idx];
                      if (uAns > 0) {
                        if (q.category === "tech") tech += uAns;
                        else if (q.category === "health") health += uAns;
                        else if (q.category === "business") business += uAns;
                        else if (q.category === "hospitality") hospitality += uAns;
                        else if (q.category === "creative") creative += uAns;
                      }
                    });

                    // Calculated points max = 20 * 5 = 100 percentage.
                    const scores = [
                      { key: "tech" as const, val: tech, label: CAREER_CATEGORIES.tech, color: "from-blue-600 to-indigo-500", textCol: "text-blue-400" },
                      { key: "health" as const, val: health, label: CAREER_CATEGORIES.health, color: "from-emerald-600 to-green-500", textCol: "text-emerald-400" },
                      { key: "business" as const, val: business, label: CAREER_CATEGORIES.business, color: "from-amber-600 to-orange-500", textCol: "text-amber-400" },
                      { key: "hospitality" as const, val: hospitality, label: CAREER_CATEGORIES.hospitality, color: "from-rose-600 to-red-500", textCol: "text-rose-400" },
                      { key: "creative" as const, val: creative, label: CAREER_CATEGORIES.creative, color: "from-purple-600 to-pink-500", textCol: "text-purple-400" }
                    ];

                    // Sort to find dominating career profile
                    const sortedScores = [...scores].sort((a, b) => b.val - a.val);
                    const best = sortedScores[0];

                    return (
                      <div className="bg-[#070a13] border-2 border-emerald-500/20 p-6 rounded-2xl space-y-6">
                        {/* Certificate ribbon header */}
                        <div className="text-center space-y-2">
                          <span className="inline-block text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest font-mono font-bold">
                            🎓 {lang === "ar" ? "تقرير التوجيه المهني الشامل" : "Informe de Aptitud Académica & Salidas"}
                          </span>
                          <h3 className="text-xl font-bold text-white leading-tight">
                            {lang === "ar" ? "🏆 ملفك المهني السائد والموصى به في إسبانيا" : "🏆 Tu Perfil Vocacional Recomendado para España"}
                          </h3>
                        </div>

                        {/* Heavy-weight focal card */}
                        <div className="bg-[#0c1222] border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden space-y-2.5">
                          <div className="absolute right-0 top-0 text-[100px] leading-none text-emerald-500/5 select-none font-extrabold pr-2 pt-1 font-mono">
                            {best.val}%
                          </div>
                          
                          <h4 className="text-emerald-400 font-extrabold font-sans text-base">
                            {lang === "ar" ? best.label[lang] : best.label.es}
                          </h4>
                          
                          <div className="inline-block bg-white/5 border border-white/10 text-white rounded-lg px-2.5 py-1 text-[11px] font-mono leading-none">
                            🎯 {best.label.recommendation.title}
                          </div>

                          <p className="text-xs text-gray-300 leading-relaxed font-sans pt-1">
                            {lang === "ar" ? best.label.recommendation[lang] : 
                             lang === "fr" ? best.label.recommendation.fr : 
                             lang === "en" ? best.label.recommendation.en : 
                             best.label.recommendation.es}
                          </p>
                        </div>

                        {/* Category points breakdown */}
                        <div className="space-y-3.5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">
                            {lang === "ar" ? "توزيع نقاط التوافق حسب كل عائلة مهنية (100% كحد أقصى):" : "Desglose de Compatibilidad por Categorías:"}
                          </h4>

                          <div className="space-y-3 font-sans">
                            {scores.map((s, idx) => {
                              const isTop = s.key === best.key;
                              return (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className={`${isTop ? "text-white font-bold" : "text-gray-400"} flex items-center gap-1.5`}>
                                      {isTop ? "⭐" : "•"} {lang === "ar" ? s.label[lang] : s.label.es}
                                    </span>
                                    <span className={`font-mono font-bold ${s.textCol}`}>{s.val}%</span>
                                  </div>
                                  <div className="w-full bg-gray-900 h-2.5 rounded-full overflow-hidden border border-gray-800">
                                    <div 
                                      className={`bg-gradient-to-r ${s.color} h-full rounded-full transition-all duration-500`}
                                      style={{ width: `${s.val}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Retake test action */}
                        <div className="pt-4 border-t border-gray-800 flex justify-center">
                          <button
                            onClick={() => {
                              setQuizAnswers(Array(100).fill(-1));
                              setQuizIndex(0);
                              setQuizActive(true);
                            }}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            🔄 {lang === "ar" ? "إعادة تشغيل الاختبار من جديد" : "Repetir el Test Vocacional"}
                          </button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CITY TRANSPORT SYSTEM */}
          {tab === "transport" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl">
              <div className="mb-5 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Train className="text-amber-500" />
                    {lang === "ar" ? "بطاقات النقل المخفضة للطلاب" : "Tarification Joven & Cartes Mensuelles de Métro"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "تأمين التنقل بأقل تكلفة للطلاب دون سن 26 أو 30 عاماً" : "Toutes les offres de transports publics adaptées aux budgets étudiants."}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input 
                    type="text" 
                    placeholder="Filtrer par ville..."
                    value={transportSearch}
                    onChange={(e) => setTransportSearch(e.target.value)}
                    className="bg-[#070a13] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500 max-w-[160px]"
                  />
                  <button
                    onClick={() => downloadTransportPDF(customTransport, transportSearch, lang)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📄</span>
                    <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customTransport
                  .filter(tItem => tItem.city.toLowerCase().includes(transportSearch.toLowerCase()))
                  .map((tItem, idx) => (
                    <div key={idx} className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-base mt-1">{tItem.city} — {tItem.card}</h4>
                        </div>
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold">
                          {tItem.age}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans">{t(tItem.cover)}</p>

                      <div className="border-t border-gray-800/80 pt-3 space-y-1.5">
                        <span className="text-[10px] text-gray-500 uppercase font-mono">Comment postuler / Requis :</span>
                        <p className="text-xs text-gray-300 leading-relaxed">{t(tItem.apply)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: HOUSING PORTAL */}
          {tab === "logement" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl">
              <div className="mb-5 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Home className="text-amber-500" />
                    {lang === "ar" ? "دليل السكن والعيش الآمن" : "Logement & Locations en Espagne - Éviter les Estafas"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "اعثر على سكن بدون غش مع إرشادات التأكد من صحة العروض" : "Trouvez votre logement étudiant en évitant impérativement les arnaques."}
                  </p>
                </div>
                <button
                  onClick={() => downloadHousingPDF(customHousing, lang)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {customHousing.map((l, index) => (
                  <div key={index} className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 hover:border-amber-500/30 transition-all">
                    <div className="space-y-1.5">
                      <span className="bg-amber-500/5 text-amber-400 border border-amber-500/20 text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                        {t(l.type)}
                      </span>
                      <h4 className="font-bold text-white text-sm">{t(l.name)}</h4>
                      <p className="text-xs text-gray-400 max-w-xl leading-relaxed">{t(l.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* DIRECT PLATFORMS SECTION (Idealista, Fotocasa) */}
              <div className="bg-[#070a13] border border-[#1b253b] p-6 rounded-2xl mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Globe size={18} className="text-amber-500 animate-pulse" />
                    {lang === "ar" ? "منصات البحث المباشر عن الإيجار المعتمدة:" : "Plataformas de Alquiler en España (Idealista & Fotocasa)"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "روابط مباشرة لشاشات الطلبة وشرح تفصيلي لطريقة الاستخدام الصحيحة:" : "Accédez directement aux sites officiels et découvrez comment maximiser vos chances."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Idealista Button Link */}
                  <a 
                    href="https://www.idealista.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-4 bg-[#0c1222] border border-[#1b253b] hover:border-amber-500/40 rounded-xl group transition-all"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider block">Estancia & Pisos</span>
                      <h4 className="text-white font-bold text-sm flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                        Idealista.com 🔗
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        {lang === "ar" ? "المنصة الكبرى رقم 1 في إسبانيا للبحث عن غرف وشقق مشتركة." : "Le portail n°1 en Espagne pour chercher des chambres (pisos compartidos)."}
                      </p>
                    </div>
                  </a>

                  {/* Fotocasa Button Link */}
                  <a 
                    href="https://www.fotocasa.es/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-4 bg-[#0c1222] border border-[#1b253b] hover:border-amber-500/40 rounded-xl group transition-all"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider block">Alquiler & Habitaciones</span>
                      <h4 className="text-white font-bold text-sm flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                        Fotocasa.es 🔗
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-tight">
                        {lang === "ar" ? "خدمة متميزة وفلاتر بالغة الدقة للحي ونطاق الميزانية المحددة." : "Filtres avancés par quartier et budget idéal pour colocations."}
                      </p>
                    </div>
                  </a>
                </div>

                {/* HOW THEY WORK / CÓMO FUNCIONAN */}
                <div className="border-t border-[#1b253b] pt-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                    {lang === "ar" ? "كيف تعمل المنصات وتضمن قبول طلبك؟" : "¿Cómo funcionan estas plataformas y cómo buscar con éxito?"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300 leading-relaxed font-sans">
                    <div className="space-y-2 bg-[#0c1222]/40 p-3 rounded-lg border border-gray-800/45">
                      <p>
                        <strong>1. {lang === "ar" ? "تفعيل التنبيهات الفورية (Alertas):" : "Alertes instantanées :"}</strong>{" "}
                        {lang === "ar" ? "الغرف الجيدة تؤجر خلال ساعات قليلة. يجب تفعيل فلتر التنبيهات على البريد/الهاتف لتلقي تنبيه للمنشور فور صدوره والاتصال فورًا." : 
                         "Les meilleures chambres partent en quelques heures. Activez impérativement les alertes de recherche pour être informé à la minute de tout nouveau bien."}
                      </p>
                      <p>
                        <strong>2. {lang === "ar" ? "الاتصال الهatفي المباشر أفضل:" : "Contacter par Téléphone direct :"}</strong>{" "}
                        {lang === "ar" ? "يفضل دائمًا الاتصال الهاتفي السريع على الرقم المعلن عوضًا عن البريد الإلكتروني التقليدي للحصول على رد سريع." : 
                         "Privilégiez los llamadas directas desde que un número es visible, eso asegura una respuesta más rápida para reservar visita."}
                      </p>
                    </div>
                    <div className="space-y-2 bg-[#0c1222]/40 p-3 rounded-lg border border-gray-800/45">
                      <p>
                        <strong>3. {lang === "ar" ? "تجهيز ملف الملاءة (Solvencia):" : "Dossier de solvabilité :"}</strong>{" "}
                        {lang === "ar" ? "أعد مسبقًا نسخة من قبولك الجامعي، كشكل لإيجار تأمين الوالدين أو كشوف البنك لتسليمها فورًا قبل قيام غيرك بحجزها." : 
                         "Préparez à l'avance vos documents d'inscription étudiante, preuve de bourse ou garanties financières de vos parents pour rassurer le loueur."}
                      </p>
                      <p>
                        <strong>4. {lang === "ar" ? "عقد الإقامة المكتوب (Contrato):" : "Contrat de location :"}</strong>{" "}
                        {lang === "ar" ? "لا يكتمل الحجز إلا بنموذج عقد محكم يذكر فواصل الوديعة (Fianza) لتتمكن من استخدام العقد في التسجيل البلدي (Empadronamiento)." : 
                         "Exigez toujours un contrat écrit détaillé qui liste le montant de la caution (fianza), nécessaire pour vos démarches administratives."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security and scams warning */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl mt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  {lang === "ar" ? "التحقق من صحة الإعلانات ومنع الاحتيال:" : 
                   lang === "fr" ? "Vérification de l'Annonce et Prévention des Arnaques :" : 
                   lang === "es" ? "Veracidad del Anuncio y Prevención de Estafas:" : 
                   "Listing Verification & Scam Prevention:"}
                </h4>
                <p className="text-xs text-gray-350 leading-relaxed font-sans">
                  {lang === "ar" ? "يجب على جميع الطلاب التحقق دائمًا وبشكل مباشر من حقيقة الإيجار ووجود العقار على أرض الواقع قبل دفع أي عمولات أو مبالغ مالية لتفادي النصب العقاري الشائع إلكترونيًا." :
                   lang === "fr" ? "Il est impératif de toujours vérifier minutieusement la véracité des offres de logement en effectuant des visites réelles sur place avant d'effectuer le moindre virement financier." :
                   lang === "es" ? "Es obligatorio para todos los estudiantes averiguar siempre la veracidad de cualquier anuncio de alquiler de forma exhaustiva para evitar estafas. Nunca transfieras dinero sin verificar antes en persona o contratar con agencias consolidadas." :
                   "Every student must always verify the actual truthfulness and legitimacy of any housing advertisement in person before making any deposits or signing contracts."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: COMPLETE SPANISH COURSE & VOCAB MANUAL */}
          {tab === "ebook" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl">
              
              {/* HEADER CAPTIONS WITH CEFR INDICATORS */}
              <div className="flex justify-between items-start flex-wrap gap-3 mb-6 border-b border-gray-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                    <BookOpen className="text-amber-500 animate-pulse" />
                    {lang === "ar" ? "كتاب الإسبانية الشامل (A1←C2)" : "Manuel d'Espagnol Certifié (Cadre Européen)"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "دروس تفاعلية، نطق صوتي أصلي ومفردات أكاديمية تخدم ملف دراستك" : "300 chapitres interactifs et vocabulaire pratique avec examens réguliers."}
                  </p>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <div className="bg-[#070a13] border border-gray-800/80 p-0.5 rounded-xl flex gap-1">
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => {
                          setSelectedLevel(lvl);
                          setCurrentPage(getMinPage(lvl));
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-transform focus:outline-none ${selectedLevel === lvl ? 'bg-amber-500 text-[#070a13] scale-105' : 'text-gray-400 hover:text-white'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setExamActive(true);
                      setExamData(null);
                    }}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-transform active:scale-95 flex items-center gap-1.5 shadow-lg border border-blue-500/30"
                  >
                    <Award size={13} />
                    {lang === "ar" ? "اختبارات الترقية (30 امتحان)" : "Examens de Niveau (30 Tests)"}
                  </button>
                </div>
              </div>

              {(() => {
                const getRequiredStarsForLevel = (lvl: string) => {
                  const map: Record<string, number> = { A1: 0, A2: 100, B1: 300, B2: 700, C1: 1500, C2: 3000 };
                  return map[lvl] ?? 0;
                };
                const getLevelNameArabic = (lvl: string) => {
                  const map: Record<string, string> = { A1: "الطالب المبتدئ", A2: "المستكشف (Explorador)", B1: "المسافر (Viajero)", B2: "الطالب (Estudiante)", C1: "المتقدم (Avanzado)", C2: "الخبير (Experto)" };
                  return map[lvl] ?? "";
                };
                const getLevelNameSpanish = (lvl: string) => {
                  const map: Record<string, string> = { A1: "El Principiante", A2: "El Explorador", B1: "El Viajero", B2: "El Estudiante", C1: "El Avanzado", C2: "El Experto" };
                  return map[lvl] ?? "";
                };

                const stars = profile.xp || 0;
                const required = getRequiredStarsForLevel(selectedLevel);

                if (stars < required) {
                  return (
                    <div className="bg-[#070a13] border-2 border-dashed border-amber-500/30 p-10 rounded-3xl text-center space-y-6 my-6 animate-fadeIn">
                      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                        🔒
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-white">
                          {lang === "ar" ? "مستوى لغوي مغلق" : "Etapa Lingüística Bloqueada"}
                        </h3>
                        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                          {lang === "ar"
                            ? `المستوى ${selectedLevel} يتطلب رتبة "${getLevelNameArabic(selectedLevel)}" وجمع ما لا يقل عن ${required} نجمة ⭐ لفتحه.`
                            : `El nivel de español ${selectedLevel} requiere el rango "${getLevelNameSpanish(selectedLevel)}" y acumular al menos ${required} estrellas ⭐.`}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-amber-500/5 rounded-2xl border border-[#1b253b] max-w-sm mx-auto font-mono text-xs">
                        <span className="text-gray-400">Tu balance actual:</span>{" "}
                        <strong className="text-amber-400 text-sm font-black">{stars} Estrellas ⭐</strong>
                        <div className="mt-1 text-[10px] text-gray-500 font-sans">
                          Faltan <strong className="text-white bg-amber-500/10 px-1.5 py-0.5 rounded">{required - stars}</strong> estrellas para desbloquear.
                        </div>
                      </div>

                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => { setSelectedLevel("A1"); setCurrentPage(1); setExamActive(false); }}
                          className="px-4 py-2 bg-[#121c33] hover:bg-[#1c2e4f] border border-gray-800 hover:border-gray-750 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          {lang === "ar" ? "العودة للمستوى A1 (مفتوح)" : "Ir al nivel A1 (Desbloqueado)"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTab("roadmap")}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#0c1222] font-black text-xs rounded-xl shadow-md transition cursor-pointer animate-pulse"
                        >
                          {lang === "ar" ? "اكتسب النجوم" : "Ganar Estrellas"}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <>

              {/* BOOK PAGINATION NAVIGATOR */}
              {!examActive && (
                <div className="bg-[#070a13] border border-gray-800 p-3 rounded-2xl flex items-center justify-between mb-6 shadow-sm">
                  <button
                    disabled={currentPage <= getMinPage(selectedLevel)}
                    value="prev-page"
                    onClick={() => setCurrentPage(prev => Math.max(getMinPage(selectedLevel), prev - 1))}
                    className="bg-[#1c2438] hover:bg-gray-800 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    {lang === "ar" ? "السابق" : "Précédent"}
                  </button>

                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest text-center px-2">
                    📖 Pg {currentPage} / 300 · Level {selectedLevel} Topic: {getTopic(selectedLevel, currentPage)}
                  </span>

                  <button
                    disabled={currentPage >= getMaxPage(selectedLevel)}
                    value="next-page"
                    onClick={() => setCurrentPage(prev => Math.min(getMaxPage(selectedLevel), prev + 1))}
                    className="bg-[#1c2438] hover:bg-gray-800 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    {lang === "ar" ? "التالي" : "Suivant"}
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* ACTIVE EXAMINATION LAYOUT */}
              {examActive ? (
                <div className="space-y-6 animate-fadeIn">
                  {loadingExam ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-gray-400 animate-pulse font-sans font-bold">
                        {lang === "ar" ? `جاري إعداد وتخصيص النموذج ${selectedExamId} من 30 في مستوى ${selectedLevel} عبر الذكاء الاصطناعي...` : `Génération de la version ${selectedExamId} sur 30 du test de niveau ${selectedLevel}...`}
                      </p>
                    </div>
                  ) : !examData ? (
                    /* SELECTOR SCREEN FOR 30 DIFFERENT EXAMS */
                    <div className="bg-[#070a13] border border-[#1b253b] p-6 rounded-2xl space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                        <div>
                          <span className="text-[10px] tracking-widest font-mono text-blue-400 block uppercase font-bold">
                            {lang === "ar" ? "مقياس الاختيار المطور من SIELE" : "Centre d'Évaluation Officielle SIELE"}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-1">
                            {lang === "ar" ? `الامتحانات الثلاثون لترقية مستوى ${selectedLevel}` : `Les 30 Examens de Niveau ${selectedLevel}`}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExamActive(false)}
                          className="text-gray-400 hover:text-white text-xs border border-gray-800 px-3.5 py-1.5 rounded-xl transition-all font-bold"
                        >
                          {lang === "ar" ? "العودة للدروس" : "Retour aux leçons"}
                        </button>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl leading-relaxed text-xs text-gray-300 font-sans space-y-2">
                        <p>
                          🎯 <strong>{lang === "ar" ? "قاعدة التقدم والتخرج الأكاديمي:" : "Règle de progression académique :"}</strong>{" "}
                          {lang === "ar" ? `لكل مستوى - CEFR - ستجد 30 نموذج امتحان مختلف (كل نموذج يضم 40 سؤالاً progressive). تحتاج إلى اجتياز نموذج واحد فقط بنجاح (بنسبة 60% أي 24/40) لترقية مستواك تلقائياً لـ :` : 
                           `Chaque niveau CEFR propose 30 versions d'examens strictement différentes de 40 questions chacune. Il vous suffit de réussir un seul des 30 examens (note ≥ 60%, soit 24/40) pour débloquer automatiquement le niveau :`}
                          {" "}
                          <span className="bg-emerald-500 text-gray-950 px-2 py-0.5 rounded font-black font-mono inline-block text-[11px] ml-1">
                            {selectedLevel === "A1" ? "A2" : selectedLevel === "A2" ? "B1" : selectedLevel === "B1" ? "B2" : selectedLevel === "B2" ? "C1" : selectedLevel === "C1" ? "C2" : "C2+ CERTIFIED"}
                          </span>
                        </p>
                        {selectedLevel !== profile.level && (
                          <div className="text-amber-400 bg-amber-500/5 px-3 py-2 rounded-xl border border-amber-500/20 text-[11px] font-bold flex items-center gap-1.5 mt-2">
                            <AlertTriangle size={13} />
                            <span>
                              {lang === "ar" ? `اسمك مسجل رسمياً حالياً في مستوى (${profile.level}). يمكنك إجراء امتحانات مستوى (${selectedLevel}) للممارسة والرفع من مستواك، لكن الترقية الرسمية تتطلب تقدم مستمر خطوة بخطوة.` :
                               `Votre inscription actuelle officielle est au niveau (${profile.level}). Vous pouvez réaliser ces tests (${selectedLevel}) pour s'entraîner, mais le passage de niveau nécessite une validation de votre niveau actuel.`}
                            </span>
                          </div>
                        )}

                        {/* ACCESSIBILITY & COMFORT CERTIFICATION */}
                        <div className="text-emerald-400 bg-emerald-500/5 px-3.5 py-2.5 rounded-xl border border-emerald-500/20 text-[11px] font-sans leading-normal space-y-1 mt-2">
                          <p className="font-bold flex items-center gap-1 text-[11px]">
                            🛡️ {lang === "ar" ? "تقييم آمن ومحترم 100%:" : "Évaluation Confortable & Sereine Certifiée :"}
                          </p>
                          <p className="text-gray-400 text-[10px] leading-relaxed">
                            {lang === "ar" ? "نضمن لك أن جميع أسئلة هذا الاختبار تركز كلياً على القواعد والمهارات اللغوية والمهنية. لا نطرح أبداً أي أسئلة شخصية أو محرجة أو مسببة للضيق أو التمييز." :
                             "Nous certifions que toutes les questions d'évaluation de nos examens se focalisent uniquement sur la compétence linguistique et grammaticale. Aucune question personnelle, inadéquate ou discriminatoire n'est admise."}
                          </p>
                        </div>
                      </div>

                      {/* 30 Exams Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                        {Array.from({ length: 30 }).map((_, idx) => {
                          const examNum = idx + 1;
                          const examKey = `${selectedLevel}-${examNum}`;
                          const isPassed = (profile.passedExams_v2 || []).includes(examKey);
                          
                          return (
                            <div 
                              key={examNum}
                              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-transform hover:scale-[1.02] ${
                                isPassed 
                                  ? 'bg-[#10b981]/5 border-[#10b981]/25 text-white' 
                                  : 'bg-[#0c1222] border-[#1f293d] text-gray-300'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex justify-between items-center font-sans">
                                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold">Ref #{examKey}</span>
                                  {isPassed && (
                                    <span className="text-emerald-400 bg-emerald-500/25 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded">
                                      PASSED
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-bold font-mono text-white mt-1">Examen {examNum}</h4>
                                <p className="text-[10px] text-gray-400 font-sans">
                                  {lang === "ar" ? "40 سؤال progressive" : "40 questions progressive"}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleLoadExam(examNum)}
                                className={`w-full py-1.5 text-center rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                                  isPassed 
                                    ? 'text-emerald-400 bg-[#10b981]/15 hover:bg-emerald-500 hover:text-[#070a13]' 
                                    : 'bg-[#2563eb] hover:bg-blue-600 text-white'
                                }`}
                              >
                                {isPassed ? (lang === "ar" ? "إعادة الامتحان" : "Refaire") : (lang === "ar" ? "بدء الامتحان" : "Commencer")}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#070a13] border border-[#1b253b] p-6 rounded-2xl space-y-6 shadow-inner animate-fadeIn font-sans">
                      <div className="flex justify-between items-start border-b border-gray-800 pb-4 flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] tracking-widest font-mono text-blue-400 block uppercase font-bold flex items-center gap-1.5 flex-wrap">
                            Official SIELE Scale Verification
                            {isOfflineMode && (
                              <span className="text-[9px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse normal-case">
                                offline-cache
                              </span>
                            )}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1 ">{examData.examTitle}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExamActive(false)}
                          className="text-gray-500 hover:text-white text-xs border border-gray-800 px-3 py-1 rounded-lg transition-all"
                        >
                          {lang === "ar" ? "إلغاء المراجعة" : "Fermer l'examen"}
                        </button>
                      </div>

                      {/* Tarea-based Navigation Tabs */}
                      <div className="flex flex-wrap gap-1.5 border-b border-gray-800 pb-3">
                        {[1, 2, 3, 4, 5].map((tNum) => {
                          const startIdx = (tNum - 1) * 8;
                          const endIdx = tNum * 8;
                          let answeredInTarea = 0;
                          for (let k = startIdx; k < endIdx; k++) {
                            if (examAnswers[k] !== undefined) answeredInTarea++;
                          }
                          const isActive = activeTarea === tNum;
                          return (
                            <button
                              key={tNum}
                              type="button"
                              onClick={() => setActiveTarea(tNum)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                isActive 
                                  ? 'bg-amber-500 text-gray-950 border-amber-400 font-extrabold shadow-md' 
                                  : 'bg-[#0c1222]/80 text-gray-300 border-gray-800/80 hover:bg-[#162038] hover:text-white'
                              }`}
                            >
                              <span>{lang === "ar" ? `مهمة ${tNum}` : `Tarea ${tNum}`}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-amber-600 text-white' : 'bg-gray-900 text-gray-400'}`}>
                                {answeredInTarea}/8
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Display active Tarea's theoretical explanation / title */}
                      {(() => {
                        const descriptions: Record<number, { title: string; desc: string }> = {
                          1: { title: "Tarea 1: Comprensión escrita y vocabulario inicial (CEFR A1)", desc: "Enfocado en frases cotidianas, carteles informativos públicos directos y vocabulario de nivel base." },
                          2: { title: "Tarea 2: Frases y rutinas de comunicación interpersonal (CEFR A2)", desc: "Enfocado en interacciones directas, expresiones temporales cotidianas y diferenciación inicial de tiempos pasados." },
                          3: { title: "Tarea 3: Comprensión argumentativa e hilos del discurso (CEFR B1)", desc: "Enfocado en estructuración de opiniones, hipótesis y concordancia general de tiempos simples y subjuntivo." },
                          4: { title: "Tarea 4: Estructuras gramaticales complejas y modo subjuntivo (CEFR B2)", desc: "Análisis gramatical riguroso, combinación de preposiciones complejas y matices formales de opinión/duda." },
                          5: { title: "Tarea 5: Expresiones cultas, ensayos de de opinión y modismos (CEFR C1)", desc: "Análisis estilístico literario u de opinión periodística, modismos idiomáticos castellanos y sintaxis de nivel superior." }
                        };
                        const info = descriptions[activeTarea] || descriptions[1];
                        return (
                          <div className="bg-[#0c1222]/40 border border-gray-800/60 p-3 rounded-xl space-y-1">
                            <h4 className="text-xs font-bold text-amber-400">{info.title}</h4>
                            <p className="text-[11px] text-gray-450 leading-relaxed font-sans">{info.desc}</p>
                          </div>
                        );
                      })()}

                      {/* Overall Progress Ribbon */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c1222]/80 border border-gray-800 p-4 rounded-xl text-xs">
                        <div className="space-y-1">
                          <span className="text-gray-450">Progreso general del Examen SIELE:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full transition-all duration-300" 
                                style={{ width: `${(Object.keys(examAnswers).length / (examData.questions?.length || 40)) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-white font-bold">{Object.keys(examAnswers).length} / {examData.questions?.length || 40} contestadas</span>
                          </div>
                        </div>
                        {!examSubmitted && (
                          <div className="text-[11px] text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 max-w-sm font-sans">
                            💡 Conforme avanzas de Tarea, las preguntas se complican. Completa tantas como puedas.
                          </div>
                        )}
                      </div>

                      {/* Rapid Grid Navigation */}
                      <div className="bg-[#0c1222]/50 p-3 rounded-xl border border-gray-800 space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block font-bold">Mapa completo de preguntas (Haz clic para saltar a su Tarea)</span>
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-20 gap-1.5 font-mono">
                          {Array.from({ length: examData.questions?.length || 40 }).map((_, idx) => {
                            const qTarea = examData.questions?.[idx]?.tarea || Math.floor(idx / 8) + 1;
                            const isAnswered = examAnswers[idx] !== undefined;
                            const isCurrentTarea = qTarea === activeTarea;
                            const isCorrect = examSubmitted && examAnswers[idx] === examData.questions?.[idx]?.correctIndex;
                            
                            let styleClass = "bg-gray-900/40 text-gray-500 border-gray-800/80";
                            if (isAnswered) {
                              styleClass = "bg-blue-950/40 text-blue-300 border-blue-500/20";
                            }
                            if (isCurrentTarea) {
                              styleClass = "bg-amber-550/15 text-amber-400 border-amber-500/50 font-bold ring-1 ring-amber-500/40 bg-amber-950/50";
                            }
                            if (examSubmitted) {
                              styleClass = isCorrect 
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold" 
                                : "bg-red-500/20 text-red-400 border-red-500/40 font-bold";
                            }

                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveTarea(qTarea)}
                                className={`h-7 text-[10px] font-mono rounded-lg border flex items-center justify-center transition-all hover:opacity-85 ${styleClass}`}
                                title={`Pregunta ${idx + 1}`}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
                        {(examData.questions || [])
                          .map((q: any, i: number) => ({ ...q, originalIndex: i }))
                          .filter((q: any) => (q.tarea || Math.floor(q.originalIndex / 8) + 1) === activeTarea)
                          .map((q: any) => {
                            const i = q.originalIndex;
                            return (
                              <div key={i} className="p-4 bg-[#0c1222]/80 border border-gray-800 rounded-xl space-y-3">
                                <h5 className="text-xs font-bold text-gray-200 leading-relaxed grid grid-cols-[25px_1fr] gap-1 font-sans">
                                  <span className="text-amber-500 font-mono">{i+1}.</span>
                                  <span>{q.question}</span>
                                </h5>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                                  {q.options.map((opt: string, optIdx: number) => {
                                    const isSelected = examAnswers[i] === optIdx;
                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={examSubmitted}
                                        onClick={() => handleAnswerExam(i, optIdx)}
                                        className={`text-left p-2.5 rounded-lg text-xs leading-normal border transition-all ${isSelected ? 'bg-amber-500 text-gray-900 font-bold border-amber-400' : 'bg-[#070a13] text-gray-400 border-[#1b253b] hover:border-gray-700'}`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>

                                {examSubmitted && (
                                  <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed mt-2 font-sans ${examAnswers[i] === q.correctIndex ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    <strong>{examAnswers[i] === q.correctIndex ? "✔ ¡Correcto!" : `❌ Incorrecto (Correcto: ${q.options[q.correctIndex]})`}</strong>
                                    {q.tip && <p className="mt-1 opacity-80">{q.tip}</p>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>

                      {/* Pagination buttons for Tareas */}
                      <div className="flex justify-between items-center gap-4 mt-2">
                        <button
                          type="button"
                          disabled={activeTarea === 1}
                          onClick={() => setActiveTarea(prev => Math.max(1, prev - 1))}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1"
                        >
                          <ChevronLeft size={14} />
                          {lang === "ar" ? "المهمة السابقة" : "Tarea anterior"}
                        </button>
                        <button
                          type="button"
                          disabled={activeTarea === 5}
                          onClick={() => setActiveTarea(prev => Math.min(5, prev + 1))}
                          className="bg-[#1c2438] hover:bg-[#283452] text-gray-200 disabled:opacity-35 disabled:cursor-not-allowed font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1"
                        >
                          {lang === "ar" ? "المهمة التالية" : "Siguiente tarea"}
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {!examSubmitted ? (
                        <button
                          type="button"
                          onClick={handleSubmitExam}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-900 font-black py-3 rounded-2xl text-xs uppercase transition-all shadow-md active:scale-95"
                        >
                          {lang === "ar" ? "إرسال ورقة الامتحان المصححة" : "Soumettre les réponses de l'examen"}
                        </button>
                      ) : (
                        <div className="p-5 bg-[#0e172a] border border-[#1e293b] rounded-2xl text-center space-y-4 shadow-xl">
                          <span className="text-xs text-gray-400 uppercase tracking-widest block font-mono">Bilan de l'examen</span>
                          <h4 className="text-2xl font-black text-white">{examScore} / {examData.questions?.length || 40}</h4>
                          {examPassed ? (
                            <div className="space-y-2">
                              <p className="text-emerald-400 text-xs font-bold leading-relaxed font-sans">
                                🎉 ¡Aprobado! Felicidades, has verificado tu transición al nivel superior de la escala CEFR. Tu expediente se actualizó con un premio de +150 XP.
                              </p>
                            </div>
                          ) : (
                            <p className="text-amber-400 text-xs leading-relaxed font-sans">
                              ⚠️ Transición no habilitada. Requiere un mínimo del 60% para convalidar. ¡No te rindas y vuelve a estudiar los capítulos de vocabulario!
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => setExamActive(false)}
                            className="bg-gray-800 text-gray-200 text-xs font-bold px-5 py-2 rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-white transition-all shadow"
                          >
                            Volver a las lecciones
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* LESSON MATERIAL READER WINDOW */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Native lesson topic, details, audio map */}
                  <div className="lg:col-span-7 space-y-6">
                    {loadingLesson ? (
                      <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-400">Escribiendo contenido personalizado con IA...</p>
                      </div>
                    ) : lessonData ? (
                      <article className="space-y-6">
                        
                        {/* Alphabet module exclusively for Level A1 first page or any Alphabet topic */}
                        {selectedLevel === "A1" && (currentPage === 1 || getTopic(selectedLevel, currentPage).toLowerCase().includes("alphabet")) && (
                          <div className="bg-[#070a13] border border-emerald-500/20 p-5 rounded-2xl space-y-4">
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                              <Volume2 size={13} />
                              {lang === "ar" ? "الأبجدية الإسبانية التفاعلية والنطق" : 
                               lang === "fr" ? "Alphabet Espagnol Interactif (Alphabet de base)" :
                               lang === "es" ? "El Alfabeto Español Interactivo" :
                               "Interactive Spanish Alphabet (Core letters)"}
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed font-sans">
                              {lang === "ar" ? "انقر على الحرف لسماع النطق الإسباني الأصلي. ركز خصوصاً على الحروف ذات النطق المميز مقارنة بالفرنسية أو الإنجليزية." :
                               lang === "fr" ? "Cliquez sur chaque lettre pour écouter la prononciation correcte. Les lettres marquées en vert diffèrent de l'anglais." :
                               lang === "es" ? "Haz clic en cada letra para escuchar su pronunciación pura castellana. Se destacan las letras que difieren de otros idiomas." :
                               "Click each letter to hear its pure Castilian accent. Focus on special sounds highlighted."}
                            </p>

                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                              {ALPHABET_DATA.map((item, idx) => (
                                <div 
                                  key={idx}
                                  onClick={() => speakSpanish(`Letra ${item.n}. Se pronuncia ${item.n}.`)}
                                  className="p-3 bg-[#0c1222] border border-[#1b253b] hover:border-amber-500/40 rounded-xl cursor-pointer select-none transition-all group active:scale-95 flex flex-col justify-between"
                                >
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-white font-extrabold text-xl group-hover:text-amber-400">{item.l}</span>
                                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-sans tracking-wide">{item.n}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] mb-2 border-b border-gray-800/65 pb-1">
                                      <span className="font-mono text-gray-500 font-sans text-[8px] sm:text-[9px]">{item.ph}</span>
                                      <span className="text-emerald-400 font-bold text-[10px]">{item.ar}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-snug font-sans text-left min-h-[36px] flex items-center">
                                      {t(item.desc)}
                                    </p>
                                  </div>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakSpanish(item.w);
                                    }}
                                    className="mt-2 text-[10px] w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1 rounded font-bold hover:bg-emerald-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1 shrink-0"
                                  >
                                    <Volume2 size={10} />
                                    {item.w}
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-gray-800/80 pt-3 flex justify-between items-center text-[10px] text-gray-500">
                              <span>Voice target: Castilian (es-ES)</span>
                              <span>*Requires system text-to-speech enabled</span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-base font-extrabold text-white">{lessonData.title}</h3>
                              <button
                                onClick={() => downloadLessonPDF(lessonData, selectedLevel, currentPage, getTopic(selectedLevel, currentPage), lang)}
                                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                📄 {lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}
                              </button>
                            </div>
                            {isOfflineMode && (
                              <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 animate-pulse">
                                📶 {lang === "ar" ? "وضع الكتاب المدرسي المغلق" :
                                     lang === "fr" ? "Mode Manuel de Cours Offline" :
                                     lang === "es" ? "Modo Offline Activo" :
                                     "Offline Textbook Study Mode"}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-300 leading-relaxed font-sans bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl shadow-inner prose prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                h3: ({ children }) => <h3 className="text-sm font-bold text-amber-400 mt-4 mb-2 border-b border-gray-800 pb-1">{children}</h3>,
                                h4: ({ children }) => <h4 className="text-xs font-bold text-white mt-3 mb-1.5">{children}</h4>,
                                p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="mb-0.5">{children}</li>,
                                code: ({ children }) => <code className="bg-gray-800 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[10px]">{children}</code>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-amber-500 pl-3 italic text-gray-400 my-2">{children}</blockquote>,
                                table: ({ children }) => <div className="overflow-x-auto my-3"><table className="min-w-full border-collapse border border-gray-800 text-[11px]">{children}</table></div>,
                                th: ({ children }) => <th className="border border-gray-800 bg-gray-900 px-3 py-1.5 text-left font-bold text-white">{children}</th>,
                                td: ({ children }) => <td className="border border-gray-800 px-3 py-1.5 text-gray-300">{children}</td>,
                              }}
                            >
                              {lessonData.explanation}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {/* Vocabulary List with active native reading */}
                        {lessonData.vocabulary && lessonData.vocabulary.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                              {lang === "ar" ? "المفردات والعبارات الرئيسية:" : "Mots Vocabulaires de la leçon :"}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {lessonData.vocabulary.map((voc: any, idx: number) => (
                                <div 
                                  key={idx}
                                  onClick={() => speakSpanish(voc.spanish)}
                                  className="bg-[#070a13] border border-[#1b253b] p-3 rounded-xl hover:border-amber-500/40 cursor-pointer transition-all active:scale-95 group text-left"
                                >
                                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 group-hover:text-[#34d399]">
                                    <Volume2 size={13} className="text-emerald-500" />
                                    {voc.spanish}
                                  </span>
                                  <span className="text-[10px] text-gray-400 tracking-wide font-sans mt-1 block font-mono">{voc.dynamicLang}</span>
                                  {voc.explanation && <p className="text-[10px] text-gray-500 mt-1 leading-relaxed font-sans">{voc.explanation}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    ) : null}
                  </div>

                  {/* Right Column: Mini Interactive exercise panel */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-[#070a13] border border-[#1b253b] p-4 rounded-2xl shadow-inner">
                      <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <CheckSquare size={13} className="text-amber-500" />
                        {lang === "ar" ? "التمارين والأنشطة التفاعلية" : "Pratique d'Intégration Active"}
                      </h4>
                      
                      {loadingLesson ? (
                        <div className="py-20 text-center text-xs text-gray-500 italic">Generando pruebas adaptativas...</div>
                      ) : lessonData?.practice ? (
                        <div className="space-y-4">
                          {lessonData.practice.map((item: any, idx: number) => {
                            const result = exResults[idx];
                            const currentAns = exAnswers[idx] || "";

                            return (
                              <div key={idx} className="bg-[#0c1222] border border-gray-800/80 p-3.5 rounded-xl space-y-3 shadow-sm hover:border-gray-700 transition-colors">
                                <div className="flex justify-between items-center border-b border-gray-800/80 pb-1.5">
                                  <span className="bg-[#1c2438] text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">{item.type}</span>
                                  <span className="text-[10px] text-gray-500">Ejemplo {idx+1}</span>
                                </div>

                                <p className="text-xs text-gray-200 leading-normal font-sans font-bold">{item.question}</p>

                                {/* Multiple choice selection layout */}
                                {item.type === "multiple-choice" && (
                                  <div className="space-y-1.5">
                                    {item.options?.map((opt: string, optIdx: number) => (
                                      <label key={optIdx} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer select-none">
                                        <input 
                                          type="radio" 
                                          name={`ex-mc-${idx}`}
                                          checked={Number(exAnswers[idx]) === optIdx}
                                          onChange={() => setExAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                                          className="text-amber-500 focus:ring-amber-500 h-3.5 w-3.5 accent-amber-500"
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    ))}

                                    <button 
                                      onClick={() => handleVerifyExercise(idx, currentAns, item.correctIndex, "multiple-choice")}
                                      className="w-full bg-[#1c2438] hover:bg-gray-800 text-gray-300 text-[10px] font-bold py-1.5 rounded-lg border border-gray-800 mt-2 hover:text-white"
                                    >
                                      {lang === "ar" ? "تحقق من جوابي" : "Vérifier le choix"}
                                    </button>
                                  </div>
                                )}

                                {/* Fill in the blanks layout */}
                                {item.type === "fill-blank" && (
                                  <div className="space-y-2">
                                    <input 
                                      type="text"
                                      placeholder="Remplir la case..."
                                      value={currentAns}
                                      onChange={(e) => setExAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                      className="w-full bg-[#070a13] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500 font-mono"
                                    />
                                    <button 
                                      onClick={() => handleVerifyExercise(idx, currentAns, item.blankWord, "fill-blank")}
                                      className="w-full bg-[#1c2438] hover:bg-gray-800 text-gray-300 text-[10px] font-bold py-1.5 rounded-lg border border-gray-800"
                                    >
                                      {lang === "ar" ? "إرسال الكلمة" : "Tester le mot"}
                                    </button>
                                  </div>
                                )}

                                {/* Translation test */}
                                {item.type === "translation" && (
                                  <div className="space-y-2">
                                    <input 
                                      type="text"
                                      placeholder="Tu traducción en español..."
                                      value={currentAns}
                                      onChange={(e) => setExAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                      className="w-full bg-[#070a13] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                    />
                                    <button 
                                      onClick={() => handleVerifyExercise(idx, currentAns, item.correctTranslation, "translation")}
                                      className="w-full bg-[#1c2438] hover:bg-gray-800 text-gray-300 text-[10px] font-bold py-1.5 rounded-lg border border-gray-800"
                                    >
                                      {lang === "ar" ? "تقييم الترجمة بالمصحح" : "Soumettre la traduction"}
                                    </button>
                                  </div>
                                )}

                                {/* Conjugation test */}
                                {item.type === "conjugation" && (
                                  <div className="space-y-2">
                                    {item.verb && <span className="text-[10px] text-gray-500 font-mono italic">Verbo: {item.verb}</span>}
                                    <input 
                                      type="text"
                                      placeholder="Forma conjugada..."
                                      value={currentAns}
                                      onChange={(e) => setExAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                      className="w-full bg-[#070a13] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                    />
                                    <button 
                                      onClick={() => handleVerifyExercise(idx, currentAns, item.correctAnswer, "conjugation")}
                                      className="w-full bg-[#1c2438] hover:bg-gray-800 text-gray-300 text-[10px] font-bold py-1.5 rounded-lg border border-gray-800"
                                    >
                                      Check Form
                                    </button>
                                  </div>
                                )}

                                {/* General open writing test */}
                                {item.type === "writing" && (
                                  <div className="space-y-2">
                                    <textarea 
                                      placeholder="Escribe un párrafo..."
                                      rows={2}
                                      value={currentAns}
                                      onChange={(e) => setExAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                                      className="w-full bg-[#070a13] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                    />
                                    <button 
                                      onClick={() => handleVerifyExercise(idx, currentAns, null, "writing")}
                                      className="w-full bg-[#1c2438] hover:bg-gray-800 text-gray-300 text-[10px] font-bold py-1.5 rounded-lg border border-gray-800"
                                    >
                                      ✨ Calificar con IA
                                    </button>
                                  </div>
                                )}

                                {result && (
                                  <div className={`p-2.5 rounded-lg text-[10px] leading-relaxed mt-2 ${result.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'}`}>
                                    {result.fb}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
                  </>
                );
              })()}
            </div>
          )}

          {/* TAB 7: EXTRA - STUDENT LIFE COMPENDIUM */}
          {tab === "vie" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Compass className="text-amber-500" />
                    {lang === "ar" ? "دليل المدن الإسبانية والحياة الطلابية" : "Vie Étudiante, Événements & Bons Plans par Ville"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "اختر المدينة لعرض الفعاليات، طرق تكوين صداقات، وترتيب أرخص السوبرماركات وتوفير الميزانية:" : "Sélectionnez votre ville d'étude pour découvrir les événements, comment se faire des amis et économiser sur vos courses."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const activeGuide = customStudentLife.find(g => g.city === selectedCityLife) || customStudentLife[0];
                    downloadStudentLifePDF(activeGuide, lang);
                  }}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                </button>
              </div>

              {/* City selector horizontal bar */}
              <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-thin border-b border-gray-800/80">
                {customStudentLife.map((g) => {
                  const stars = profile.xp || 0;
                  const isL1 = ["Barcelona", "Valencia"].includes(g.city);
                  const isLockedTab = isL1 ? (stars < 100) : (stars < 300);
                  return (
                    <button
                      key={g.city}
                      onClick={() => setSelectedCityLife(g.city)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 border uppercase tracking-wider ${
                        selectedCityLife === g.city 
                          ? 'bg-amber-500 border-amber-500 text-gray-900 scale-102 shadow-lg shadow-amber-500/10' 
                          : 'bg-[#070a13] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <span className="text-sm">{g.flag}</span>
                      <span>{g.city}</span>
                      {isLockedTab && <span className="text-[10px] text-amber-500 animate-pulse">🔒</span>}
                    </button>
                  );
                })}
              </div>

              {/* Active city guide details panel */}
              {(() => {
                const activeGuide = customStudentLife.find(g => g.city === selectedCityLife) || customStudentLife[0];
                const stars = profile.xp || 0;
                const isCityLevel1 = ["Barcelona", "Valencia"].includes(activeGuide.city);
                const isCityLevel2 = !isCityLevel1;

                let isLocked = false;
                let requiredStars = 0;
                let requiredLevel = 0;

                if (isCityLevel1) {
                  requiredStars = 100;
                  requiredLevel = 1;
                  if (stars < 100) isLocked = true;
                } else {
                  requiredStars = 300;
                  requiredLevel = 2;
                  if (stars < 300) isLocked = true;
                }

                if (isLocked) {
                  return (
                    <div className="bg-[#070a13] border-2 border-dashed border-amber-500/25 p-10 rounded-2xl text-center space-y-5 my-4 animate-fadeIn text-left">
                      <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                        🔒
                      </div>
                      <div className="space-y-1.5 text-center">
                        <h3 className="text-base font-black text-white">
                          {lang === "ar" ? `دليل مدينة ${activeGuide.city} مغلق` : `Guía de ${activeGuide.city} Bloqueada`}
                        </h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                          {lang === "ar"
                            ? `يتطلب عرض هذا الدليل المتكامل للعيش الطلابي مستوى ${requiredLevel} ورصيد لا يقل عن ${requiredStars} نجمة ⭐.`
                            : `Esta de guía de supervivencia estudiantil requiere el Nivel ${requiredLevel} (${requiredStars} estrellas ⭐) del portal.`}
                        </p>
                      </div>
                      
                      <div className="p-3.5 bg-amber-500/5 rounded-xl border border-[#1b253b] max-w-xs mx-auto text-center font-mono text-xs">
                        <span className="text-gray-400 block text-[10px] uppercase">Balance Estudiantil:</span>
                        <strong className="text-amber-400 text-sm font-black">{stars} Nujum ⭐</strong>
                        <div className="text-[10px] text-gray-500 mt-1">
                          Faltan <strong className="text-white bg-amber-500/10 px-1 py-0.5 rounded">{requiredStars - stars}</strong> estrellas para abrir esta ciudad.
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Find any city that is unlocked under current stars
                            const unlocked = customStudentLife.find(c => {
                              const belongs = ["Barcelona", "Valencia"].includes(c.city);
                              return belongs ? stars >= 100 : stars >= 300;
                            }) || customStudentLife[0];
                            setSelectedCityLife(unlocked.city);
                          }}
                          className="px-4 py-1.5 bg-[#121c33] border border-gray-800 text-white font-bold text-xs rounded-xl hover:bg-[#1a2d4f] cursor-pointer"
                        >
                          {lang === "ar" ? "الرجوع لخيار مفتوح" : "Ir a una ciudad ya abierta"}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl space-y-5 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                      <span className="text-2xl">{activeGuide.flag}</span>
                      <div>
                        <h3 className="text-base font-extrabold text-white">
                          {activeGuide.city} — {lang === "ar" ? "دليل الطالب المتكامل" : "Le Guide Complet de l'Étudiant"}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                          {lang === "ar" ? "دليل معيشي محدث وحصري" : "Données locales certifiées pour l'intégration estudiantine"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Section 1: Events */}
                      <div className="bg-[#0c1222]/80 border border-gray-800/60 p-4 rounded-xl space-y-2">
                        <span className="text-amber-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          🎉 {lang === "ar" ? "الفعاليات والأنشطة الطلابية" : "Événements & Intégration"}
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          {activeGuide.events[lang as keyof typeof activeGuide.events] || activeGuide.events.es}
                        </p>
                      </div>

                      {/* Section 2: Friends */}
                      <div className="bg-[#0c1222]/80 border border-gray-800/60 p-4 rounded-xl space-y-2">
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          🤝 {lang === "ar" ? "كيف تجد وتكون صداقات؟" : "Comment faire des amis"}
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          {activeGuide.friends[lang as keyof typeof activeGuide.friends] || activeGuide.friends.es}
                        </p>
                      </div>

                      {/* Section 3: Supermarkets & savings */}
                      <div className="bg-[#0c1222]/80 border border-gray-800/60 p-4 rounded-xl space-y-2">
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          🛒 {lang === "ar" ? "ترتيب أرخص المتاجر والتوفير" : "Supermarchés : Classement"}
                        </span>
                        <div className="space-y-1.5 font-sans">
                          <p className="text-[11px] text-[#34d399] font-mono leading-relaxed font-bold">
                            {activeGuide.supermarkets.ranking[lang as keyof typeof activeGuide.supermarkets.ranking] || activeGuide.supermarkets.ranking.es}
                          </p>
                          <p className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-800/60 pt-1.5">
                            <strong>💡 {lang === "ar" ? "نصيحة الميزانية:" : "Astuce budget :"}</strong> {activeGuide.supermarkets.tips[lang as keyof typeof activeGuide.supermarkets.tips] || activeGuide.supermarkets.tips.es}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="bg-[#070a13] border border-gray-800/80 p-5 rounded-2xl space-y-3">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2">🛡️ {lang === "ar" ? "التأمين والطوارئ" : "Assurances & Urgences"}</h4>
                  <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
                    <li>• {lang === "ar" ? "تأكد من تفعيل بطاقة التأمين الصحي الخاص بك (Adeslas, Sanitas...) فور وصولك للتغطية الفورية." : "Activez votre carte d'assurance santé privée d'études (Adeslas, Sanitas) dès l'arrivée pour la couverture complète."}</li>
                    <li>• {lang === "ar" ? "رقم الطوارئ العام الموحد داخل إسبانيا هو 112 (تتوفر إجابات باللغات الأساسية)." : "Le numéro national d'urgence centralisé est le 112, accessible sans carte réseau SIM active."}</li>
                  </ul>
                </div>

                <div className="bg-[#070a13] border border-gray-800/80 p-5 rounded-2xl space-y-3">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2">🏦 {lang === "ar" ? "الخدمات البنكية الملائمة" : "Services de Trésorerie Bancaire"}</h4>
                  <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
                    <li>• {lang === "ar" ? "أفضل الحسابات الخالية من الرسوم للشباب: Cuenta Online BBVA, Cuenta Joven Santander أو N26." : "Les banques numériques recommandées pour l'itinérance gratuite sans commissions mensuelles permanentes sont BBVA Online ou N26."}</li>
                    <li>• {lang === "ar" ? "الأوراق المطلوبة: جواز سفر ساري، مع شهادة القبول الأكاديمية (Carta de Admisión)." : "Nécessaire : original de votre passeport, justificatif d'inscription éducative ou reçu de paiement."}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: POST-STUDENT EMPLOYMENT OPTIONS */}
          {tab === "emploi" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="text-amber-500" />
                    {lang === "ar" ? "العمل بعد الدراسة والإقامة" : "Analyse Détaillée des Plateformes d'Emplois en Espagne"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "ar" ? "دليل تفصيلي شامل لكيفية وأماكن العثور على عمل في إسبانيا للطلاب والمغتربين:" : "Guide exhaustif sur le fonctionnement de chaque outil pour maximiser votre chance d'insertion réelle."}
                  </p>
                </div>
                <button
                  onClick={() => downloadEmploymentPDF(lang)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                </button>
              </div>

              {/* Legal updates block */}
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/25 rounded-2xl flex items-start gap-3">
                <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-emerald-400 leading-relaxed">
                  <strong>💡 {lang === "ar" ? "تعديل قانون الهجرة الأخير للعمل (30 ساعة):" : "Réforme Légale Essentielle / Droit de Travail Automatique :"}</strong>{" "}
                  {lang === "ar" ? "وفقًا للتحديث الأخير لقانون الهجرة، يحق للطلاب حاملي بطاقة الطالب ممارسة العمل جانبياً وبشكل قانوني لغاية 30 ساعة أسبوعياً بصفة تلقائية بمجرد التسجيل دون الحاجة لطلب تصريح عمل منفصل. يجب أن تتوافق الساعات مع فصول الدراسة." :
                   "En Espagne, tout étudiant inscrit de façon régulière possède désormais le droit automatique de travailler à temps partiel jusqu'à 30 heures par semaine directement sans démarches patronales lourdes auprès de l'Oficina de Extranjería."}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                  {lang === "ar" ? "تفاصيل ودليل استخدام منصات التوظيف الرسمية:" : "Guide d'Utilisation des 4 Portails Majeurs pour Trouver du Travail :"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* portal 1: Infojobs */}
                  <div className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span className="text-blue-400">❶</span> InfoJobs España
                        </h5>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[9px] px-2 py-0.5 font-mono rounded">Nº1 GENERALISTAS</span>
                      </div>
                      <div className="text-xs text-gray-300 space-y-1.5 font-sans">
                        <p>
                          <strong>{lang === "ar" ? "أين تبحث؟" : "Où chercher ?"}</strong>{" "}
                          {lang === "ar" ? "مثالي لقطاعات خدمة العملاء، إدارة المكاتب، السياحة، المبيعات والخدمات الفندقية." : "Idéal pour l'hôtellerie, service client bilingue, administration et fonctions supports."}
                        </p>
                        <p>
                          <strong>{lang === "ar" ? "كيف تعثر على فرصة وتتميز؟" : "Comment postuler ?"}</strong>{" "}
                          {lang === "ar" ? "سجل سيرتك الذاتية بتحديث مستمر. الشركات في إسبانيا تستخدم فلاتر الكلمات الدلالية (ATS)، ويجب إدخال مهاراتك بشكل دقيق والمزايدة على العرض فور طرحه." : "Complétez votre profil à 100%. Les recruteurs trient par mots-clés et réactivité. Postulez dès la parution pour rester en haut de la pile."}
                        </p>
                      </div>
                    </div>
                    <a 
                      href="https://www.infojobs.net" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-3 block text-center bg-blue-500/10 hover:bg-blue-500 hover:text-[#070a13] text-blue-400 font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Visitar InfoJobs.net 🔗
                    </a>
                  </div>

                  {/* portal 2: Tecnoempleo */}
                  <div className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span className="text-emerald-400">❷</span> Tecnoempleo
                        </h5>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 font-mono rounded">100% TECNOLOGÍA</span>
                      </div>
                      <div className="text-xs text-gray-300 space-y-1.5 font-sans">
                        <p>
                          <strong>{lang === "ar" ? "أين تبحث؟" : "Où chercher ?"}</strong>{" "}
                          {lang === "ar" ? "مخصص حصرياً للبرمجة (React, Java, Node)، تطوير الويب، إدارة الأنظمة، والتدريب المهني الفني (DAW/DAM)." : "Conçu pour les dev, administrateurs réseaux et profils ingénieurs tech ou diplômés du secteur de formation professionnelle (DAM/DAW)."}
                        </p>
                        <p>
                          <strong>{lang === "ar" ? "كيف تعثر على فرصة وتتميز؟" : "Comment postuler ?"}</strong>{" "}
                          {lang === "ar" ? "ارفق رابط الـ Portfolio الخاص بك على GitHub. تعرض المنصة مقارنة تلقائية لراتب الوظيفة ومستواك الفني بالنسبة للمتقدمين الآخرين." : "Mentionnez vos projets de code personnels et votre compte GitHub. Le site affiche un bilan comparatif de vos compétences par rapport aux concurrents."}
                        </p>
                      </div>
                    </div>
                    <a 
                      href="https://www.tecnoempleo.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-3 block text-center bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#070a13] text-emerald-400 font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Visitar Tecnoempleo.com 🔗
                    </a>
                  </div>

                  {/* portal 3: Linkedin */}
                  <div className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span className="text-sky-400">❸</span> LinkedIn España
                        </h5>
                        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[9px] px-2 py-0.5 font-mono rounded">CORPORATIVO & RED</span>
                      </div>
                      <div className="text-xs text-gray-300 space-y-1.5 font-sans">
                        <p>
                          <strong>{lang === "ar" ? "أين تبحث؟" : "Où chercher ?"}</strong>{" "}
                          {lang === "ar" ? "مثالي للمكاتب متعددة الجنسيات، وظائف الدعم اللغوي (العربية/الفرنسية/الإنجليزية) في مدريد وبرشلونة ومالقة." : "Excellent pour les multinationales, services délocalisés et postes requérant le français, l’arabe ou l’anglais à Madrid/Barcelone."}
                        </p>
                        <p>
                          <strong>{lang === "ar" ? "كيف تعثر على فرصة وتتميز؟" : "Comment postuler ?"}</strong>{" "}
                          {lang === "ar" ? "تواصل مباشرة مع مسؤولي التوظيف (Talent Acquisition) في إسبانيا عن طريق رسالة قصيرة ومحترفة تشرح فيها جاهزيتك وتصريح العمل 30 ساعة تلقائي." : "Ajoutez directement les recruteurs locaux en précisant dans votre mémo d’invitation que vous détenez le droit automatique de 30h de labeur sur votre pass étudiant."}
                        </p>
                      </div>
                    </div>
                    <a 
                      href="https://es.linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-3 block text-center bg-sky-500/10 hover:bg-sky-500 hover:text-[#070a13] text-sky-400 font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Visitar LinkedIn España 🔗
                    </a>
                  </div>

                  {/* portal 4: JobToday */}
                  <div className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span className="text-amber-400">❹</span> JobToday España
                        </h5>
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] px-2 py-0.5 font-mono rounded">EMPLEO RÁPIDO</span>
                      </div>
                      <div className="text-xs text-gray-300 space-y-1.5 font-sans">
                        <p>
                          <strong>{lang === "ar" ? "أين تبحث؟" : "Où chercher ?"}</strong>{" "}
                          {lang === "ar" ? "وظائف عاجلة ومؤقتة: مقاهي، توزيع منشورات، خدمات لوجستية، رعاية أطفال ودروس خصوصية." : "Pour dénicher des petits jobs réactifs de week-end : serveurs, livreurs, cours particuliers, surcroît d'activité saisonnier."}
                        </p>
                        <p>
                          <strong>{lang === "ar" ? "كيف تعثر على فرصة وتتميز؟" : "Comment postuler ?"}</strong>{" "}
                          {lang === "ar" ? "تتميز المنصة بنظام محادثة فوري (Chat) يربطك مباشرة مع صاحب العمل دون تعقيدات السيرة الذاتية الكلاسيكية. كن متواجداً للرد على رسائلهم." : "L'atout est la messagerie intégrée instantanée. Pas de CV complexe requis : discutez à l'écrit directement avec les gérants locaux pour fixer un essai."}
                        </p>
                      </div>
                    </div>
                    <a 
                      href="https://jobtoday.com/es" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-3 block text-center bg-amber-500/10 hover:bg-amber-500 hover:text-[#070a13] text-amber-500 font-bold text-xs py-2 rounded-xl transition-all"
                    >
                      Visitar JobToday.com 🔗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SHARED ARAB-SPANISH COMMUNITY */}
          {tab === "chat" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="text-amber-500 animate-bounce" />
                  {lang === "ar" ? "المنتدى الجماعي ومجتمع الطلاب" : "Forum de Discussion & Correction Grammaticale IA"}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === "ar" ? "تبادل النصائح مع طبل إسبانيا واحصل على تدقيق ذكي لأخطائك النحوية في اللغة الإسبانية" : "Posez des questions pratiques. Si vous rédigez en espagnol, l'IA Professor vous corrigera."}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chat feed column */}
                <div className="lg:col-span-2 bg-[#070a13] border border-[#1b253b] p-4 rounded-2xl flex flex-col h-[400px]">
                  
                  {/* Messages list container */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1" id="chatroom-messages">
                    {chats.map(msg => (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${msg.user === "Tú" ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <span className="text-[10px] text-gray-500 font-mono mb-0.5 px-1">{msg.user}</span>
                        <div className={`p-3 rounded-2xl text-xs font-sans leading-relaxed ${msg.system ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300' : msg.user === "Tú" ? 'bg-amber-500 text-gray-900 font-semibold' : 'bg-[#0c1222] border border-[#1b253b] text-gray-300'}`}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 px-1">
                          <span className="text-[8px] text-gray-600">{msg.time}</span>
                          {msg.user !== "Tú" && !msg.system && (
                            <button
                              onClick={() => handleReportPost(msg.id, msg.user)}
                              className="text-[8px] text-red-400 hover:text-white bg-red-500/15 hover:bg-red-600 px-1.5 py-0.2 rounded transition-colors cursor-pointer flex items-center gap-0.5"
                              title="Denunciar comentario raro o inapropiado"
                            >
                              🚩 {lang === "ar" ? "إبلاغ" : "Denunciar"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input field actions */}
                  <div className="mt-3 pt-3 border-t border-gray-800/80 flex gap-2">
                    <input 
                      type="text" 
                      placeholder={lang === "ar" ? "اكتب رسالة (مثال: yo quiere estudiar en madrid) لتفعيل المصلح التلقائي" : "Rédigez en espagnol (ex: yo tener hambre) pour voir le prof d'IA corriger..."}
                      value={chatInp}
                      onChange={(e) => setChatInp(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChatChatroom()}
                      className="flex-1 bg-[#0c1222] border border-[#1b253b] text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-sans"
                    />
                    <button
                      onClick={handleSendChatChatroom}
                      className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-4 rounded-xl text-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      ➤
                    </button>
                  </div>
                  <div className="mt-2.5 flex justify-between items-center px-1 shrink-0">
                    <span className="text-[9px] text-gray-500 font-mono">
                      ⚡ {lang === "ar" ? "الإشراف والرقابة التلقائية بواسطة الذكاء الاصطناعي" : "Modération automatique et correction par IA"}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setActivePolicyTab("terms"); setShowPoliciesModal(true); }}
                      className="text-[9.5px] text-amber-500 hover:text-amber-400 font-bold underline transition-colors cursor-pointer flex items-center gap-1 focus:outline-none"
                    >
                      🛡️ {lang === "ar" ? "شروط الاستخدام والأنظمة" : lang === "fr" ? "Voir les Conditions d'Utilisation" : "Ver Normas y Condiciones de Uso"}
                    </button>
                  </div>
                </div>


                {/* Tutor booking panel */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                    {lang === "ar" ? "مدرسون معتمدون ومساعدة في الترجمة:" : "Professeurs Certifiés Particuliers :"}
                  </h4>
                  
                  {[
                    { name: "Sra. Leila Alami", av: "👩‍🏫", detail: "Enseignante trilingue espagnol-arabe. Préparation intense aux examens PCE Selectividad." },
                    { name: "Dr. Karim Belhadj", av: "👨‍🏫", detail: "Spécialiste de la traduction jurée de documents universitaires et lettres de motivation de visa." }
                  ].map((tut, i) => (
                    <div key={i} className="bg-[#070a13] border border-[#1b253b] p-4 rounded-xl space-y-3 shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-xl bg-gray-800 p-1.5 rounded-xl block">{tut.av}</span>
                        <div>
                          <h5 className="font-bold text-xs text-white leading-tight">{tut.name}</h5>
                          <span className="text-[9px] text-amber-500 block">★★★★★ (4.9 Verified)</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans leading-normal">{tut.detail}</p>
                      <button
                        onClick={() => handleBookTutor(tut.name)}
                        className="w-full bg-[#1c2438] hover:bg-gray-800 text-gray-300 font-bold text-[10px] py-2 rounded-lg transition-colors border border-gray-800"
                      >
                        {lang === "ar" ? "حجز حصة تجريبية" : "Réserver une session"}
                      </button>
                    </div>
                  ))}
                  <div className="p-3 bg-[#0a0f1d] text-gray-400 rounded-xl text-[10px] space-y-2 border border-[#1b253b] leading-relaxed">
                    <p className="font-bold text-amber-400 flex items-center gap-1">
                      🛡️ {lang === "ar" ? "قيد التسجيل والتدريس:" : 
                           lang === "fr" ? "Accréditation Administrateur Unique :" : 
                           lang === "es" ? "Acceso Restringido - Solo Administrador:" : 
                           "Restricted Access - Administrator Only:"}
                    </p>
                    <p className="text-gray-500 text-[9px] leading-relaxed">
                      {lang === "ar" ? "لا يُسمح لأي طالب بنشر أو إدراج عروض تدرس لغوية. المشرف فقط هو المخول بإضافة وتدقيق عروض مدرسي اللغات لضمان الجودة ومكافحة الاحتيال المالي." :
                       lang === "fr" ? "Aucun étudiant n'est autorisé à publier une offre de professeur de langue. Seul l'administrateur exclusif a le droit de mettre en ligne des profils académiques." :
                       lang === "es" ? "Ningún estudiante está autorizado a presentar o publicar una oferta de profesor de idiomas o tutoría. Únicamente el administrador del portal tiene permisos exclusivos para subir ofertas." :
                       "No student is authorized to upload or post any language tutor or teacher profile. Only the official portal administrator can create or publish tutoring listings to ensure quality."}
                    </p>
                    <div className="text-[8px] text-gray-600 border-t border-gray-800 pt-1 font-mono text-center">
                      Platform preserves a flat 30% safety escrow for dispute protection.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: AUTOMATED CURRICULUM VITAE SPANISH BOOSTER */}
          {tab === "cv" && (
            <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl space-y-6">
              <div className="mb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="text-amber-500" />
                  {lang === "ar" ? "منشئ ومترجم السيرة الذاتية المهنية" : "Modelos de CV Profesional & Generador Automático"}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {lang === "ar" ? "اختر أحد النماذج الـ 15 المعتمدة ثم قم بإنشاء وتنزيل سيرتك الذاتية بتنسيق أوروبي" : "Sélectionnez parmi nos 15 modèles spécialisés de CV espagnol pour remplir l'outil en un clic, o personalizarlo."}
                </p>
              </div>

              {/* CV EXAMPLES SELECTOR PANEL (15 Job Specialties) */}
              <div className="bg-[#070a13] border border-[#1b253b] p-4 rounded-2xl">
                <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  📋 {lang === "ar" ? "15 نموذج سيرة ذاتية جاهز للتعبئة الفورية:" : "15 Ejemplos de Currículum por Especialización (Autorellenables):"}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {CV_TEMPLATES.map((tmpl, tIdx) => {
                    const isSelected = cvData.role === tmpl.data.role;
                    return (
                      <button
                        key={tIdx}
                        onClick={() => {
                          setCvData(tmpl.data);
                          // Reset generated content to let them re-generate
                          setCvHtml("");
                        }}
                        className={`p-2.5 rounded-xl border text-[10px] text-left transition-all leading-snug font-sans relative ${
                          isSelected 
                            ? "bg-amber-500/15 border-amber-500 text-amber-350 shadow" 
                            : "bg-[#0c1222] border-[#1b253b] text-gray-300 hover:border-gray-700 hover:bg-[#12192b]"
                        }`}
                      >
                        <div className="font-bold truncate" title={tmpl.title}>
                          {lang === "ar" ? tmpl.title.split("(")?.[0] || tmpl.title : tmpl.title}
                        </div>
                        <div className="text-[9px] text-gray-500 truncate">{tmpl.enTitle}</div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] text-black font-extrabold font-mono">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* ADVANCE NOTE EXPLAINING THAT MODELS ARE FICTITIOUS AND PDF-READY */}
                <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300/90 leading-relaxed font-sans">
                  💡 <strong>{lang === "ar" ? "تنبيه هام ومثال توضيحي:" : "Nota de Ejemplo Ficticio:"}</strong>{" "}
                  {lang === "ar" 
                    ? "جميع نماذج السير الذاتية الـ 15 المتاحة بالأعلى تحتوي على أسماء وبيانات وخلفيات مهنية 'افتراضية تماماً' للمثال فقط. يمكنك استخدامها كقالب لتعبئة معلوماتك الحقيقية وتحميل النموذج المختار بصيغة PDF فوراً."
                    : "Todos los 15 modelos de currículum disponibles arriba son ejemplos ilustrativos con experiencias y datos académicos totalmente ficticios para demostración técnica pedagógica. Adapta la plantilla con tu información verídica y descárgala en PDF mediante el botón de descarga."}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left panel: Guía y Manual de Redacción de CV */}
                <div className="bg-[#070a13] border border-[#1b253b] p-5 rounded-2xl space-y-5">
                  <div className="border-b border-gray-800 pb-3">
                    <span className="text-[10px] tracking-widest font-mono text-amber-500 block uppercase font-bold">
                      {lang === "ar" ? "دليل وهيكل السيرة الذاتية في إسبانيا" : "GUÍA Y NORMATIVA DE CV EN ESPAÑA"}
                    </span>
                    <h4 className="text-[13.5px] font-extrabold text-white mt-1">
                      {lang === "ar" ? "القواعد الذهبية لكتابة سيرتك الذاتية المعتمدة:" : "Directrices esenciales para tu Currículum Vitae:"}
                    </h4>
                  </div>

                  <div className="space-y-4 font-sans text-xs leading-relaxed text-gray-300">
                    <div className="bg-[#0c1222]/85 border border-gray-800/80 p-3.5 rounded-xl">
                      <h5 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                        <span>📏</span> <span>{lang === "ar" ? "قاعدة الصفحة الواحدة (1 Sola Página)" : "Extensión Máxima (Una Página)"}</span>
                      </h5>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {lang === "ar"
                          ? "يرفض مسؤولو التوظيف في إسبانيا السير الذاتية الطويلة. احرص على جعل نموذج سيرتك مكثفًا ومنظمًا في صفحة واحدة فقط لضمان قراءته بالكامل."
                          : "En España, se prefiere rotundamente que el currículum ocupe exactamente una sola página. La síntesis y el orden transmiten alta capacidad organizativa y profesionalidad."}
                      </p>
                    </div>

                    <div className="bg-[#0c1222]/85 border border-gray-800/80 p-3.5 rounded-xl">
                      <h5 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                        <span>🚫</span> <span>{lang === "ar" ? "لا داعي للصور الشخصية العشوائية" : "Política sobre Fotos"}</span>
                      </h5>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {lang === "ar"
                          ? "توصي مبادئ التوظيف الحديثة في أوروبا بعدم إدراج أي صورة شخصية عشوائية لضمان الموثوقية والتقييم العادل لمهاراتك الفنية الحقيقية."
                          : "El modelo actual prescinde de fotos para favorecer un filtrado objetivo y transparente de tus competencias. Si decides incluir una, debe ser de estudio y sobre fondo blanco."}
                      </p>
                    </div>

                    <div className="bg-[#0c1222]/85 border border-gray-800/80 p-3.5 rounded-xl">
                      <h5 className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                        <span>🌍</span> <span>{lang === "ar" ? "مستويات اللغات الأوروبية المعتمدة (MCER)" : "Acreditación de Idiomas (Marco CEFR)"}</span>
                      </h5>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {lang === "ar"
                          ? "عند ذكر مهاراتك اللغوية، لا تستخدم أشرطة التقييم المئوية المبهمة. اكتب مستواك الفعلي وفق الإطار الأوروبي المرجعي الموحد للغات مثل: (Español A2, Árabe Nativo)."
                          : "Evita barras de porcentaje imprecisas. Determina tus competencias lingüísticas utilizando los niveles estandarizados del marco europeo de referencia (A1, A2, B1, B2, C1, C2)."}
                      </p>
                    </div>

                    <div className="bg-[#0c1222]/85 border border-gray-800/80 p-3.5 rounded-xl">
                      <h5 className="font-bold text-[#c084fc] mb-1 flex items-center gap-1.5">
                        <span>🎓</span> <span>{lang === "ar" ? "المعادلة والشواهد التعليمية المعترف بها" : "Homologación y Títulos Equivalentes"}</span>
                      </h5>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {lang === "ar"
                          ? "قيد دائماً مسمى شهادتك بما يعادلها رسمياً في منظومة التعليم والتدريب المهني الإسباني (مثل Grado Superior u Homologación en Trámite) لتسهيل فلترتها من قبل الموارد البشرية."
                          : "Si tu titulación extranjera está en proceso legal, indica siempre 'En trámite de homologación'. Traduce tus estudios al formato equivalente español (Grado, Ciclo Medio o Superior) para que el reclutador entienda tu perfil."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-mono text-amber-500 font-bold block">ℹ️ NOTA DE SEGURIDAD DEL PORTAL</span>
                    <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                      {lang === "ar"
                        ? "هذه الصفحة مخصصة كمعرض أمثلة ريادية معتمدة محمي ضد التعديل لأسباب أمنية. اختر أي وظيفة من القائمة الدوارة in الأعلى وسيقوم النظام بتحديث نموذج السيرة الذاتية المناسب فوراً والذي يمكنك تنزيله كملف PDF رسمي."
                        : "Dado que el portal restringe la edición de información en vivo para mantener seguros los perfiles, esta sección funciona como un visor de modelos idóneos adaptados a cada sector. Haz clic en las profesiones de arriba y descárgate el PDF de referencia de forma instantánea."}
                    </p>
                  </div>
                </div>

                {/* Right panel: High-Fidelity Interactive Two-Column CV visual template */}
                <div className="space-y-4">
                  {/* Action row */}
                  <div className="flex justify-between items-center bg-[#070a13] border border-[#1b253b] p-3 rounded-2xl shrink-0 gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider pl-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {lang === "ar" ? "معاينة النموذج المعتمد" : "Vista Previa de CV Profesional"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadCVPDF}
                        title="Descargar este modelo de CV en PDF"
                        className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 text-[10px] font-extrabold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <span>📥 Descargar PDF (Modelo)</span>
                      </button>
                      <button
                        onClick={() => {
                          const nameLine = `Nombre: ${cvData.name}\n`;
                          const contactLine = `Contacto / Email: ${cvData.email}\nUbicación: ${cvData.city}\n\n`;
                          const roleLine = `PUESTO DESEADO: ${cvData.role}\n\n`;
                          const profileLine = `PERFIL PERSONAL:\nJoven con alta motivación para incorporarse al sector en el cargo de ${cvData.role}. Excelente adaptabilidad y disposición de aprendizaje rápido en España.\n\n`;
                          const eduLine = `FORMACIÓN ACADÉMICA:\n${cvData.edu}\n\n`;
                          const skillsLine = `COMPETENCIAS:\n${cvData.skills}\n\n`;
                          const expLine = `EXPERIENCIA:\n${cvData.exp}\n\n`;
                          const fullTxt = nameLine + contactLine + roleLine + profileLine + eduLine + skillsLine + expLine;
                          navigator.clipboard.writeText(fullTxt);
                          setCvCopied(true);
                          setTimeout(() => setCvCopied(false), 2000);
                        }}
                        className="bg-[#1c2438] hover:bg-gray-800 text-gray-300 border border-gray-800 text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Copy size={12} />
                        {cvCopied ? "¡Copiado!" : (lang === "ar" ? "نسخ النص" : "Copiar Texto")}
                      </button>
                    </div>
                  </div>

                  {/* High Fidelity CV Box modeled after Carlos Méndez layout image provided */}
                  <div className="bg-white text-gray-850 rounded-2xl overflow-hidden shadow-2xl flex min-h-[600px] border border-gray-200 font-sans text-left">
                    {/* Dark leftist column (sidebar) */}
                    <div className="w-[35%] bg-slate-950 text-white p-5 flex flex-col justify-between shrink-0 border-r border-gray-100">
                      <div className="space-y-6">
                        {/* Avatar initials circle with dynamic layout */}
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-white/20">
                            {cvData.name ? cvData.name.charAt(0) : "S"}
                          </div>
                          <div className="text-[9px] text-amber-300 font-mono mt-2 uppercase tracking-wider font-semibold">
                            {lang === "ar" ? "نموذج سيرة" : "MODELO DE CV"}
                          </div>
                        </div>

                        {/* Contact section */}
                        <div className="space-y-2">
                          <h4 className="text-white font-extrabold text-[11px] uppercase tracking-wider border-b border-gray-805 pb-1 flex items-center gap-1">
                            <span>📞</span> {lang === "ar" ? "الجريدة والاتصال" : "Contacto"}
                          </h4>
                          <div className="text-[10px] space-y-1.5 text-gray-300 leading-normal">
                            <div>
                              <span className="text-gray-500 block text-[9px]">Correo:</span>
                              <span className="font-medium text-white break-all">{cvData.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px]">Ubicación:</span>
                              <span className="font-medium text-white">{cvData.city}</span>
                            </div>
                          </div>
                        </div>

                        {/* Education Section */}
                        <div className="space-y-2">
                          <h4 className="text-white font-extrabold text-[11px] uppercase tracking-wider border-b border-gray-800 pb-1 flex items-center gap-1">
                            <span>🎓</span> {lang === "ar" ? "التكوين الأكاديمي" : "Formación"}
                          </h4>
                          <div className="text-[10px] space-y-1 text-gray-300 leading-relaxed font-sans">
                            <p className="font-semibold text-white leading-normal">{cvData.edu}</p>
                            <p className="text-gray-400 text-[9px] italic">{lang === "ar" ? "معادلة مصدقة in إسبانيا" : "Equivalencia Homologada en España"}</p>
                          </div>
                        </div>

                        {/* Hard Skills Section */}
                        <div className="space-y-2">
                          <h4 className="text-white font-extrabold text-[11px] uppercase tracking-wider border-b border-gray-800 pb-1 flex items-center gap-1">
                            <span>⚙️</span> {lang === "ar" ? "القدرات الفنية" : "Aptitudes"}
                          </h4>
                          <ul className="text-[10px] space-y-1 text-gray-300 list-disc list-inside leading-relaxed">
                            {cvData.skills.split(",").map((sk, sIdx) => {
                              const trimmed = sk.trim();
                              if (!trimmed) return null;
                              return <li key={sIdx} className="truncate" title={trimmed}>{trimmed}</li>;
                            })}
                          </ul>
                        </div>
                      </div>

                      <div className="text-[8px] text-gray-500 font-mono mt-4 leading-normal text-center border-t border-gray-900 pt-2 font-semibold">
                        Ejemplo de Currículum para Estudiantes. Formato de Presentación Profesional.
                      </div>
                    </div>

                    {/* Classic Right side (main content) */}
                    <div className="flex-1 bg-white p-6 flex flex-col justify-between text-left text-slate-800 font-sans">
                      <div className="space-y-5">
                        {/* Name and massive bold headline styled like Carlos Méndez */}
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none font-sans">
                            {cvData.name}
                          </h3>
                          <div className="mt-1.5 bg-slate-900 text-amber-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest inline-block rounded">
                            {cvData.role}
                          </div>
                        </div>

                        {/* Personal summary block */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                            <span className="text-amber-500">👤</span> {lang === "ar" ? "الخطوط العريضة والمستهدف" : "Perfil Personal"}
                          </h4>
                          <p className="text-[10px] text-slate-600 leading-relaxed">
                            {lang === "ar"
                              ? `مهني طموح يسعى للانضمام إلى سوق العمل الإسباني في منصب ${cvData.role}. أمتلك قدرة تامة على التكيف السريع، الالتزام بالمعايير المهنية، والاستعداد لتعلم العمليات واللوائح المحلية بكفاءة.`
                              : `Profesional comprometido con alta motivación para integrarse rápidamente en el mercado laboral de España en el puesto de ${cvData.role || "su especialidad"}. Demostrada iniciativa, mentalidad de crecimiento, y plena adaptabilidad a la normativa y ritmos de trabajo locales.`}
                          </p>
                        </div>

                        {/* Employment experience timeline */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                            <span className="text-amber-500">💼</span> {lang === "ar" ? "الخبرات والتدريب الميداني" : "Experiencia Laboral"}
                          </h4>
                          
                          <div className="space-y-3 relative before:absolute before:top-1 before:bottom-1 before:left-1.5 before:w-0.5 before:bg-slate-100 pl-4 font-sans">
                            <div className="relative">
                              <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full border border-amber-500 bg-white" />
                              <div className="flex justify-between items-start flex-wrap text-[10px] mb-0.5">
                                <span className="font-extrabold text-slate-950 uppercase">{cvData.role}</span>
                                <span className="font-mono text-slate-450 text-[9px]">2024 - Actualidad</span>
                              </div>
                              <span className="text-[9px] text-amber-600 block font-semibold mb-1">Proyecto de Capacitación / Prácticas</span>
                              <p className="text-[9.5px] text-slate-650 leading-relaxed font-sans">
                                {cvData.exp}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Languages section */}
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1">
                            <span className="text-amber-500">🌍</span> {lang === "ar" ? "اللغات والتواصل" : "Idiomas"}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {lang === "ar" ? (
                              <>
                                <span className="bg-slate-100 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">الأسبانية (مستوى متقدم للمهنة)</span>
                                <span className="bg-slate-100 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">العربية (اللغة الأم)</span>
                                <span className="bg-slate-100 text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">الإنجليزية (مهني B2)</span>
                              </>
                            ) : (
                              <>
                                <span className="bg-slate-150 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded border border-slate-200">Español (Competencia Laboral CCSE/A2)</span>
                                <span className="bg-slate-150 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded border border-slate-200">Árabe (Lengua Nativa)</span>
                                <span className="bg-slate-150 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded border border-slate-200">Inglés (Nivel Técnico B2)</span>
                              </>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Disclaimer footer stamp */}
                      <div className="border-t border-slate-150 pt-2.5 mt-3 flex items-start gap-1.5">
                        <span className="text-[11px] mt-0.5 shrink-0 block">⚠️</span>
                        <p className="text-[8px] text-slate-400 font-sans leading-normal block">
                          <strong>AVISO DE MODELO:</strong> Este CV representa un ejemplo ideal de presentación e idoneidad profesional para el mercado español. Descarga el modelo PDF para tener una plantilla idéntica estructurada según los estándares del reclutamiento en España.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: TEACHERS & TUTORS SECTION */}
          {tab === "teachers" && (
            (profile.xp || 0) < 700 ? (
              <div className="bg-[#0c1222] border border-[#1b253b] p-12 rounded-3xl shadow-xl text-center space-y-6 animate-fadeIn">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  🔒
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold text-white">
                    {lang === "ar" ? "قسم الأساتذة والدروس الخصوصية مغلق" : "Tutores de Apoyo y PCE Bloqueado"}
                  </h2>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed text-center">
                    {lang === "ar"
                      ? "التواصل المباشر مع الأساتذة لحل مشكلات اللغة أو التحضير لاختبارات PCE يتطلب رتبة \"طالب\" (مستوى 3) ورصيد لا يقل عن 700 نجمة ⭐ للوصول لقائمة الاتصال."
                      : "El acceso directo a tutores académicos homologados para resolución de dudas PCE o FP requiere el Nivel 3 (Rango Estudiante de 700 estrellas ⭐) del portal."}
                  </p>
                </div>
                
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 max-w-sm mx-auto font-mono text-xs text-center">
                  <span className="text-gray-400">Tu balance actual:</span>{" "}
                  <strong className="text-amber-400 text-sm font-black">{(profile.xp || 0)} Estrellas ⭐</strong>
                  <div className="mt-1 text-[10px] text-gray-400 text-center">
                    Te faltan <strong className="text-white bg-amber-500/10 px-1.5 py-0.5 rounded">{700 - (profile.xp || 0)}</strong> estrellas para desbloquear.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTab("roadmap")}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0c1222] font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {lang === "ar" ? "اكتسب النجوم والدخول للدراسة" : "Ganar Estrellas en Curso de Español"}
                </button>
              </div>
            ) : (
              <div className="bg-[#0c1222] border border-[#1b253b] p-6 rounded-3xl shadow-xl space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2.5 font-sans">
                    <span>👨‍🏫</span>
                    {lang === "es" ? "Profesores y Tutores de Apoyo" : lang === "ar" ? "الأساتذة المعتمدون والمدرسون" : "Teachers & Academic Tutors"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "es" ? "Resuelve dudas de idioma, preparación PCE Selectividad o materias de FP con profesores homologados." :
                     lang === "ar" ? "تواصل مباشرة مع أسatذة لمساعدتك في تعلم الإسبانية، التحضير لاختبارات الولوج والنجاح الجامعي." :
                     "Direct support from accredited academic professors for your Spanish lessons, PCE Exams, and FP topics."}
                  </p>
                </div>
                <button
                  onClick={() => downloadTeachersPDF(dbStats?.teachers || [], lang)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/20 hover:border-transparent text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>📄</span>
                  <span>{lang === "es" ? "Descargar PDF" : lang === "ar" ? "تحميل PDF" : "Télécharger PDF"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(dbStats?.teachers || []).map((tch: any, idx: number) => (
                  <div key={tch.id || idx} className="bg-[#070a13] border border-gray-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all">
                    <div className="flex gap-4">
                      <img 
                        src={tch.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"} 
                        alt={tch.name} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/20 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-sm">{tch.name}</h3>
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                            ★ {tch.rating || 5.0}
                          </span>
                        </div>
                        <p className="text-xs text-amber-500 font-medium">{tch.subject}</p>
                        <p className="text-[11px] text-gray-400 font-mono select-all select-text">{tch.email}</p>
                        {tch.phone && <p className="text-[11px] text-gray-500 font-mono select-all select-text">{tch.phone}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed italic bg-black/20 p-3 rounded-xl border border-gray-800/40">
                      "{tch.bio}"
                    </p>
                    <div className="flex gap-2">
                      <a 
                        href={`mailto:${tch.email}?subject=Consulta de Alumno `}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black text-center text-xs font-bold rounded-xl transition-all"
                      >
                        {lang === "es" ? "📩 Contactar por Email" : lang === "ar" ? "📩 اتصل بالبريد" : "📩 Contact by Email"}
                      </a>
                    </div>
                  </div>
                ))}

                {(dbStats?.teachers || []).length === 0 && (
                  <div className="col-span-2 text-center py-8 text-xs text-gray-400 font-mono">
                    No hay profesores cargados actualmente en el sistema.
                  </div>
                )}
              </div>
            </div>
          )
        )}

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#080d19] border-t border-[#1b253b] py-6 text-center text-xs text-gray-500 select-none">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-sans leading-relaxed">
            {lang === "ar" ? "بوابة الدراسة في إسبانيا — دليل الطلاب العرب المهاجرين والتعليم المعتمد © 2026" :
             "Spain Study Portal — Manuel d'orientation et d'apprentissage linguistique d'Extranjería © 2026"}
          </p>
          <div className="flex justify-center gap-3 text-[10px] text-gray-600 flex-wrap">
            <span className="bg-[#0c1222] px-2 py-0.5 rounded border border-[#1b253b]">NON-OFFICIAL ASSISTANCE</span>
            <span className="bg-[#0c1222] px-2 py-0.5 rounded border border-[#1b253b]">GEMINI 3.5 FLASH ENGAGED</span>
            <span className="bg-[#0c1222] px-2 py-0.5 rounded border border-[#1b253b]">OFFLINE AUDIO POWERED</span>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION FEEDS FOR GAMIFICATION --- */}
      {starToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121c33] border-2 border-amber-500 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-sm animate-bounce text-left">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-xl font-extrabold text-black shrink-0">
            ⭐
          </div>
          <div>
            <span className="text-[10px] text-amber-400 font-mono block uppercase font-bold">¡Estrellas Ganadas!</span>
            <h4 className="text-sm font-black text-white">+{starToast.stars} Nujum (النجوم)</h4>
            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{starToast.reason}</p>
          </div>
        </div>
      )}

      {levelUpOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070a13]/95 backdrop-blur-xl p-6 text-center animate-fadeIn">
          <div className="max-w-md bg-[#0c1222] border-2 border-amber-500 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="text-6xl animate-bounce">🎉</div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 uppercase">
                ¡Ascenso de Nivel en el Portal!
              </span>
              <h2 className="text-2xl font-black text-white mt-3">
                {lang === "ar" ? "مبروك! تمت ترقية رتبتك بنجاح" : "¡Felicidades por tu nuevo rango!"}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                {lang === "ar" 
                  ? `لقد انتقلت من المستوى ${levelUpOverlay.oldLevel} إلى المستوى ${levelUpOverlay.newLevel}!` 
                  : `¡Has subido de nivel de forma extraordinaria! Tu nuevo rango de estudios en España es:`}
              </p>
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-widest">
                Nivel {levelUpOverlay.newLevel} — {levelUpOverlay.levelName}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-normal">
              {lang === "ar" 
                ? "لقد قمت بإلغاء قفل موضوعات وأدلة وخدمات جديدة كلياً في منصتك الدراسية لتبسيط رحلتك بالكامل."
                : "Se han desbloqueado nuevas guías oficiales y recursos prácticos correspondientes a tu nueva categoría."}
            </p>

            <button
              onClick={() => {
                setLevelUpOverlay(null);
                setTab("roadmap");
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-[#070a13] font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer"
            >
              {lang === "ar" ? "استمر في المغامرة ➔" : "Continuar Preparación ➔"}
            </button>
          </div>
        </div>
      )}

      {/* DETAILED SPECIALTY POPUP / MODAL */}
      {selectedSpecialty && (() => {
        const details = getSpecialtyDetails(selectedSpecialty.name.en, lang, selectedSpecialty.salidas[lang]);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in animate-duration-205">
            <div 
              className="relative w-full max-w-2xl bg-[#0a1020] border-2 border-[#1e2e4b] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Decorative Header */}
              <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
              
              {/* Modal Scrollable Container */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 font-bold font-mono border border-amber-500/20">
                      {lang === "es" ? "Especialidad Educativa" : lang === "ar" ? "التخصص التعليمي" : lang === "fr" ? "Spécialité d'Étude" : "Educational Specialty"}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2.5 tracking-tight leading-snug">
                      {t(selectedSpecialty.name)}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 font-mono">
                      <span>⏱</span>
                      <strong>{lang === "es" ? "Duración aproximada:" : lang === "ar" ? "المدة التقريبية:" : lang === "fr" ? "Durée approximative :" : "Approximate Duration:"}</strong>
                      <span className="text-amber-300 font-semibold">{details.duration}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedSpecialty(null)}
                    className="p-2 rounded-xl bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Complete Description */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-2 font-mono">
                    <span className="text-amber-500">➔</span>
                    {lang === "es" ? "Descripción Completa" : lang === "ar" ? "الوصف التفصيلي الكامل" : lang === "fr" ? "Description Détaillée" : "Detailed Description"}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed bg-[#0c1426] p-4 rounded-xl border border-[#1b2b48]">
                    {details.description}
                  </p>
                </div>

                {/* Subjects (What is Taught / Lo que se enseña) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-2 font-mono">
                    <span className="text-amber-400">📚</span>
                    {lang === "es" ? "¿Qué se enseña? (Asignaturas y Módulos)" : lang === "ar" ? "ماذا ستتعلم؟ (المواد والوحدات الدراسية)" : lang === "fr" ? "Ce qui est enseigné (Programme & Modules)" : "What is Taught? (Syllabus & Modules)"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {details.subjects.map((subj, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start p-3 bg-[#0d1627]/60 border border-[#1b2a45] rounded-xl shadow-sm">
                        <span className="text-amber-500 font-bold mt-0.5 select-none">✓</span>
                        <span className="text-xs text-gray-200 font-medium">{subj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gained Skills (Competencies / Lo que tiene con detalle) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-2 font-mono">
                    <span className="text-amber-400">🎯</span>
                    {lang === "es" ? "Competencias y Habilidades Técnicas" : lang === "ar" ? "الجدارات والمهارات التقنية المكتسبة" : lang === "fr" ? "Compétences & Habiletés techniques" : "Gained Technical Skills"}
                  </h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {details.skills.map((skill, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 bg-[#0d1627]/30 p-2.5 border border-gray-800/40 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Career Outlets */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-2 font-mono">
                    <span className="text-amber-400">💼</span>
                    {lang === "es" ? "Principales Salidas Profesionales" : lang === "ar" ? "أبزر آفاق ومناصب العمل والتوظيف" : lang === "fr" ? "Débouchés de Carrière Majeurs" : "Major Career Outlets"}
                  </h4>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedSpecialty.salidas[lang]?.map((sal, sIdx) => (
                      <span key={sIdx} className="text-xs px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800/80 text-gray-200 font-medium">
                        {sal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Action Footer */}
              <div className="p-4 bg-[#070b16] border-t border-[#142137] flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedSpecialty(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold tracking-wide cursor-pointer transition-colors"
                >
                  {lang === "es" ? "Entendido, cerrar" : lang === "ar" ? "حسناً، إغلاق" : lang === "fr" ? "D'accord, fermer" : "Got it, close"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {renderPoliciesModal()}
    </div>
  );
}

