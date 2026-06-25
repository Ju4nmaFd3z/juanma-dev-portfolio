
export const translations = {
  es: {
    nav: {
      home: 'Inicio',
      about: 'Sobre mí',
      projects: 'Proyectos',
      journey: 'Trayectoria',
      contact: 'Contacto',
      downloadCV: 'CV',
      terminal: 'Terminal (Shell)'
    },
    hero: {
      role: 'Técnico SMR & Estudiante de DAM',
      title1: 'Juan Manuel',
      title2: 'Fernández',
      desc: 'Técnico SMR reconvertido a {bold}. Combino la precisión técnica de los sistemas con la creatividad del software para resolver problemas reales.',
      descBold: 'Desarrollador Multiplataforma',
      cta: 'HABLEMOS',
      cv: 'DESCARGAR CV',
      location: 'Málaga, ES',
      availability: 'Disponibilidad',
      availabilityStatus: 'Disponible para prácticas'
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
      skillsSub: 'Dominio técnico',
      skillsList: [
        { name: 'Montaje y Mantenimiento (Hardware)', level: '95%' },
        { name: 'Redes Locales (Cisco CCNA)', level: '85%' },
        { name: 'Troubleshooting IT', level: '90%' },
        { name: 'Fundamentos de Programación', level: '60%' }
      ],
      quote: '"Para construir algo que perdure, primero hay que saber cómo se sostiene desde abajo."',
      status: 'En formación y abierto a retos'
    },
    projects: {
      title: 'Proyectos',
      subtitle: 'Bitácora de mi desarrollo profesional',
      github: 'Ver GitHub',
      sectionHeading1: 'MIS',
      sectionHeading2: 'CREACIONES.',
      statsCommits: 'Commits / Mes',
      statsTech: 'Tecnologías',
      statsProjects: 'Proyectos',
      statsProd: 'En Producción',
      buildingStatus: 'En Curso',
      buildingBadge: 'DAM 1º',
      buildingFocus: 'Enfocado en',
      buildingTitle: 'En construcción,',
      buildingTitleHighlight: 'permanente.',
      buildingDesc: 'Cada commit es una versión mejorada de mí. Estoy al principio del camino, pero lo estoy recorriendo a toda velocidad.',
      items: [
        {
          title: "Genetix",
          desc: "Simulador visual de algoritmos genéticos desarrollado íntegramente en React y Java. Aplica conceptos de evolución biológica como selección, cruce y mutación para resolver problemas complejos de optimización.",
          tech: ["React", "Java", "Tailwind CSS", "Genética"]
        },
        {
          title: "Genetix Arena",
          desc: "Simulador táctico de combate autónomo con IA emergente. Migración de alta fidelidad a TypeScript y React 19 con interfaz inspirada en SpaceX. Gestiona entidades (Ops, Hostiles, Med-Units) en un grid de 75x25.",
          tech: ["TypeScript", "React 19", "Vite", "Tailwind"]
        },
        {
          title: "Infraestructura & Redes",
          desc: "Configuración de redes y protocolos de enrutamiento basada en la certificación Cisco CCNA. Implementación de seguridad, switching y mantenimiento de infraestructuras de comunicación y sistemas.",
          tech: ["Cisco CCNA", "Linux", "Seguridad", "Hardware"]
        },
        {
          title: "Glitch Night",
          desc: "Diseño y desarrollo de la web oficial de Glitch Night, app de ocio nocturno para Málaga. SPA con estética cyberpunk, animaciones GSAP y ScrollTrigger, sistema QR de entrada y descubrimiento de locales y eventos.",
          tech: ["HTML5", "CSS3", "JavaScript", "GSAP", "SPA"]
        },
        {
          title: "Fix Me Arcade",
          desc: "Diseño y despliegue de la landing page oficial del servicio de recreativas de Fix Me Málaga. Una SPA con estética retro-arcade y paleta neón que presenta el catálogo de máquinas, los servicios de reparación y los canales de contacto.",
          tech: ["HTML5", "CSS3", "JavaScript", "Vercel"]
        },
        {
          title: "OpenClaw Agent",
          desc: "Agente técnico autónomo para diagnosticar y guiar la reparación de recreativas de forma independiente. Con directivas de seguridad y red lines definidas, vive en un Mac Pro 2013 con fallo de placa que recuperé con Ubuntu Server — una máquina rescatada del vertedero, ahora servidor de IA.",
          tech: ["Agente IA", "Ubuntu Server", "Mac Pro 2013", "Diagnóstico"]
        }
      ]
    },
    experience: {
      title: 'Trayectoria Profesional',
      footer: 'Buscando nuevos retos para seguir creciendo en el desarrollo de software...',
      items: [
        {
          role: "Jefe de Automatizaciones",
          roleDetail: "Adm. de BBDD · Programador",
          color: "teal",
          type: "Prácticas FCT · DAM 1º",
          company: "Fix Me Málaga",
          location: "Málaga, España",
          period: "Marzo 2026 - Junio 2026",
          points: [
            "Diseño e implementación de automatizaciones para optimizar los procesos internos de la empresa.",
            "Administración y gestión de la base de datos de clientes, reparaciones e inventario.",
            "Desarrollo y mantenimiento de herramientas de software a medida para la tienda."
          ],
          tags: ["Automatizaciones", "Bases de Datos", "Programación", "Reparaciones"],
          linkedinPost: "https://www.linkedin.com/posts/juanma-fern%C3%A1ndez-rodr%C3%ADguez_presentaci%C3%B3n-pr%C3%A1cticas-fix-me-2026-share-7466445967605760000-vEC4/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFOruqgByHSrgA1VcfWtYh5BeWtvxvpMzFo",
          slides: "https://canva.link/noamvf0lpjcpmv3"
        },
        {
          role: "Técnico de Soporte e Infraestructura IT",
          color: "purple",
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
          highlights: ["Cisco CCNA Certification (2024)", "Nota Media Final: 9.2"]
        }
      ],
      certs: {
        title: 'Certificaciones',
        verified: 'Verificado',
        view: 'Ver título',
        download: 'Descargar',
        items: [
          {
            name: 'CCNA: Introduction to Networks',
            issuer: 'Cisco Networking Academy',
            year: '2024',
            color: 'cyan',
            icon: 'fa-solid fa-network-wired',
            skills: ['TCP/IP', 'Switching', 'Routing', 'Seguridad', 'VLAN', 'IPv6'],
            file: '/certs/ccna.pdf'
          },
          {
            name: 'Introducción Práctica a DevOps',
            issuer: 'LemonCode',
            year: '2026',
            color: 'amber',
            icon: 'fa-solid fa-infinity',
            skills: ['Docker', 'Docker Compose', 'CI/CD', 'GitHub Actions', 'Azure', 'AWS', 'Vercel', 'MongoDB'],
            file: '/certs/devops-lemoncode.pdf'
          }
        ]
      }
    },
    viewer: {
      download: 'Descargar',
      close: 'Cerrar',
      openInNewTab: 'Abrir en nueva pestaña',
      cannotDisplay: 'Tu navegador no puede mostrar el PDF.'
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
      maintenanceStatus: 'Fuera de servicio',
      maintenanceMsg: 'Lo siento, en este momento no puedo procesar tu solicitud. Por favor, inténtalo más tarde.',
      placeholder: 'Pregunta sobre Juanma...',
      placeholderMaintenance: 'Servicio no disponible...',
      prompt: 'Potenciado por Gemini AI',
      tooltip: '¿Alguna duda? Pregúntame',
      errorTitle: 'Estado del servicio',
      errorDesc: 'Actualmente, el asistente está experimentando una pausa técnica. Para garantizar la mejor experiencia, te invitamos a explorar la trayectoria detallada y proyectos de Juanma mientras restauramos la conexión.',
      errorOffline: 'No se detecta conexión activa. Te animo a verificar tu red para retomar nuestra charla, o a seguir descubriendo el portfolio de Juanma a tu ritmo.',
      greetings: [
        "¡Hola! Soy el asistente virtual de Juanma. ¿En qué puedo ayudarte hoy?",
        "¡Buenas! Como asistente de Juanma, puedo informarte sobre sus proyectos o formación. ¿Hablamos?",
        "¡Hola! Tengo acceso a la trayectoria de Juanma para resolver cualquier duda que tengas. ¿Qué te gustaría saber?"
      ],
    }
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      journey: 'Journey',
      contact: 'Contact',
      downloadCV: 'CV',
      terminal: 'Terminal (Shell)'
    },
    hero: {
      role: 'IT Systems Tech & Software Student',
      title1: 'Juan Manuel',
      title2: 'Fernández',
      desc: 'Systems Technician transitioned into {bold}. Combining technical systems precision with software creativity to solve real-world problems.',
      descBold: 'Multiplatform Developer',
      cta: 'LET\'S TALK',
      cv: 'DOWNLOAD CV',
      location: 'Málaga, Spain',
      availability: 'Availability',
      availabilityStatus: 'Ready for internships'
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
      skillsSub: 'Technical proficiency',
      skillsList: [
        { name: 'Hardware Setup & Maintenance', level: '95%' },
        { name: 'Local Networks (Cisco CCNA)', level: '85%' },
        { name: 'IT Troubleshooting', level: '90%' },
        { name: 'Programming Fundamentals', level: '60%' }
      ],
      quote: '"To build something that lasts, you must first know how it is supported from below."',
      status: 'In training & open to challenges'
    },
    projects: {
      title: 'Projects',
      subtitle: 'My professional development log',
      github: 'View GitHub',
      sectionHeading1: 'MY',
      sectionHeading2: 'CREATIONS.',
      statsCommits: 'Commits / Month',
      statsTech: 'Technologies',
      statsProjects: 'Projects',
      statsProd: 'In Production',
      buildingStatus: 'In Progress',
      buildingBadge: 'DAM 1st Yr',
      buildingFocus: 'Currently focused on',
      buildingTitle: 'Permanently under',
      buildingTitleHighlight: 'construction.',
      buildingDesc: 'Every commit is an improved version of me. I\'m at the start of the road, but I\'m running it at full speed.',
      items: [
        {
          title: "Genetix",
          desc: "Visual simulator of genetic algorithms developed entirely in React and Java. It applies biological evolution concepts such as selection, crossover, and mutation to solve complex optimization problems.",
          tech: ["React", "Java", "Tailwind CSS", "Genetics"]
        },
        {
          title: "Genetix Arena",
          desc: "Autonomous tactical combat simulator with emergent AI. High-fidelity migration to TypeScript and React 19 with a SpaceX-inspired interface. Manages entities (Ops, Hostiles, Med-Units) on a 75x25 grid.",
          tech: ["TypeScript", "React 19", "Vite", "Tailwind"]
        },
        {
          title: "Infrastructure & Networks",
          desc: "Network configuration and routing protocols based on Cisco CCNA certification. Implementation of security, switching, and maintenance of communication infrastructures and systems.",
          tech: ["Cisco CCNA", "Linux", "Security", "Hardware"]
        },
        {
          title: "Glitch Night",
          desc: "Design and development of the official Glitch Night website — a nightlife app for Málaga. SPA with cyberpunk aesthetic, GSAP and ScrollTrigger animations, QR entry system, and venue and event discovery.",
          tech: ["HTML5", "CSS3", "JavaScript", "GSAP", "SPA"]
        },
        {
          title: "Fix Me Arcade",
          desc: "Design and deployment of the official landing page for Fix Me Málaga's arcade machine repair service. An SPA with retro-arcade aesthetic and neon palette, showcasing the machine catalogue, repair services and contact channels.",
          tech: ["HTML5", "CSS3", "JavaScript", "Vercel"]
        },
        {
          title: "OpenClaw Agent",
          desc: "Autonomous technical agent to independently diagnose and guide arcade machine repairs. Governed by defined security directives and red lines, it runs on a 2013 Mac Pro with a failed logic board that I restored with Ubuntu Server — a machine rescued from the scrap heap, now an AI server.",
          tech: ["AI Agent", "Ubuntu Server", "Mac Pro 2013", "Diagnostics"]
        }
      ]
    },
    experience: {
      title: 'Professional Journey',
      footer: 'Looking for new challenges to keep growing in software development...',
      items: [
        {
          role: "Head of Automations",
          roleDetail: "DB Administrator · Programmer",
          color: "teal",
          type: "FCT Internship · DAM 1st Year",
          company: "Fix Me Málaga",
          location: "Málaga, Spain",
          period: "March 2026 - June 2026",
          points: [
            "Designed and implemented automations to optimise the company's internal processes.",
            "Administration and management of the customer, repair and inventory database.",
            "Development and maintenance of custom software tools for the store."
          ],
          tags: ["Automations", "Databases", "Programming", "Repairs"],
          linkedinPost: "https://www.linkedin.com/posts/juanma-fern%C3%A1ndez-rodr%C3%ADguez_presentaci%C3%B3n-pr%C3%A1cticas-fix-me-2026-share-7466445967605760000-vEC4/?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFOruqgByHSrgA1VcfWtYh5BeWtvxvpMzFo",
          slides: "https://canva.link/noamvf0lpjcpmv3"
        },
        {
          role: "IT Support & Infrastructure Technician",
          color: "purple",
          type: "Erasmus+ Internship",
          company: "Music Store Campobasso",
          location: "Campobasso, Italy",
          period: "March 2025 - June 2025",
          points: [
            "Customer service and sales assistant.",
            "Stock management.",
            "Database maintenance."
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
      ],
      certs: {
        title: 'Certifications',
        verified: 'Verified',
        view: 'View title',
        download: 'Download',
        items: [
          {
            name: 'CCNA: Introduction to Networks',
            issuer: 'Cisco Networking Academy',
            year: '2024',
            color: 'cyan',
            icon: 'fa-solid fa-network-wired',
            skills: ['TCP/IP', 'Switching', 'Routing', 'Security', 'VLAN', 'IPv6'],
            file: '/certs/ccna.pdf'
          },
          {
            name: 'Practical Introduction to DevOps',
            issuer: 'LemonCode',
            year: '2026',
            color: 'amber',
            icon: 'fa-solid fa-infinity',
            skills: ['Docker', 'Docker Compose', 'CI/CD', 'GitHub Actions', 'Azure', 'AWS', 'Vercel', 'MongoDB'],
            file: '/certs/devops-lemoncode.pdf'
          }
        ]
      }
    },
    viewer: {
      download: 'Download',
      close: 'Close',
      openInNewTab: 'Open in new tab',
      cannotDisplay: 'Your browser cannot display the PDF.'
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
      maintenanceStatus: 'Out of Service',
      maintenanceMsg: 'I apologize, I cannot process your request at this moment. Please try again later.',
      placeholder: 'Ask about Juanma...',
      placeholderMaintenance: 'Service unavailable...',
      prompt: 'Powered by Gemini AI',
      tooltip: 'Any questions? Ask me',
      errorTitle: 'Service Status',
      errorDesc: 'The assistant is currently experiencing a technical pause. To ensure the best experience, we invite you to explore Juanma\'s detailed background and projects while we restore connection.',
      errorOffline: 'No active connection detected. Please verify your network to resume our chat, or continue discovering Juanma\'s portfolio at your own pace.',
      greetings: [
        "Hi! I'm Juanma's virtual assistant. How can I assist you today?",
        "Hello! As Juanma's assistant, I can provide information about his projects or education. Shall we talk?",
        "Hi there! I have access to Juanma's career path to answer any questions you might have."
      ],
    }
  }
};
