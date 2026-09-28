<div align="center">

<br>

# Juan Manuel Fernández Rodríguez
### Técnico SMR &nbsp;·&nbsp; Estudiante DAM &nbsp;·&nbsp; Desarrollador Multiplataforma

<br>

[![Portfolio](https://img.shields.io/badge/Ver_Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://juanma-dev-portfolio.vercel.app)
&nbsp;
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/juanma-fern%C3%A1ndez-rodr%C3%ADguez)
&nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ju4nmaFd3z)

<br>

</div>

---

SPA personal construida con React 19 y TypeScript sobre Vite. Integra un asistente de IA en tiempo real con Google Gemini, un sistema i18n propio sin dependencias externas, modo oscuro/claro persistente con detección automática del sistema, efecto de partículas personalizado y un terminal interactivo oculto.

---

## Stack

<div align="center">

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
&nbsp;
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
&nbsp;
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
&nbsp;
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
&nbsp;
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
&nbsp;
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## Arquitectura

**i18n sin dependencias**
Sistema de traducción implementado como objeto TypeScript completamente tipado en `translations.ts`. Soporta interpolación de nodos React para marcado inline dentro de cadenas. Añadir un idioma es únicamente extender el tipo — sin configuración, sin overhead en el bundle.

**Asistente IA contextualizado** *(actualmente fuera de servicio — sin créditos API activos)*
`FloatingAI` conecta directamente con la API de Gemini vía `@google/genai`. El system prompt inyecta el perfil profesional completo para dar respuestas precisas en cualquiera de los dos idiomas del sitio. Gestiona de forma autónoma los estados de error de API, pérdida de conexión y modo mantenimiento, sin acoplamiento al resto de la app.

**Scroll sin librería de animaciones**
Las transiciones de entrada de secciones combinan `IntersectionObserver` nativo con clases CSS. Sin Framer Motion, sin GSAP — rendimiento nativo, control total, bundle limpio.

**Tema con detección automática**
El sistema de tema lee `prefers-color-scheme` en el primer renderizado y persiste la elección del usuario en `localStorage`. Resultado: cero flash de contenido incorrecto en recargas y respeto completo a la preferencia del sistema operativo.

**Terminal como easter egg**
Presionar `/` desde cualquier punto de la página abre un terminal modal completamente funcional. No es decorativo — refleja la misma filosofía con la que está construido el resto del sitio.

---

## Proyectos

**Genetix Arena**
Simulador táctico de combate autónomo con IA emergente. Gestiona entidades (Ops, Hostiles, Med-Units) en un grid de 75×25. Migración de alta fidelidad a TypeScript + React 19 con interfaz inspirada en SpaceX.
`TypeScript` · `React 19` · `Vite` · `Tailwind CSS`

**Genetix**
Simulador visual de algoritmos genéticos. Selección natural, cruce y mutación aplicados a problemas de optimización. Desarrollado íntegramente en React y Java.
`React` · `Java` · `Tailwind CSS`

**Glitch Night**
Web oficial de una app de ocio nocturno para Málaga. SPA con estética cyberpunk, animaciones GSAP con ScrollTrigger, sistema de entrada por QR y descubrimiento de locales y eventos.
`HTML5` · `CSS3` · `JavaScript` · `GSAP`

---

## Sobre mí

Técnico SMR graduado con **9.2 de nota media**, reconvertido a desarrollador multiplataforma. Actualmente en **1º de DAM en CPIFP Alan Turing** (Málaga). Certificado **Cisco CCNA**. Erasmus+ en Campobasso, Italia. Prácticas FCT en Fix Me Málaga como responsable de automatizaciones, administrador de BBDD y programador.

Llevo años trabajando con hardware y redes antes de llegar al software: entiendo lo que ocurre debajo del capó antes de escribir la primera línea de código.

> *"Para construir algo que perdure, primero hay que saber cómo se sostiene desde abajo."*

---

<div align="center">

juanmafr2007@gmail.com &nbsp;·&nbsp; Málaga, España &nbsp;·&nbsp; 🌴🧑‍💻

</div>
