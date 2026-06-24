import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import pg from "pg";
import { getFallbackLessonData } from "./src/fallbackLessons";
import { getFallbackExam } from "./src/fallbackExams";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// PostgreSQL connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database tables
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS community_messages (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admins (
      email TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ads (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS custom_data (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
  `);

  // Seed default admin using env variables (never hardcoded)
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (adminEmail) {
    await pool.query(`
      INSERT INTO admins (email, data) VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
    `, [adminEmail.toLowerCase(), JSON.stringify({ email: adminEmail.toLowerCase(), password: adminPassword, role: "master", name: "Soulaymane" })]);
  }

  // Seed default teachers
  const defaultTeachers = getDefaultTeachers();
  for (const t of defaultTeachers) {
    await pool.query(`INSERT INTO teachers (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [t.id, JSON.stringify(t)]);
  }

  console.log("[DB] PostgreSQL tables ready.");
}

// DB helper functions
async function getStudents() {
  const res = await pool.query(`SELECT data FROM students ORDER BY created_at ASC`);
  return res.rows.map((r: any) => r.data);
}

async function getStudent(emailOrId: string) {
  const val = emailOrId.toLowerCase();
  const res = await pool.query(
    `SELECT data FROM students WHERE data->>'email' = $1 OR data->>'id' = $1 OR data->>'studentIdCode' = $1`,
    [val]
  );
  return res.rows[0]?.data || null;
}

async function saveStudent(student: any) {
  await pool.query(
    `INSERT INTO students (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
    [student.id, JSON.stringify(student)]
  );
}

async function getMessages() {
  const res = await pool.query(`SELECT data FROM community_messages ORDER BY created_at ASC`);
  return res.rows.map((r: any) => r.data);
}

async function saveMessage(msg: any) {
  await pool.query(
    `INSERT INTO community_messages (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
    [msg.id, JSON.stringify(msg)]
  );
}

async function deleteMessage(id: string) {
  await pool.query(`DELETE FROM community_messages WHERE id = $1`, [id]);
}

async function getAlerts() {
  const res = await pool.query(`SELECT data FROM alerts ORDER BY created_at DESC`);
  return res.rows.map((r: any) => r.data);
}

async function saveAlert(alert: any) {
  await pool.query(
    `INSERT INTO alerts (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
    [alert.id, JSON.stringify(alert)]
  );
}

async function deleteAlert(id: string) {
  await pool.query(`DELETE FROM alerts WHERE id = $1`, [id]);
}

async function getAdmins() {
  const res = await pool.query(`SELECT data FROM admins`);
  return res.rows.map((r: any) => r.data);
}

async function saveAdmin(admin: any) {
  await pool.query(
    `INSERT INTO admins (email, data) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET data = $2`,
    [admin.email.toLowerCase(), JSON.stringify(admin)]
  );
}

async function deleteAdmin(email: string) {
  await pool.query(`DELETE FROM admins WHERE email = $1`, [email.toLowerCase()]);
}

async function getTeachers() {
  const res = await pool.query(`SELECT data FROM teachers`);
  return res.rows.map((r: any) => r.data);
}

async function saveTeacher(teacher: any) {
  await pool.query(
    `INSERT INTO teachers (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
    [teacher.id, JSON.stringify(teacher)]
  );
}

async function deleteTeacher(id: string) {
  await pool.query(`DELETE FROM teachers WHERE id = $1`, [id]);
}

async function getConfig(key: string) {
  const res = await pool.query(`SELECT value FROM app_config WHERE key = $1`, [key]);
  return res.rows[0]?.value ?? null;
}

async function setConfig(key: string, value: any) {
  await pool.query(
    `INSERT INTO app_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, JSON.stringify(value)]
  );
}

async function getAds() {
  const res = await pool.query(`SELECT data FROM ads ORDER BY created_at ASC`);
  return res.rows.map((r: any) => r.data);
}

async function saveAd(ad: any) {
  await pool.query(
    `INSERT INTO ads (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
    [ad.id, JSON.stringify(ad)]
  );
}

async function deleteAd(id: string) {
  await pool.query(`DELETE FROM ads WHERE id = $1`, [id]);
}

async function getReports() {
  const res = await pool.query(`SELECT data FROM reports ORDER BY created_at DESC`);
  return res.rows.map((r: any) => r.data);
}

async function saveReport(report: any) {
  await pool.query(
    `INSERT INTO reports (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2`,
    [report.id, JSON.stringify(report)]
  );
}

async function getCustomData(key: string) {
  const res = await pool.query(`SELECT value FROM custom_data WHERE key = $1`, [key]);
  return res.rows[0]?.value ?? null;
}

async function setCustomData(key: string, value: any) {
  await pool.query(
    `INSERT INTO custom_data (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, JSON.stringify(value)]
  );
}

// =============================================
// GEMINI - ONLY FOR COMMENT MODERATION
// =============================================
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
}) : null;

const MULTILINGUAL_BAD_WORDS = [
  "mierda", "puta", "puto", "cabron", "cabrón", "joder", "maricon", "maricón", "gilipollas", "pendejo", "chingar",
  "merde", "putain", "connard", "salope", "fils de pute", "chier", "bordel",
  "shit", "fuck", "bitch", "asshole", "bastard", "cunt", "dick",
  "zamel", "kahba", "9ahba", "khara", "zab", "tabon", "mok", "zebe", "mounafiq", "quosombak", "kosomak", "sharmouta"
];

const DANGEROUS_TERMS = [
  "visado falso", "comprar nie", "documento falso", "empadronamiento falso", "matricula falsa",
  "falsificar", "comprar pasaporte", "soborno", "dinero negro",
  "vender examen", "respuestas pce", "comprar pce", "falso visado", "falsificado",
  "scam", "estafa", "hacker", "visa fake", "fake passport", "fake nie", "fake visa",
  "vender titulo", "comprar titulo", "comprar diploma", "fake degree",
  "harraga", "patera", "bomba", "matar", "asesinar", "terrorista", "armas", "suicidio", "drogar", "ilegal"
];

function containsInappropriateContent(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return MULTILINGUAL_BAD_WORDS.some(word => normalized.includes(word.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
}

function containsDangerousContent(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return DANGEROUS_TERMS.some(word => normalized.includes(word.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
}

// AI moderation - ONLY used for community comments
async function moderatePostWithAI(text: string): Promise<{ isBad: boolean; reason: string; languageDetected: string }> {
  if (!text) return { isBad: false, reason: "", languageDetected: "" };

  if (containsDangerousContent(text)) {
    return { isBad: true, reason: "ALERTA RIESGO/FRAUDE: Términos peligrosos detectados.", languageDetected: "Filtro Seguridad" };
  }
  if (containsInappropriateContent(text)) {
    return { isBad: true, reason: "Vocabulario explícitamente restringido.", languageDetected: "Filtro Local" };
  }

  if (ai) {
    try {
      const prompt = `Analiza el siguiente mensaje de una comunidad estudiantil. Determina si contiene insultos, amenazas, acoso o vocabulario vulgar en árabe dialectal (darija), francés, español o inglés.

Mensaje: "${text}"

Responde SOLO con JSON plano (sin markdown): {"isBad": true/false, "reason": "justificación breve", "languageDetected": "idioma"}`;

      const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
      if (response?.text) {
        let clean = response.text.trim().replace(/```(json)?/g, "").trim();
        const data = JSON.parse(clean);
        return { isBad: !!data.isBad, reason: data.reason || "", languageDetected: data.languageDetected || "" };
      }
    } catch (e) {
      console.error("[AI Moderation] Error:", e);
    }
  }

  return { isBad: false, reason: "", languageDetected: "" };
}

function getDefaultTeachers() {
  return [
    { id: "teach_1", name: "Mónica Ruiz Castro", subject: "Español A1 - B2", email: "monica.ruiz@espana-study.com", bio: "Profesora nativa con 8 años de experiencia.", phone: "+34 612 345 678", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", rating: 5 },
    { id: "teach_2", name: "Yassine El Amrani", subject: "PCE Selectividad - Matemáticas y Física", email: "yassine.amrani@espana-study.com", bio: "Doctor por la Universidad de Granada.", phone: "+34 688 123 456", photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200", rating: 5 },
    { id: "teach_3", name: "Prof. Alberto Sanz", subject: "Español Técnico para FP", email: "alberto.sanz@espana-study.com", bio: "Especialista en terminología técnica.", phone: "+34 633 987 654", photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200", rating: 4.8 }
  ];
}

async function startServer() {
  await initDB();

  app.use(express.json());

  const activeSessions = new Map<string, string>();

  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // DB Stats
  app.get("/api/db/stats", async (req, res) => {
    try {
      const students = await getStudents();
      const communityMessages = await getMessages();
      const alerts = await getAlerts();
      const teachers = await getTeachers();
      const admins = await getAdmins();
      const ads = await getAds();
      const progressReports = await getReports();
      const customMetrics = await getConfig("customMetrics") || { totalPageViews: 0, totalVisits: 0, avgSessionSeconds: 0, bounceRatePercent: 0 };
      const subscriptionPrice = await getConfig("subscriptionPrice");
      const subscriptionScope = await getConfig("subscriptionScope");
      const subscriptionBlocked = await getConfig("subscriptionBlocked");
      const subscriptionUserLimit = await getConfig("subscriptionUserLimit");
      const subscriptionEnabled = await getConfig("subscriptionEnabled");

      const verifyEmail = req.query.verifyEmail as string;
      if (verifyEmail) {
        const clientIP = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
        const existingIP = activeSessions.get(verifyEmail.toLowerCase());
        if (existingIP && existingIP !== clientIP) {
          return res.status(403).json({ status: "ip_conflict", error: `Sesión cerrada. Tu cuenta fue accedida desde otra IP.` });
        }
        if (!existingIP) activeSessions.set(verifyEmail.toLowerCase(), clientIP);
      }

      res.json({ students, communityMessages, alerts, teachers, admins, ads, progressReports, customMetrics, subscriptionPrice, subscriptionScope, subscriptionBlocked, subscriptionUserLimit, subscriptionEnabled });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "DB error" });
    }
  });

  // Student Login / Register
  app.post("/api/auth/student-login", async (req, res) => {
    const { email, name, lastName, phone, country, age, gender, currentEducation, academicGoal, city, targetCity, currentCountry, level, isOnlyLogin } = req.body;
    if (!email) return res.status(400).json({ error: "El correo electrónico es requerido." });

    const clientIP = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
    const existingIP = activeSessions.get(email.toLowerCase());
    if (existingIP && existingIP !== clientIP) {
      return res.status(403).json({ success: false, error: "Este correo ya está conectado desde otra IP." });
    }

    try {
      const subscriptionBlocked = await getConfig("subscriptionBlocked");
      let student = await getStudent(email);

      if (student) {
        if (student.isBlocked) return res.status(403).json({ success: false, error: "SU ACCESO HA SIDO TEMPORALMENTE RESTRINGIDO." });
        if (subscriptionBlocked) return res.status(403).json({ success: false, error: "PLATAFORMA BLOQUEADA por el administrador." });
        if (!isOnlyLogin) return res.status(400).json({ success: false, error: "Ya dispones de un perfil con este correo. Ve a 'Iniciar Sesión'." });
      } else {
        if (subscriptionBlocked) return res.status(403).json({ success: false, error: "PLATAFORMA BLOQUEADA." });
        if (isOnlyLogin) return res.status(404).json({ success: false, error: "Correo no registrado. Selecciona 'Crear Cuenta'." });
        if (!email.includes("@")) return res.status(404).json({ success: false, error: "ID no encontrado." });

        const allStudents = await getStudents();
        const userLimit = (await getConfig("subscriptionUserLimit")) ?? 1000;
        if (allStudents.length >= userLimit) return res.status(403).json({ success: false, error: `Límite de ${userLimit} estudiantes alcanzado.` });

        if (phone) {
          const phoneExists = allStudents.some((s: any) => s.phone && s.phone.trim() === phone.trim());
          if (phoneExists) return res.status(400).json({ success: false, error: "El número de teléfono ya está asignado a otro estudiante." });
        }

        student = {
          id: `stud_${Date.now()}`,
          name: name || email.split("@")[0],
          lastName: lastName || "",
          phone: phone || "",
          email: email.toLowerCase(),
          country: country || "Morocco",
          city: city || "Rabat",
          targetCity: targetCity || "Madrid",
          gender: gender || "Masculino",
          age: age ? Number(age) : 20,
          language: "fr",
          level: level || "A1",
          academicGoal: academicGoal || "FP Grado Superior",
          currentEducation: currentEducation || "Bachillerato",
          currentCountry: currentCountry || country || "Morocco",
          professionalGoal: "Estudiante de FP / Universidad",
          xp: 0, streak: 3, completedLessons: 0, completedExams: 0, studyTimeMinutes: 0,
          hasCv: false, registrationDate: new Date().toISOString().split("T")[0],
          premiumStatus: false, vocationalTopChoice: "Informática",
          isInternshipReady: false, hasJobReady: false, activeInCommunity: true,
          channel: "Direct", paymentAmount: 0, isBlocked: false
        };
        await saveStudent(student);
      }

      activeSessions.set(email.toLowerCase(), clientIP);
      res.json({ success: true, student });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Student Logout
  app.post("/api/auth/student-logout", (req, res) => {
    const { email } = req.body;
    if (email) activeSessions.delete(email.toLowerCase());
    res.json({ success: true });
  });

  // Admin Login
  app.post("/api/auth/admin-login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Correo y contraseña requeridos." });
    try {
      const admins = await getAdmins();
      const admin = admins.find((a: any) => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
      if (admin) return res.json({ success: true, admin });
      res.status(401).json({ error: "Credenciales inválidas." });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Create Collaborator
  app.post("/api/admin/create-collaborator", async (req, res) => {
    const { creatorEmail, name, password, adminEmail, canEditData } = req.body;
    const masterEmail = process.env.ADMIN_EMAIL || "";
    if (!adminEmail || adminEmail.toLowerCase() !== masterEmail.toLowerCase()) {
      return res.status(403).json({ error: "Solo el Administrador Maestro puede crear colaboradores." });
    }
    try {
      const admins = await getAdmins();
      if (admins.find((a: any) => a.email.toLowerCase() === creatorEmail.toLowerCase())) {
        return res.status(400).json({ error: "Este correo ya está registrado como colaborador." });
      }
      const newAdmin = { email: creatorEmail.toLowerCase().trim(), password, role: "anfitrion", name: name.trim(), canEditData: !!canEditData };
      await saveAdmin(newAdmin);
      const allAdmins = await getAdmins();
      res.json({ success: true, admins: allAdmins });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Delete Collaborator
  app.post("/api/admin/delete-collaborator", async (req, res) => {
    const { email, adminEmail } = req.body;
    const masterEmail = process.env.ADMIN_EMAIL || "";
    if (!adminEmail || adminEmail.toLowerCase() !== masterEmail.toLowerCase()) {
      return res.status(403).json({ error: "Solo el Administrador Maestro puede eliminar colaboradores." });
    }
    try {
      await deleteAdmin(email);
      const allAdmins = await getAdmins();
      res.json({ success: true, admins: allAdmins });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Toggle Collaborator Edit
  app.post("/api/admin/toggle-collaborator-edit", async (req, res) => {
    const { email, adminEmail } = req.body;
    const masterEmail = process.env.ADMIN_EMAIL || "";
    if (!adminEmail || adminEmail.toLowerCase() !== masterEmail.toLowerCase()) {
      return res.status(403).json({ error: "Solo el Administrador Maestro puede modificar privilegios." });
    }
    try {
      const admins = await getAdmins();
      const admin = admins.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
      if (admin) {
        admin.canEditData = !admin.canEditData;
        await saveAdmin(admin);
      }
      const allAdmins = await getAdmins();
      res.json({ success: true, admins: allAdmins });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Get Collaborators
  app.get("/api/admin/collaborators", async (req, res) => {
    try {
      const admins = await getAdmins();
      res.json({ success: true, collaborators: admins });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Create Student (Admin)
  app.post("/api/admin/create-student", async (req, res) => {
    const { name, lastName, country, targetCity, academicGoal, emailInput, level } = req.body;
    if (!name) return res.status(400).json({ error: "El nombre es obligatorio." });
    try {
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const studentIdCode = `AE-STUD-${randomSuffix}`;
      const generatedEmail = emailInput?.trim() ? emailInput.trim().toLowerCase() : `estudiante-${randomSuffix.toLowerCase()}@atrevete.com`;

      const exists = await getStudent(generatedEmail);
      if (exists) return res.status(400).json({ error: "Este correo ya está registrado." });

      const newStudent = {
        id: `stud_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
        studentIdCode, name: name.trim(), lastName: (lastName || "").trim(),
        phone: "", email: generatedEmail, country: country || "Morocco",
        city: "Casablanca", targetCity: targetCity || "Madrid", gender: "Masculino", age: 20,
        language: "fr", level: level || "A1", academicGoal: academicGoal || "FP Grado Superior",
        currentEducation: "Bachillerato", currentCountry: country || "Morocco",
        professionalGoal: "Estudiante de FP / Universidad",
        xp: 0, streak: 3, completedLessons: 0, completedExams: 0, studyTimeMinutes: 0,
        hasCv: false, registrationDate: new Date().toISOString().split("T")[0],
        premiumStatus: false, vocationalTopChoice: "Informática",
        isInternshipReady: false, hasJobReady: false, activeInCommunity: true,
        channel: "Direct", paymentAmount: 0, isBlocked: false
      };
      await saveStudent(newStudent);
      const students = await getStudents();
      res.json({ success: true, student: newStudent, students });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Toggle Student Block
  app.post("/api/admin/toggle-student-block", async (req, res) => {
    const { id, isBlocked } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido." });
    try {
      const students = await getStudents();
      const student = students.find((s: any) => s.id === id);
      if (!student) return res.status(404).json({ error: "Alumno no encontrado." });
      student.isBlocked = !!isBlocked;
      await saveStudent(student);
      const allStudents = await getStudents();
      res.json({ success: true, student, students: allStudents });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Update Student
  app.post("/api/student/update", async (req, res) => {
    const { id, updates } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido." });
    try {
      const students = await getStudents();
      const student = students.find((s: any) => s.id === id);
      if (!student) return res.status(404).json({ error: "Estudiante no encontrado." });
      const updated = { ...student, ...updates };
      await saveStudent(updated);
      res.json({ success: true, student: updated });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Delete Student
  app.post("/api/admin/delete-student", async (req, res) => {
    const { email, phone } = req.body;
    if (!email) return res.status(400).json({ error: "El correo es requerido." });
    try {
      const students = await getStudents();
      const student = students.find((s: any) => s.email.toLowerCase() === email.toLowerCase().trim());
      if (!student) return res.status(404).json({ error: "Estudiante no encontrado." });
      await pool.query(`DELETE FROM students WHERE id = $1`, [student.id]);
      await pool.query(`DELETE FROM community_messages WHERE data->>'email' = $1`, [email.toLowerCase().trim()]);
      const allStudents = await getStudents();
      const allMessages = await getMessages();
      res.json({ success: true, message: `Estudiante ${student.name} eliminado.`, students: allStudents, communityMessages: allMessages });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Update Metrics
  app.post("/api/admin/update-metrics", async (req, res) => {
    const { customMetrics, newAlert } = req.body;
    try {
      if (customMetrics) await setConfig("customMetrics", customMetrics);
      if (newAlert) {
        const alert = { id: `alert_${Date.now()}`, title: newAlert.title, type: newAlert.type || "info", timestamp: "Ahora" };
        await saveAlert(alert);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Dismiss Alert
  app.post("/api/admin/dismiss-alert", async (req, res) => {
    const { id } = req.body;
    try {
      await deleteAlert(id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Save Custom Data
  app.post("/api/admin/save-custom-data", async (req, res) => {
    const { key, data } = req.body;
    if (!key) return res.status(400).json({ error: "Key requerida." });
    try {
      await setCustomData(key, data);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Error del servidor." });
    }
  });

  // Ads
  app.get("/api/admin/ads", async (req, res) => {
    try { res.json({ success: true, ads: await getAds() }); } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/admin/ads/create", async (req, res) => {
    const { brand, title, description, imageUrl, targetUrl, section, durationHours, frequencyPerHour, fbAppId, fbPixelId, fbAccessToken, fbEventName } = req.body;
    if (!brand || !title) return res.status(400).json({ error: "Marca y título obligatorios." });
    try {
      const newAd = { id: `ad_${Date.now()}`, brand, title, description: description || "", imageUrl: imageUrl || "", targetUrl: targetUrl || "", status: "active", viewsCount: 0, clicksCount: 0, createdAt: new Date().toISOString(), section: section || "dashboard", durationHours: durationHours ?? -1, frequencyPerHour: frequencyPerHour ?? -1, fbAppId: fbAppId || "", fbPixelId: fbPixelId || "", fbAccessToken: fbAccessToken || "", fbEventName: fbEventName || "Lead" };
      await saveAd(newAd);
      res.json({ success: true, ad: newAd, ads: await getAds() });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/admin/ads/toggle", async (req, res) => {
    const { id } = req.body;
    try {
      const ads = await getAds();
      const ad = ads.find((a: any) => a.id === id);
      if (!ad) return res.status(404).json({ error: "Anuncio no encontrado." });
      ad.status = ad.status === "active" ? "paused" : "active";
      await saveAd(ad);
      res.json({ success: true, ad, ads: await getAds() });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/admin/ads/delete", async (req, res) => {
    const { id } = req.body;
    try { await deleteAd(id); res.json({ success: true, ads: await getAds() }); } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/student/ads/increment-view", async (req, res) => {
    const { id } = req.body;
    try {
      const ads = await getAds();
      const ad = ads.find((a: any) => a.id === id);
      if (!ad) return res.status(404).json({ error: "Anuncio no encontrado." });
      ad.viewsCount = (ad.viewsCount || 0) + 1;
      await saveAd(ad);
      res.json({ success: true, viewsCount: ad.viewsCount });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // Subscription
  app.post("/api/admin/subscription/save", async (req, res) => {
    const { price, scope, blocked, limit, enabled } = req.body;
    try {
      if (price !== undefined) await setConfig("subscriptionPrice", Number(price));
      if (scope !== undefined) await setConfig("subscriptionScope", scope);
      if (blocked !== undefined) await setConfig("subscriptionBlocked", !!blocked);
      if (limit !== undefined) await setConfig("subscriptionUserLimit", Number(limit));
      if (enabled !== undefined) await setConfig("subscriptionEnabled", !!enabled);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // Reports
  app.get("/api/admin/reports", async (req, res) => {
    try { res.json({ success: true, reports: await getReports() }); } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/admin/reports/create", async (req, res) => {
    const { title, metricType, summary, value, trend, author } = req.body;
    if (!title || !metricType || !summary) return res.status(400).json({ error: "Campos obligatorios." });
    try {
      const report = { id: `rep_${Date.now()}`, title, date: new Date().toLocaleDateString("es-ES"), metricType, summary, value: value || "N/A", trend: trend || "stable", author: author || "Administrador" };
      await saveReport(report);
      res.json({ success: true, report, reports: await getReports() });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // Community Post - WITH AI MODERATION
  app.post("/api/community/post", async (req, res) => {
    const { user, text, email } = req.body;
    if (!text || !user) return res.status(400).json({ error: "User y Text requeridos." });
    try {
      const { isBad, reason, languageDetected } = await moderatePostWithAI(text);

      if (isBad) {
        const alert = { id: `viol_${Date.now()}`, title: `⚠️ COMENTARIO RESTRINGIDO (${languageDetected}): "${user}" escribió: "${text}". IA: ${reason}`, type: "warning", timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), violatorEmail: email, violatorName: user, isViolationUnit: true };
        await saveAlert(alert);
        return res.status(400).json({ success: false, restricted: true, error: `Comentario restringido. Idioma: ${languageDetected}. Motivo: ${reason}` });
      }

      const msg = { id: `msg_${Date.now()}`, user, text, time: new Date().toISOString(), email, language: languageDetected || "es" };
      await saveMessage(msg);

      if (email) {
        const student = await getStudent(email);
        if (student) { student.xp = (student.xp || 0) + 5; await saveStudent(student); }
      }

      res.json({ success: true, message: msg, scoreUp: email ? 5 : 0 });
    } catch (e) { res.status(500).json({ error: "Error del servidor." }); }
  });

  app.post("/api/community/delete", async (req, res) => {
    const id = req.body.id || req.body.postId;
    if (!id) return res.status(400).json({ error: "ID requerido." });
    try { await deleteMessage(id); res.json({ success: true, communityMessages: await getMessages() }); } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/community/edit", async (req, res) => {
    const { id, text } = req.body;
    if (!id || text === undefined) return res.status(400).json({ error: "ID y texto requeridos." });
    try {
      const messages = await getMessages();
      const msg = messages.find((m: any) => m.id === id);
      if (!msg) return res.status(404).json({ error: "Mensaje no encontrado." });
      msg.text = text;
      await saveMessage(msg);
      res.json({ success: true, communityMessages: await getMessages() });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/community/report", async (req, res) => {
    const { messageId, reason, reporterEmail } = req.body;
    if (!messageId) return res.status(400).json({ error: "ID requerido." });
    try {
      const messages = await getMessages();
      const message = messages.find((m: any) => m.id === messageId);
      if (!message) return res.status(404).json({ error: "Mensaje no encontrado." });

      const reports = (await getCustomData("reports")) || [];
      const newReport = { id: `rep_${Date.now()}`, messageId, postText: message.text, violatorName: message.user, violatorEmail: message.email || "Invitado", reporterEmail: reporterEmail || "Anónimo", reason: reason || "Contenido inadecuado.", timestamp: new Date().toISOString() };
      reports.unshift(newReport);
      await setCustomData("reports", reports);

      const alert = { id: `alert_rep_${Date.now()}`, title: `🚩 DENUNCIA: "${message.user}" denunciado. Comentario: "${message.text}". Motivo: ${reason}`, type: "warning", timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), violatorEmail: message.email, violatorName: message.user, isViolationUnit: true };
      await saveAlert(alert);

      res.json({ success: true, report: newReport });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // Block Student
  app.post("/api/admin/block-student", async (req, res) => {
    const { email, block } = req.body;
    if (!email) return res.status(400).json({ error: "Correo requerido." });
    try {
      const student = await getStudent(email);
      if (!student) return res.status(404).json({ error: "Estudiante no encontrado." });
      student.isBlocked = !!block;
      await saveStudent(student);
      res.json({ success: true, student, message: block ? "Estudiante bloqueado." : "Estudiante desbloqueado." });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // Accompaniment
  app.post("/api/community/accompaniment", async (req, res) => {
    const { studentEmail, studentPhone, studentName, details } = req.body;
    if (!studentEmail) return res.status(400).json({ error: "Correo obligatorio." });
    try {
      const requests = (await getCustomData("accompanimentRequests")) || [];
      const emailTrim = studentEmail.toLowerCase().trim();
      const exists = requests.find((r: any) => r.studentEmail.toLowerCase() === emailTrim && r.status !== "Completado");
      if (exists) return res.status(400).json({ error: "Ya tienes una solicitud activa." });

      const student = await getStudent(emailTrim);
      const newRequest = { id: `acc_${Date.now()}`, studentEmail: emailTrim, studentName: studentName || (student?.name || "Estudiante"), studentPhone: studentPhone || (student?.phone || ""), country: student?.country || "", city: student?.city || "", academicGoal: student?.academicGoal || "", level: student?.level || "", timestamp: new Date().toISOString(), details: details || "Solicitud R Consulting", status: "Pendiente" };
      requests.unshift(newRequest);
      await setCustomData("accompanimentRequests", requests);

      const alert = { id: `alert_acc_${Date.now()}`, title: `🤝 NUEVA SOLICITUD: "${newRequest.studentName}" (${newRequest.studentEmail}) solicita R Consulting.`, type: "info", timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }), violatorEmail: newRequest.studentEmail, violatorName: newRequest.studentName, isViolationUnit: false };
      await saveAlert(alert);

      res.json({ success: true, request: newRequest });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/admin/archive-accompaniment", async (req, res) => {
    const { id } = req.body;
    try {
      const requests = (await getCustomData("accompanimentRequests")) || [];
      const idx = requests.findIndex((r: any) => r.id === id);
      if (idx !== -1) { requests[idx].status = "Completado"; await setCustomData("accompanimentRequests", requests); }
      res.json({ success: true, accompanimentRequests: requests });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/admin/delete-accompaniment", async (req, res) => {
    const { id } = req.body;
    try {
      const requests = (await getCustomData("accompanimentRequests")) || [];
      const filtered = requests.filter((r: any) => r.id !== id);
      await setCustomData("accompanimentRequests", filtered);
      res.json({ success: true, accompanimentRequests: filtered });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // Teachers
  app.post("/api/teachers/create", async (req, res) => {
    const { name, subject, email, bio, phone, photoUrl, rating } = req.body;
    if (!name || !subject || !email) return res.status(400).json({ error: "Nombre, asignatura y correo requeridos." });
    try {
      const t = { id: `teach_${Date.now()}`, name, subject, email, bio: bio || "Profesor colaborador.", phone: phone || "", photoUrl: photoUrl || "", rating: rating ? Number(rating) : 5.0 };
      await saveTeacher(t);
      res.json({ success: true, teacher: t, teachers: await getTeachers() });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/teachers/update", async (req, res) => {
    const { id, name, subject, email, bio, phone, photoUrl, rating } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido." });
    try {
      const teachers = await getTeachers();
      const t = teachers.find((x: any) => x.id === id);
      if (!t) return res.status(404).json({ error: "Profesor no encontrado." });
      const updated = { ...t, name: name || t.name, subject: subject || t.subject, email: email || t.email, bio: bio ?? t.bio, phone: phone ?? t.phone, photoUrl: photoUrl ?? t.photoUrl, rating: rating !== undefined ? Number(rating) : t.rating };
      await saveTeacher(updated);
      res.json({ success: true, teacher: updated, teachers: await getTeachers() });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  app.post("/api/teachers/delete", async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido." });
    try { await deleteTeacher(id); res.json({ success: true, teachers: await getTeachers() }); } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // AI Admin Advisor - uses static fallback, no Gemini
  app.post("/api/admin/advisor", async (req, res) => {
    try {
      const students = await getStudents();
      const messages = await getMessages();
      const totalUsers = students.length;
      const premiumUsers = students.filter((s: any) => s.premiumStatus).length;
      const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "0";

      const fallbackReport = `### 📊 Informe Ejecutivo\n\n- **Estudiantes registrados:** ${totalUsers}\n- **Premium:** ${premiumUsers} (${conversionRate}% conversión)\n- **Mensajes comunidad:** ${messages.length}\n\n#### Recomendaciones\n1. Refuerza el módulo de homologación de títulos.\n2. Introduce planes de pago fraccionados.\n3. Incentiva la participación con badges.`;
      res.json({ response: fallbackReport });
    } catch (e) { res.status(500).json({ error: "Error." }); }
  });

  // Lessons - static fallback only
  app.post("/api/lesson", async (req, res) => {
    const { level, topic, targetLang } = req.body;
    let langCode = "en";
    if (typeof targetLang === "string") {
      const l = targetLang.toLowerCase();
      if (l.includes("arab") || l === "ar") langCode = "ar";
      else if (l.includes("fran") || l === "fr") langCode = "fr";
    }
    res.json(getFallbackLessonData(level || "A1", topic || "Alphabet", langCode));
  });

  // Exams - static fallback only
  app.post("/api/exam", async (req, res) => {
    const { level, examId, targetLang } = req.body;
    let langCode = "es";
    if (typeof targetLang === "string") {
      const l = targetLang.toLowerCase();
      if (l.includes("arab") || l === "ar") langCode = "ar";
      else if (l.includes("fran") || l === "fr") langCode = "fr";
    }
    res.json(getFallbackExam(level || "A1", examId || 1, langCode));
  });

  // CV - static fallback only
  app.post("/api/cv", async (req, res) => {
    const { name, email, role, city, edu, skills, exp } = req.body;
    const cvHtml = `<div style="font-family:system-ui;padding:40px;max-width:800px;margin:0 auto;border:1px solid #e2e8f0;border-radius:16px"><h1>${name || "Candidato"}</h1><p>${role || "Profesional"} — ${city || "España"}</p><p>${email || ""}</p><h2>Formación</h2><p>${edu || ""}</p><h2>Habilidades</h2><p>${skills || ""}</p><h2>Experiencia</h2><p>${exp || ""}</p></div>`;
    res.json({ cvHtml });
  });

  // Chat Correct - uses AI moderation check only
  app.post("/api/chat-correct", async (req, res) => {
    const { message } = req.body;
    const { isBad } = await moderatePostWithAI(message);
    if (isBad) return res.json({ tip: "⚠️ Mensaje bloqueado por contener palabras prohibidas." });
    res.json({ tip: null });
  });

  // Serve frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
}

startServer();
