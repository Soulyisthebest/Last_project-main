export interface ExamQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  tip: string;
  tarea: number; // Tarea 1 to 5
}

export function getFallbackExam(level: string, examId: number = 1, lang: string = "es"): { examTitle: string; questions: ExamQuestion[] } {
  // Let's create custom questions for the levels.
  // Below we define the 40 questions for the selected level.
  // They increase in difficulty through Tareas 1 to 5 as in SIELE.

  let questions: ExamQuestion[] = [];
  
  if (level === "A1") {
    questions = [
      // Tarea 1 (A1: Vocabulario básico y mensajes cortos)
      {
        tarea: 1,
        question: "Hola, me llamo Carlos. ¿Y tú cómo __________ llamas?",
        options: ["me", "te", "se", "nos"],
        correctIndex: 1,
        tip: "Para la segunda persona (tú) del verbo pronominal 'llamarse', usamos el pronombre 'te' (tú te llamas)."
      },
      {
        tarea: 1,
        question: "Mis padres viven en Marruecos, pero yo __________ en Madrid.",
        options: ["vivo", "vives", "vive", "vivimos"],
        correctIndex: 0,
        tip: "La primera persona del singular (yo) del verbo 'vivir' en presente es 'vivo'."
      },
      {
        tarea: 1,
        question: "Identifica el número correcto para completar: Diez + Siete = __________",
        options: ["Dieciséis", "Diecisiete", "Dieciocho", "Diecinueve"],
        correctIndex: 1,
        tip: "Diez (10) más Siete (7) equivale a Diecisiete (17)."
      },
      {
        tarea: 1,
        question: "En la biblioteca, debemos estar en __________.",
        options: ["silencio", "ruido", "gritos", "música"],
        correctIndex: 0,
        tip: "'Estar en silencio' es la expresión adecuada para indicar un ambiente tranquilo sin ruido."
      },
      {
        tarea: 1,
        question: "Mañana voy al supermercado porque no tengo __________ en la cocina.",
        options: ["comida", "coches", "muebles", "libros"],
        correctIndex: 0,
        tip: "En un supermercado compramos alimentos, es decir, 'comida'."
      },
      {
        tarea: 1,
        question: "El hermano de mi madre es mi __________.",
        options: ["abuelo", "tío", "primo", "sobrino"],
        correctIndex: 1,
        tip: "El hermano de tu madre o de tu padre es tu tío en el vocabulario familiar."
      },
      {
        tarea: 1,
        question: "Para saludar a alguien por la mañana a las 9:00 AM, decimos: «¡Buenos __________!»",
        options: ["noches", "tardes", "periodos", "días"],
        correctIndex: 3,
        tip: "Usamos la fórmula 'Buenos días' para saludar desde el amanecer hasta el mediodía."
      },
      {
        tarea: 1,
        question: "Sofía es una chica muy __________. Siempre ayuda a sus amigos.",
        options: ["simpática", "simpático", "simpáticos", "simpáticas"],
        correctIndex: 0,
        tip: "El adjetivo debe concordar en género y número con el sujeto femenino singular 'Sofía' (simpática)."
      },

      // Tarea 2 (A2: Rutinas cotidianas y diálogos breves)
      {
        tarea: 2,
        question: "Normalmente __________ a las 7 de la mañana para ir a clase.",
        options: ["me despierto", "te despiertas", "se despierta", "nos despertamos"],
        correctIndex: 0,
        tip: "El verbo 'despertarse' es reflexivo e irregular (e -> ie). Para 'yo' se conjuga como 'me despierto'."
      },
      {
        tarea: 2,
        question: "Ayer mi hermano __________ una carta muy bonita a sus abuelos.",
        options: ["escribió", "escribía", "escribe", "escribirá"],
        correctIndex: 0,
        tip: "Usamos el Pretérito Indefinido 'escribió' para una acción puntual terminada ayer en el pasado."
      },
      {
        tarea: 2,
        question: "Este restaurante es __________ caro que el otro. Cuesta el doble.",
        options: ["tan", "más", "menos", "como"],
        correctIndex: 1,
        tip: "Para comparar superioridad usamos la estructura 'más + adjetivo + que'."
      },
      {
        tarea: 2,
        question: "¿Dónde está mi bolígrafo? — No __________ encuentro por ningún sitio.",
        options: ["lo", "la", "los", "las"],
        correctIndex: 0,
        tip: "El objeto directo 'mi bolígrafo' es masculino y singular, por lo que se sustituye por el pronombre 'lo'."
      },
      {
        tarea: 2,
        question: "Todos los fines de semana __________ al parque a jugar al fútbol.",
        options: ["vamos", "fui", "iremos", "vayan"],
        correctIndex: 0,
        tip: "Para acciones habituales o rutinas del presente usamos el presente de indicativo: 'vamos'."
      },
      {
        tarea: 2,
        question: "A mí no __________ gustan las películas de terror. Prefiero la comedia.",
        options: ["me", "te", "le", "nos"],
        correctIndex: 0,
        tip: "Para expresar gustos propios con 'A mí', usamos el pronombre 'me' (A mí me gustan)."
      },
      {
        tarea: 2,
        question: "El español se habla __________ muchos países de América Latina.",
        options: ["para", "por", "en", "con"],
        correctIndex: 2,
        tip: "La preposición de lugar para indicar ubicación geográfica es 'en'."
      },
      {
        tarea: 2,
        question: "¿Qué hora es? — __________ las tres y media.",
        options: ["Es", "Son", "Hay", "Está"],
        correctIndex: 1,
        tip: "Para dar la hora en plural (de 2 a 12) empleamos el verbo ser en tercera persona del plural: 'Son'."
      },

      // Tarea 3 (B1: Situaciones de viaje, gustos y tiempos del pasado)
      {
        tarea: 3,
        question: "Cuando yo __________ niño, __________ a la playa todos los veranos con mi familia.",
        options: ["fui / iba", "era / iba", "era / fui", "fui / fui"],
        correctIndex: 1,
        tip: "Para describir estados o rutinas habituales continuas en el pasado usamos el Pretérito Imperfecto ('era' e 'iba')."
      },
      {
        tarea: 3,
        question: "Espero que mañana __________ buen tiempo para salir de excursión.",
        options: ["hace", "haga", "hiciera", "hará"],
        correctIndex: 1,
        tip: "La estructura 'Espero que...' expresa deseo y requiere obligatoriamente el uso del Presente de Subjuntivo ('haga')."
      },
      {
        tarea: 3,
        question: "Si yo __________ más tiempo libre, estudiaría otro idioma como el italiano.",
        options: ["tengo", "tuve", "tuviera", "tendría"],
        correctIndex: 2,
        tip: "En condicionales hipotéticas sobre el presente usamos: Si + Pretérito Imperfecto de Subjuntivo ('tuviera') + Condicional Simple ('estudiaría')."
      },
      {
        tarea: 3,
        question: "Hemos comprado un billete de tren __________ ir a Sevilla este fin de semana.",
        options: ["por", "para", "con", "en"],
        correctIndex: 1,
        tip: "La preposición 'para' expresa la finalidad o propósito de una acción ('para ir a Sevilla')."
      },
      {
        tarea: 3,
        question: "No creo que Luis __________ razón en esta fuerte discusión.",
        options: ["tiene", "tenga", "tuviera", "tendrá"],
        correctIndex: 1,
        tip: "La opinión negativa 'No creo que...' introduce opinión subjetiva que requiere el Presente de Subjuntivo ('tenga')."
      },
      {
        tarea: 3,
        question: "Madrid __________ en el centro de España, y _________ una ciudad muy activa.",
        options: ["es / está", "está / es", "está / está", "es / es"],
        correctIndex: 1,
        tip: "Usamos 'estar' para indicar localización geográfica, y 'ser' para definir atributos esenciales de una ciudad."
      },
      {
        tarea: 3,
        question: "Le di el libro a Juan. → Se __________ di por la tarde.",
        options: ["lo le", "le lo", "se lo", "se le"],
        correctIndex: 2,
        tip: "Cuando coinciden los pronombres le (CI) y lo (CD), el pronombre indirecto le se trasforma en 'se' por eufonía."
      },
      {
        tarea: 3,
        question: "Ayer __________ un accidente de tráfico en la avenida principal de la ciudad.",
        options: ["hubo", "había", "ha habido", "hubiera"],
        correctIndex: 0,
        tip: "Para acontecimientos históricos puntuales o hechos ocurridos de golpe en el pasado usamos el indefinido de haber: 'hubo'."
      },

      // Tarea 4 (B2: Expresión de hipótesis, de valoración y conectores complejos)
      {
        tarea: 4,
        question: "Es una pena que Manuel no __________ venir con nosotros a la cena de gala.",
        options: ["pudo", "puede", "pueda", "podría"],
        correctIndex: 2,
        tip: "Las estructuras de sentimiento o valoración ('Es una pena que...') exigen obligatoriamente subjuntivo en la oración subordinada."
      },
      {
        tarea: 4,
        question: "Te llamaré por teléfono en cuanto __________ a mi casa.",
        options: ["llegue", "llegará", "llego", "llegaría"],
        correctIndex: 0,
        tip: "La conjunción temporal 'en cuanto' referida al futuro exige el uso de la forma en subjuntivo ('llegue')."
      },
      {
        tarea: 4,
        question: "Aunque __________ lloviendo con mucha fuerza, iremos a pasear por el bosque.",
        options: ["estará", "esté", "está", "estaba"],
        correctIndex: 1,
        tip: "Con 'Aunque', el uso del subjuntivo ('esté') indica que el obstáculo es menos real, hipotético o irrelevante para el hablante."
      },
      {
        tarea: 4,
        question: "__________ de que el examen comience, repasa bien todas las conjugaciones de verbos.",
        options: ["Antes", "Después", "Antes de", "Desde"],
        correctIndex: 2,
        tip: "La locución conjuntiva completa recomendada es 'Antes de que' seguido de subjuntivo."
      },
      {
        tarea: 4,
        question: "No me gusta vivir aquí; si me cambiara de ciudad, me __________ a Málaga.",
        options: ["iré", "vaya", "iría", "fui"],
        correctIndex: 2,
        tip: "Si + subjuntivo se correlaciona con condicional simple en la oración principal para expresar hipótesis improbables."
      },
      {
        tarea: 4,
        question: "El incendio fue apagado rápidamente __________ los valientes bomberos locales.",
        options: ["para", "por", "de", "con"],
        correctIndex: 1,
        tip: "El complemento agente en la oración pasiva analítica es introducido siempre por la preposición 'por'."
      },
      {
        tarea: 4,
        question: "Busco un diccionario castellano que __________ todas las definiciones de modismos.",
        options: ["contiene", "contenga", "contendría", "contuvo"],
        correctIndex: 1,
        tip: "Dado que el antecedente es desconocido, indeterminado o incierto ('un diccionario que...'), usamos subjuntivo ('contenga')."
      },
      {
        tarea: 4,
        question: "No solo es inteligente, __________ que también trabaja muy duro.",
        options: ["sino", "pero", "sino que", "aunque"],
        correctIndex: 2,
        tip: "La estructura correlativa adversativa es 'No solo... sino que también' cuando introduce una nueva oración con verbo conjugado."
      },

      // Tarea 5 (C1/C2: Comprensión estilística, lenguaje formal y matices)
      {
        tarea: 5,
        question: "Dudo mucho que si hubieras venido antes, __________ salvar este viejo mueble.",
        options: ["hubieras podido", "habrías podido", "pudiste", "hayan podido"],
        correctIndex: 0,
        tip: "En construcciones condicionales pasadas irreales, el subjuntivo pluscuamperfecto ('hubieras podido') es el tiempo requerido tras 'Dudo que...'."
      },
      {
        tarea: 5,
        question: "A lo largo de su dilatada trayectoria, el escritor se ha caracterizado por __________ de convencionalismos literarios.",
        options: ["prescindir", "pretender", "provenir", "persistir"],
        correctIndex: 0,
        tip: "'Prescindir de' significa descartar o no contar con algo, lo cual encaja coherentemente en el contexto del estilo del escritor."
      },
      {
        tarea: 5,
        question: "Por mucho que __________ esforzarse, la dificultad de este enigma lingüístico era insuperable.",
        options: ["quisiera", "quiere", "quería", "erró"],
        correctIndex: 0,
        tip: "'Por mucho que' seguido de concesión en el pasado requiere el imperfecto de subjuntivo ('quisiera')."
      },
      {
        tarea: 5,
        question: "El conferenciante habló con tanta elocuencia que de inmediato __________ a toda la audiencia.",
        options: ["se puso en evidencia", "se metió en el bolsillo", "puso el grito en el cielo", "tomó el pelo"],
        correctIndex: 1,
        tip: "La expresión idiomática 'meterse a alguien en el bolsillo' significa ganarse la simpatía y el afecto de alguien por completo."
      },
      {
        tarea: 5,
        question: "Apenas se anunció el veredicto del certamen literario, los periodistas __________ al ganador.",
        options: ["abrumaron", "abrumó", "abrumas", "abrumaban"],
        correctIndex: 0,
        tip: "Acción repentina e inmediata en el pasado que requiere plural coordinado: 'Apenas... los periodistas abrumaron...'."
      },
      {
        tarea: 5,
        question: "Me molesta de sobremanera que la gente se __________ de las desgracias ajenas.",
        options: ["alegra", "alegre", "alegrará", "alegraran"],
        correctIndex: 1,
        tip: "El verbo de afección emotiva 'molestar que...' exige de forma estricta subjuntivo ('se alegre')."
      },
      {
        tarea: 5,
        question: "__________ de lo pactado verbalmente en la última sesión académica, daremos el curso por concluido.",
        options: ["Dado", "A tenor", "Conforme", "A pesar"],
        correctIndex: 1,
        tip: "La locución prepositiva culta 'A tenor de' expresa conformidad o coincidencia con lo establecido o dicho."
      },
      {
        tarea: 5,
        question: "Ojalá el año que viene la academia __________ otorgarme una beca doctoral en lexicografía.",
        options: ["decida", "decide", "decidiera", "decidirá"],
        correctIndex: 0,
        tip: "La interjección de deseo 'Ojalá' combinada con futuro próximo o realizable se construye con presente de subjuntivo ('decida')."
      }
    ];
  } else {
    // For A2, B1, B2, C1, standard progressive levels using standard structure.
    // Let's build a magnificent comprehensive set of 40 custom questions that works for any chosen scale level,
    // tailored to increase in complexity through tasks!
    questions = [
      // Tarea 1: Comprensión de textos breves y vocabulario descriptivo (8 Ques)
      {
        tarea: 1,
        question: "«Por favor, mantenga la puerta cerrada al salir para evitar la pérdida de calor.» — Este aviso indica que:",
        options: ["Se debe cerrar la puerta inmediatamente después de pasar.", "La puerta debe permanecer abierta durante las clases.", "Está prohibido salir por esta puerta.", "Hay que abrir la puerta para refrescar la sala."],
        correctIndex: 0,
        tip: "El aviso solicita cerrar la puerta al salir para mantener la temperatura idónea del recinto."
      },
      {
        tarea: 1,
        question: "Cuando fuimos de excursión, el sendero era muy __________ y lleno de curvas cerradas.",
        options: ["estrecho", "ancho", "plano", "corto"],
        correctIndex: 0,
        tip: "Un sendero con curvas cerradas e irregular suele caracterizarse por ser 'estrecho' (poco espacio)."
      },
      {
        tarea: 1,
        question: "«Estimado pasajero, le recordamos que no está permitido consumir alimentos en el vagón.» — El significado es:",
        options: ["Se puede comer solo en algunos vagones.", "Está totalmente prohibido comer a bordo.", "Debes comprar comida en el tren.", "El tren reparte comida gratis."],
        correctIndex: 1,
        tip: "'No está permitido consumir alimentos' es sinónimo de prohibición total de comer."
      },
      {
        tarea: 1,
        question: "El profesor de español habla de forma muy pausada __________ que todos los alumnos le entiendan bien.",
        options: ["con el fin de", "por", "de", "con"],
        correctIndex: 0,
        tip: "La locución 'con el fin de' introduce la finalidad, concordando perfectamente con el infinitivo posterior."
      },
      {
        tarea: 1,
        question: "Felipe tiene muy mal humor; siempre está __________ con todo el mundo por cualquier tontería.",
        options: ["discutiendo", "discutido", "discutir", "discuta"],
        correctIndex: 0,
        tip: "Para denotar una acción repetida o continua que se realiza en el presente, se usa la perífrasis 'estar + gerundio' ('discutiendo')."
      },
      {
        tarea: 1,
        question: "Los científicos __________ una serie de experimentos lingüísticos para estudiar la evolución de las lenguas.",
        options: ["llevaron a cabo", "llevaron por si acaso", "llevaron atrás", "llevaron de paso"],
        correctIndex: 0,
        tip: "La locución verbal 'llevar a cabo' significa realizar, efectuar o ejecutar una tarea."
      },
      {
        tarea: 1,
        question: "La biblioteca de la universidad está __________ de obras clásicas del Siglo de Oro español.",
        options: ["repleta", "vacía", "cansada", "ocupando"],
        correctIndex: 0,
        tip: "Estar 'repleto/a de' significa estar completamente lleno de algo."
      },
      {
        tarea: 1,
        question: "«Hola Ana, te dejo esta nota porque me he ido a comprar. Volveré en media hora. No me esperes para cenar.» — Según la nota:",
        options: ["Ana debe ir al supermercado con el emisor.", "El emisor cenará más tarde o fuera de casa.", "Ana tiene que preparar la cena de inmediato.", "El emisor tardará varias horas en regresar."],
        correctIndex: 1,
        tip: "La instrucción 'no me esperes para cenar' significa que el emisor asume que cenará más tarde o por su cuenta."
      },

      // Tarea 2: Diálogos prácticos, expresiones de tiempo e interacción (8 Ques)
      {
        tarea: 2,
        question: "— ¿Has visto mis llaves por ahí? — Sí, las _________ encima de la cómoda del salón esta mañana.",
        options: ["dejabas", "dejaste", "has dejado", "dejarás"],
        correctIndex: 1,
        tip: "Para referirse a una acción puntual terminada en una franja resuelta en el pasado, se emplea el pretérito indefinido: 'dejaste'."
      },
      {
        tarea: 2,
        question: "Llevo estudiando español __________ tres años y ya casi me expreso como un nativo.",
        options: ["desde", "desde hace", "hace", "por"],
        correctIndex: 1,
        tip: "'Desde hace + período temporal' describe una acción duradera iniciada en el pasado que perdura e interactúa en el presente."
      },
      {
        tarea: 2,
        question: "Este examen es __________ más complejo que el ejercicio que practicamos ayer en el aula virtual.",
        options: ["tanto", "bastante", "demasiado de", "muy"],
        correctIndex: 1,
        tip: "Se puede matizar un comparativo de superioridad utilizando la palabra 'bastante' ('bastante más complejo')."
      },
      {
        tarea: 2,
        question: "Me sorprende de que no __________ venido a la reunión informativa sobre los cursos de gramática castellana.",
        options: ["hayan", "hacer", "habiendo", "hubieran"],
        correctIndex: 0,
        tip: "Las estructuras de reacción afectiva ('Me sorprende de que...') exigen subjuntivo del pretérito perfecto ('hayan venido')."
      },
      {
        tarea: 2,
        question: "— ¿Le compraste el diccionario a tu hija? — Sí, se _________ compré en la librería del centro.",
        options: ["lo", "le", "la", "se lo"],
        correctIndex: 3,
        tip: "Sustituyendo el objeto directo (el diccionario -> lo) y el indirecto (a tu hija -> le/se), la combinación correcta es 'se lo'."
      },
      {
        tarea: 2,
        question: "El mes que viene, si todo sale según lo previsto, __________ un viaje literario a Salamanca.",
        options: ["hizco", "haré", "haga", "haciendo"],
        correctIndex: 1,
        tip: "Para expresar acciones futuras seguras o proyectos planificados usamos el futuro simple ('haré')."
      },
      {
        tarea: 2,
        question: "No me gusta que __________ con esa actitud tan pesimista ante los retos educativos.",
        options: ["vengas", "vienes", "vendrás", "viniste"],
        correctIndex: 0,
        tip: "La expresión 'No me gusta que...' introduce valoración emotiva sobre un tercero, exigiendo subjuntivo ('vengas')."
      },
      {
        tarea: 2,
        question: "Nuestros abuelos __________ en un pueblo costero muy tranquilo antes de trasladarse definitivamente a la capital.",
        options: ["vivían", "vivieron", "viven", "vivan"],
        correctIndex: 0,
        tip: "Usamos el Pretérito Imperfecto ('vivían') para describir estados de vida o rutinas continuas y prolongadas en el pasado."
      },

      // Tarea 3: Comprensión de textos argumentales y nexos sintácticos (8 Ques)
      {
        tarea: 3,
        question: "A pesar de que el profesor __________ de forma reiterada la regla del subjuntivo, algunos alumnos siguieron dudando.",
        options: ["explicaba", "explicó", "explique", "explicará"],
        correctIndex: 1,
        tip: "Con hechos del pasado concretados, 'A pesar de que' se construye con el indicativo ('explicó')."
      },
      {
        tarea: 3,
        question: "Busco una novela contemporánea que __________ reflexiones existenciales del escritor Miguel de Unamuno.",
        options: ["aborda", "aborde", "abordase", "abordará"],
        correctIndex: 1,
        tip: "Al definir un objeto insustancial o no específico que se busca ('una novela que...'), la sintaxis correcta requiere el subjuntivo ('aborde')."
      },
      {
        tarea: 3,
        question: "Salió disparado de la biblioteca corporativa con prisa, __________ a que ya pasaba de la hora del cierre de las instalaciones.",
        options: ["debido", "gracias", "por", "dado"],
        correctIndex: 0,
        tip: "La locución causal exacta es 'debido a que' para introducir el motivo de una consecuencia."
      },
      {
        tarea: 3,
        question: "No dudamos de que el método interactivo de enseñanza __________ el aprendizaje de manera exponencial.",
        options: ["facilita", "facilite", "facilitará", "facilitaría"],
        correctIndex: 0,
        tip: "La certeza expresada de manera afirmativa ('No dudamos de que...') introduce hechos objetivos que requieren indicativo ('facilita')."
      },
      {
        tarea: 3,
        question: "Si hubieses invertido diez minutos diarios en memorizar palabras, hoy __________ un vocabulario extraordinario.",
        options: ["tendrás", "tendrías", "tuvieses", "tengas"],
        correctIndex: 1,
        tip: "En condicionales mixtas (Si + pluscuamperfecto de subjuntivo), la consecuencia en el presente se formula mediante condicional simple ('tendrías')."
      },
      {
        tarea: 3,
        question: "La obra literaria __________ por el ilustre autor fue finalmente premiada con el lauro de letras de Madrid.",
        options: ["escribida", "escrita", "escrita de nuevo", "escribiendo"],
        correctIndex: 1,
        tip: "El participio de carácter pasivo e irregular del verbo escribir es 'escrita'."
      },
      {
        tarea: 3,
        question: "Es impensable que un alumno de nivel avanzado no __________ distinguir correctamente la diéresis de la tilde.",
        options: ["sepa", "sabe", "sabrá", "supiera"],
        correctIndex: 0,
        tip: "Las estructuras impersonales que declaran juicios de valor negativos ('Es impensable que...') rigen presente de subjuntivo ('sepa')."
      },
      {
        tarea: 3,
        question: "Por favor, cuando __________ de redactar el ensayo lingüístico, envíelo al correo del tutor para su revisión.",
        options: ["terminará", "termine", "termina", "terminas"],
        correctIndex: 1,
        tip: "En cláusulas temporales proyectadas al futuro ('cuando...'), el castellano exige de forma restrictiva el uso de subjuntivo ('termine')."
      },

      // Tarea 4: Expresiones de hipótesis, valoración subjetiva y pragmática (8 Ques)
      {
        tarea: 4,
        question: "Se comporta como si __________ el dueño absoluto del departamento de literatura comparada de la institución.",
        options: ["es", "sea", "fuera", "fuera sido"],
        correctIndex: 2,
        tip: "La locución adverbial/comparativa 'como si' rige de forma exclusiva e invariable el Pretérito Imperfecto de Subjuntivo ('fuera' o 'fuese')."
      },
      {
        tarea: 4,
        question: "Le aconsejé de manera asertiva que __________ de inmediato de estudiar de memoria sin comprender los conceptos.",
        options: ["deje", "dejara", "dejaría", "dejase de"],
        correctIndex: 1,
        tip: "Un consejo o recomendación en estilo indirecto en el pasado exige el uso de pretérito imperfecto de subjuntivo ('dejara')."
      },
      {
        tarea: 4,
        question: "Por mucho que __________ empeño en convencerle por la fuerza, él tiene opiniones inquebrantables.",
        options: ["pongas", "pones", "pondrás", "pusiste"],
        correctIndex: 0,
        tip: "'Por mucho que' seguido de una hipótesis o idea concesiva en el presente requiere subjuntivo para rebajar la realidad descrita."
      },
      {
        tarea: 4,
        question: "El ensayo sobre el Quijote que redactaste ayer consta __________ tres bloques argumentativos nítidos.",
        options: ["por", "de", "con", "en"],
        correctIndex: 1,
        tip: "El verbo regido pronominal o transitivo 'constar' siempre requiere la preposición obligatoria 'de' ('constar de')."
      },
      {
        tarea: 4,
        question: "Ningún alumno aprobará la escala oficial de suficiencia a menos que __________ un compromiso continuado con las lecturas.",
        options: ["demuestra", "demuestre", "demostrará", "demostró"],
        correctIndex: 1,
        tip: "La locución restrictiva condicional 'a menos que' rige obligatoriamente el subjuntivo ('demuestre')."
      },
      {
        tarea: 4,
        question: "Cuanto más tiempo __________ a la práctica reflexiva de la escritura, mejores serán vuestras producciones.",
        options: ["dedican", "dediquen", "dedicarán", "dedicaron"],
        correctIndex: 1,
        tip: "La estructura progresiva o proporcional 'Cuanto más... que' referida al futuro exige el uso de subjuntivo ('dediquen')."
      },
      {
        tarea: 4,
        question: "Me da rabia que la gente me __________ de mentir cuando siempre digo la verdad abiertamente.",
        options: ["tacha", "tache", "tachará", "tachó"],
        correctIndex: 1,
        tip: "Las estructuras de reacción temperamental ('Me da rabia que...') rigen inexorablemente el uso del subjuntivo ('tache')."
      },
      {
        tarea: 4,
        question: "Nos encontramos con un escollo lingüístico el cual impedía la traducción __________ fidelidad del poema antiguo.",
        options: ["con", "sin", "en", "para"],
        correctIndex: 0,
        tip: "El modismo o régimen para indicar modo o instrumento en la fidelidad expresiva es 'con' ('con fidelidad')."
      },

      // Tarea 5: Textos complejos de opinión, estilística avanzada y modismos (8 Ques)
      {
        tarea: 5,
        question: "De haber sabido que el simposio sobre retórica clásica castellana era tan relevante, __________ venido sin la menor duda.",
        options: ["habería", "habría", "hubiera", "habré"],
        correctIndex: 1,
        tip: "La construcción condicional de pasado implícito 'De haber + participio' se correlaciona con condicional compuesto ('habría venido')."
      },
      {
        tarea: 5,
        question: "Sus palabras de disculpa sonaron artificiales; era obvio que estaba __________ el papel para quedar bien ante el decano.",
        options: ["fingiendo", "actuando", "interpretando", "parodiando"],
        correctIndex: 2,
        tip: "En lengua culta, 'interpretar un papel' es la expresión idiomática adecuada para referirse a la actuación figurada o insincera."
      },
      {
        tarea: 5,
        question: "No consiento bajo ningún concepto que se __________ mis méritos académicos en el dictamen definitivo del jurado de letras.",
        options: ["ninguneen", "ningunea", "ningunearán", "ninguneas"],
        correctIndex: 0,
        tip: "La desaprobación categórica ('No consiento que...') rige el subjuntivo ('ninguneen'). El término coloquial culto 'ningunear' significa menospreciar."
      },
      {
        tarea: 5,
        question: "A la científica le costó horrores demostrar su tesis, pero tras años de arduo análisis logró __________ con la victoria final.",
        options: ["ponerse", "alzarse", "hacerse", "tomarse"],
        correctIndex: 1,
        tip: "La locución idiomática culta para indicar obtención exitosa o triunfo formal es 'alzarse con la victoria'."
      },
      {
        tarea: 5,
        question: "La comisión resolvió posponer el simposio de filología __________ de los informes de seguridad desfavorables recibidos.",
        options: ["a la vista", "con motivo", "en base", "pese a"],
        correctIndex: 0,
        tip: "La construcción recomendada por la RAE aplicable en este contexto de justificación directa es 'a la vista de'."
      },
      {
        tarea: 5,
        question: "No es que no __________ estudiar la sintaxis del español peninsular, es que carecemos de materiales actualizados en este centro.",
        options: ["queremos", "queramos", "quisiéramos", "querríamos"],
        correctIndex: 1,
        tip: "La locución correctiva 'No es que + subjuntivo, es que + indicativo' exige el subjuntivo ('queramos') para negar un pretexto o causa."
      },
      {
        tarea: 5,
        question: "Tuvieron que suspender provisionalmente las excavaciones arqueológicas porque no __________ con la autorización firmada.",
        options: ["disponían", "contaban", "tenían", "poseían"],
        correctIndex: 1,
        tip: "El régimen gramatical correcto es 'contar con' ('contaban con la autorización'). 'Disponer' requiere 'de'."
      },
      {
        tarea: 5,
        question: "Queda prohibido divulgar los resultados del certamen literario nacional hasta que la academia los __________ de modo oficial.",
        options: ["publique", "publicará", "publica", "publicó"],
        correctIndex: 0,
        tip: "Las construcciones de límite temporal orientadas al devenir futuro ('hasta que...') requieren restrictivamente el subjuntivo ('publique')."
      }
    ];
  }

  // Apply deterministic variations based on examId (1 to 30) for offline realism
  if (examId > 1) {
    const names = ["Carlos", "Sofía", "Pedro", "María", "David", "Elena", "Javier", "Lucía", "Manuel", "Laura", "Andrés", "Carmen", "Fernando", "Isabel", "Diego", "Ana"];
    const cities = ["Madrid", "Barcelona", "Granada", "Valencia", "Sevilla", "Salamanca", "Santiago", "Alicante", "Zaragoza", "Murcia", "Málaga", "Bilbao"];
    const subjects = ["español", "castellano", "idioma", "vocabulario", "lenguaje"];
    
    questions = questions.map((q, idx) => {
      let newQ = { ...q };
      const nameReplace = names[(examId + idx) % names.length];
      const cityReplace = cities[(examId + idx) % cities.length];
      const subjectReplace = subjects[(examId + idx) % subjects.length];
      
      newQ.question = newQ.question
        .replace(/Carlos/g, nameReplace)
        .replace(/Sofía/g, nameReplace)
        .replace(/Madrid/g, cityReplace)
        .replace(/Barcelona/g, cityReplace)
        .replace(/Sevilla/g, cityReplace)
        .replace(/español/g, subjectReplace);
        
      return newQ;
    });
  }

  return {
    examTitle: `Examen Oficial de Nivel SIELE: ${level} (Examen ${examId})`,
    questions
  };
}
