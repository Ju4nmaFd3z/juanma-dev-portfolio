
export const translations = {
  es: {
    nav: {
      home: 'Inicio',
      about: 'Sobre mí',
      projects: 'Proyectos',
      journey: 'Trayectoria',
      contact: 'Contacto',
      downloadCV: 'CV'
    },
    hero: {
      role: 'Técnico SMR & Estudiante de DAM',
      title1: 'Juan Manuel',
      title2: 'Fernández',
      desc: 'Técnico SMR reconvertido a {bold}. Combino la precisión técnica de los sistemas con la creatividad del software para resolver problemas reales.',
      descBold: 'Desarrollador Multiplataforma',
      cta: 'HABLEMOS',
      cv: 'DESCARGAR CV'
    },
    about: {
      badge: 'El origen de todo',
      title1: 'PASIÓN POR EL',
      title2: 'CACHARREO.',
      desc1: 'El {span1} es lo que me ha gustado {span2}. Lo que empezó abriendo equipos por curiosidad es hoy la base de mi {span3}.',
      desc1Span1: 'cacharreo',
      desc1Span2: 'desde que tengo uso de razón',
      desc1Span3: 'futura profesión',
      desc2: 'Tras estudiar {strong1}, me di cuenta de que el desarrollo no es solo picar código; mi curiosidad me empuja a querer saber siempre qué ocurre "debajo del capó". Mi tiempo en {strong2} me enseñó a mantener la calma y a buscar soluciones con paciencia cuando la tecnología decide no colaborar.',
      desc3: 'Ahora, en 1º de DAM, estoy volcando esa experiencia en aprender a construir {span}. No busco solo que compile; me motiva la elegancia de un código bien estructurado y entender a fondo el porqué de cada línea que escribo.',
      desc3Span: 'software sólido y elegante',
      stats: [
        { label: 'Nota Media SMR', value: '9.2', sub: 'Excelencia técnica' },
        { label: 'Movilidad', value: 'Italia', sub: 'Erasmus+ Campobasso' },
        { label: 'Certificación', value: 'CCNA', sub: 'Cisco Certified' }
      ],
      skills: 'Hard Skills',
      skillsList: [
        { name: 'Arquitectura de Sistemas', level: '85%' },
        { name: 'Desarrollo Java/Backend', level: '70%' },
        { name: 'Gestión de Redes & SQL', level: '80%' },
        { name: 'Resolución de Problemas', level: '95%' }
      ],
      quote: '"Para construir algo que perdure, primero hay que saber cómo se sostiene desde abajo."',
      status: 'En formación y abierto a retos'
    },
    projects: {
      title: 'Proyectos',
      subtitle: 'Bitácora de mi desarrollo profesional',
      github: 'Ver GitHub',
      items: [
        {
          title: "Próximamente...",
          desc: "Como alumno de 1º de DAM, estoy desarrollando mis primeras aplicaciones nativas y sistemas backend eficientes. Pronto verás aquí mis repositorios destacados.",
          tech: ["Java", "SQL", "Docker"]
        },
        {
          title: "Infraestructura & Redes",
          desc: "Configuración de redes y protocolos de enrutamiento basada en la certificación Cisco CCNA. Implementación de seguridad, switching y mantenimiento de infraestructuras de comunicación y sistemas.",
          tech: ["Cisco CCNA", "Linux", "Seguridad", "Hardware"]
        }
      ]
    },
    experience: {
      title: 'Trayectoria Profesional',
      footer: 'Buscando nuevos retos para aplicar mi base de SMR en el desarrollo de software...',
      items: [
        {
          role: "Técnico de Soporte e Infraestructura IT",
          type: "Prácticas Erasmus+",
          company: "Music Store Campobasso",
          location: "Campobasso, Italia",
          period: "Marzo 2025 - Junio 2025",
          points: [
            "Atención al cliente y asistente de ventas.",
            "Gestión de stock.",
            "Mantenimiento de bases de datos."
          ],
          tags: ["Internacional", "Ventas", "Gestión de Stock", "Bases de Datos"]
        }
      ]
    },
    education: {
      title: 'Formación Académica',
      items: [
        {
          degree: "Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)",
          school: "CPIFP Alan Turing",
          period: "2025 - Presente",
          status: "En curso",
          desc: "Formación centrada en el desarrollo, implementación y mantenimiento de aplicaciones multiplataforma, gestión de bases de datos y usabilidad."
        },
        {
          degree: "Grado Medio en Sistemas Microinformáticos y Redes (SMR)",
          school: "CPIFP Alan Turing",
          period: "2023 - 2025",
          status: "Completado",
          desc: "Instalación y configuración de equipos, mantenimiento de redes locales y seguridad informática. Enfoque práctico en troubleshooting y mejora de sistemas.",
          highlights: ["Certificación Cisco CCNA (2024)", "Nota Media Final: 9.2"]
        }
      ]
    },
    contact: {
      title: 'Pongámonos en contacto',
      subtitle: '¿Tienes un proyecto interesante, una oferta de prácticas o simplemente quieres charlar sobre tecnología? Estaré encantado de escucharte.',
      infoTitle: 'Información Directa',
      location: 'Málaga, España',
      labels: {
        email: 'Email',
        phone: 'WhatsApp / Tel',
        location: 'Ubicación'
      },
      form: {
        name: 'Tu Nombre',
        email: 'Email',
        message: 'Mensaje',
        placeholderName: 'Escribe aquí',
        placeholderEmail: 'hola@ejemplo.com',
        placeholderMsg: '¿En qué puedo ayudarte?',
        submit: 'Enviar Mensaje',
        sent: '¡Abriendo cliente de correo!'
      }
    },
    footer: {
      role: 'Técnico SMR & Estudiante de DAM.'
    },
    ai: {
      label: 'Asistente Virtual',
      status: 'En línea',
      placeholder: 'Pregunta sobre Juanma...',
      prompt: 'Potenciado por Gemini AI',
      tooltip: '¿Alguna duda? Pregúntame',
      errorTitle: 'Asistente fuera de servicio',
      errorDesc: 'Parece que hay un problema con la configuración de la IA. Por favor, revisa la API Key en el panel de control o inténtalo más tarde.',
      greetings: [
        "¡Hola! Soy el asistente virtual de Juanma. Estoy aquí para ayudarte a conocer mejor su perfil profesional. ¿Qué te gustaría saber sobre él?",
        "¡Buenas! Como asistente de Juanma, puedo informarte sobre sus proyectos, habilidades o formación. ¿Hablamos?",
        "¡Hola! Tengo acceso a la trayectoria de Juanma para resolver cualquier duda que tengas sobre su trabajo. ¿En qué puedo ayudarte hoy?"
      ],
      system: `Eres el Asistente Virtual de Juan Manuel Fernández Rodríguez. Responde siempre en ESPAÑOL. 
      REGLA CRÍTICA DE PERSPECTIVA: Debes hablar de Juanma SIEMPRE EN TERCERA PERSONA. Nunca utilices "yo" para referirte a él. Usa expresiones como "Juanma es...", "Él domina...", "El autor de este portfolio...". Tu identidad es la de un asistente externo.
      CONTEXTO DINÁMICO: Tienes acceso a la herramienta googleSearch para buscar información actualizada en su LinkedIn (https://www.linkedin.com/in/juanma-fernández-rodríguez) and GitHub (https://github.com/Ju4nmaFd3z).
      PERFIL PRINCIPAL: Estudiante de DAM, técnico SMR (nota 9.2), CCNA. 
      Si no sabes algo, utiliza la búsqueda de Google para encontrar información reciente sobre "Juan Manuel Fernández Rodríguez DAM SMR". Responde de forma concisa, profesional y siempre en tercera persona.`
    }
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      journey: 'Journey',
      contact: 'Contact',
      downloadCV: 'CV'
    },
    hero: {
      role: 'IT Systems Tech & Software Student',
      title1: 'Juan Manuel',
      title2: 'Fernández',
      desc: 'Systems Technician transitioned into {bold}. Combining technical systems precision with software creativity to solve real-world problems.',
      descBold: 'Multiplatform Developer',
      cta: 'LET\'S TALK',
      cv: 'DOWNLOAD CV'
    },
    about: {
      badge: 'Where it all started',
      title1: 'PASSION FOR',
      title2: 'TINKERING.',
      desc1: '{span1} is what I\'ve loved {span2}. What started as opening computers out of curiosity is now the foundation of my {span3}.',
      desc1Span1: 'Tinkering',
      desc1Span2: 'for as long as I can remember',
      desc1Span3: 'future career',
      desc2: 'After studying {strong1}, I realized development isn\'t just about writing code; my curiosity drives me to always know what happens "under the hood". My time in {strong2} taught me to stay calm and find solutions with patience when technology refuses to cooperate.',
      desc3: 'Now, in my 1st year of DAM, I\'m pouring that experience into learning how to build {span}. I don\'t just want it to compile; I\'m motivated by the elegance of well-structured code and deeply understanding the "why" behind every line.',
      desc3Span: 'solid and elegant software',
      stats: [
        { label: 'SMR GPA', value: '9.2', sub: 'Technical Excellence' },
        { label: 'Mobility', value: 'Italy', sub: 'Erasmus+ Campobasso' },
        { label: 'Certification', value: 'CCNA', sub: 'Cisco Certified' }
      ],
      skills: 'Hard Skills',
      skillsList: [
        { name: 'Systems Architecture', level: '85%' },
        { name: 'Java/Backend Development', level: '70%' },
        { name: 'Network Mgmt & SQL', level: '80%' },
        { name: 'Problem Solving', level: '95%' }
      ],
      quote: '"To build something that lasts, you must first know how it is supported from below."',
      status: 'In training & open to challenges'
    },
    projects: {
      title: 'Projects',
      subtitle: 'My professional development log',
      github: 'View GitHub',
      items: [
        {
          title: "Coming Soon...",
          desc: "As a 1st year DAM student, I am developing my first native applications and efficient backend systems. Soon you will see my featured repositories here.",
          tech: ["Java", "SQL", "Docker"]
        },
        {
          title: "Infrastructure & Networks",
          desc: "Network configuration and routing protocols based on Cisco CCNA certification. Implementation of security, switching, and maintenance of communication infrastructures and systems.",
          tech: ["Cisco CCNA", "Linux", "Security", "Hardware"]
        }
      ]
    },
    experience: {
      title: 'Professional Journey',
      footer: 'Looking for new challenges to apply my Systems background in software development...',
      items: [
        {
          role: "IT Support & Infrastructure Technician",
          type: "Erasmus+ Internship",
          company: "Music Store Campobasso",
          location: "Campobasso, Italy",
          period: "March 2025 - June 2025",
          points: [
            "Customer service and sales assistant.",
            "Stock management.",
            "Database maintenance.",
          ],
          tags: ["International", "Sales", "Stock Management", "Databases"]
        }
      ]
    },
    education: {
      title: 'Academic Education',
      items: [
        {
          degree: "Higher Degree in Multiplatform Application Development (DAM)",
          school: "CPIFP Alan Turing",
          period: "2025 - Present",
          status: "In progress",
          desc: "Training focused on the development, implementation, and maintenance of multi-platform applications, database management, and usability."
        },
        {
          degree: "Intermediate Degree in Systems and Networks (SMR)",
          school: "CPIFP Alan Turing",
          period: "2023 - 2025",
          status: "Completed",
          desc: "Installation and configuration of equipment, maintenance of local networks, and computer security. Practical focus on troubleshooting and systems improvement.",
          highlights: ["Cisco CCNA Certification (2024)", "Final GPA: 9.2/10"]
        }
      ]
    },
    contact: {
      title: 'Get in touch',
      subtitle: 'Do you have an interesting project, an internship offer, or just want to chat about tech? I\'ll be happy to hear from you.',
      infoTitle: 'Direct Information',
      location: 'Malaga, Spain',
      labels: {
        email: 'Email',
        phone: 'WhatsApp / Tel',
        location: 'Location'
      },
      form: {
        name: 'Your Name',
        email: 'Email',
        message: 'Message',
        placeholderName: 'Write here',
        placeholderEmail: 'hello@example.com',
        placeholderMsg: 'How can I help you?',
        submit: 'Send Message',
        sent: 'Opening mail client!'
      }
    },
    footer: {
      role: 'IT Technician & Software Engineering Student.'
    },
    ai: {
      label: 'Virtual Assistant',
      status: 'Online',
      placeholder: 'Ask about Juanma...',
      prompt: 'Powered by Gemini AI',
      tooltip: 'Any questions? Ask me',
      errorTitle: 'Assistant offline',
      errorDesc: 'There seems to be an issue with the AI configuration. Please check the API Key or try again later.',
      greetings: [
        "Hi! I'm Juanma's virtual assistant. I'm here to help you explore his professional profile. What would you like to know about him?",
        "Hello! As Juanma's assistant, I can provide information about his projects, skills, or education. Shall we talk?",
        "Hi there! I have access to Juanma's career path to answer any questions you might have. How can I assist you today?"
      ],
      system: `You are Juan Manuel Fernández Rodríguez's Virtual Assistant. Always respond in ENGLISH.
      CRITICAL PERSPECTIVE RULE: You MUST speak about Juanma ALWAYS IN THE THIRD PERSON. Never use "I" to refer to him. Use expressions like "Juanma is...", "He masters...", "The author of this portfolio...". Your identity is that of an external assistant.
      DYNAMIC CONTEXT: You have access to googleSearch to find updated info on his LinkedIn (https://www.linkedin.com/in/juanma-fernández-rodríguez) and GitHub (https://github.com/Ju4nmaFd3z).
      CORE PROFILE: Software student, IT tech (9.2 GPA), CCNA certified. 
      If you don't know something, use Google Search to find recent info about "Juan Manuel Fernández Rodríguez DAM SMR". Be concise, professional, and always speak in the third person.`
    }
  }
};
