<div align="center">

# Juanma Fernández — Halftone

**Técnico SMR · Cisco CCNA · Estudiante de DAM · Málaga**

[Portfolio](https://juanma-dev-portfolio.vercel.app) · [LinkedIn](https://www.linkedin.com/in/juanma-fern%C3%A1ndez-rodr%C3%ADguez) · [GitHub](https://github.com/Ju4nmaFd3z)

</div>

---

Portfolio personal en el que imagen, 3D y arte ASCII hablan un solo idioma visual: todo pasa por un único shader de **semitono** (puntos, píxeles y caracteres). Pasa el cursor (o toca) sobre una imagen y aparecen los caracteres que hay debajo.

> *"Para construir algo que perdure, primero hay que saber cómo se sostiene desde abajo."*

## Secciones

| Sección | Visual | Contenido |
|---------|--------|-----------|
| Inicio | Pagoda de cinco pisos entre arces (arte ASCII animado), a sangre | Nombre, rol, CV |
| Sobre mí | Retrato (`public/images/me.webp`) en puntos | Historia breve y tres datos |
| Habilidades | Three.js · siete capas apiladas en pixel art, cada una con un color sobrio propio y su icono en píxeles (chip, red, servidor, base de datos, `</>`, ventana web y cohete) siempre de cara a la cámara | De hardware a DevOps; la capa señalada se levanta y su color coincide con el de la lista |
| Proyectos | Three.js · un monitor de marco fino sobre peana de aluminio cuya pantalla de píxeles reproduce una animación de cada proyecto (ADN, tablero táctico, red, ciudad nocturna, marciano, robot, calendario, gráfica, biznaga) y proyecta su luz sobre el pedestal | 9 proyectos con enlaces; al cambiar, el monitor gira y la pantalla pasa por interferencias |
| Trayectoria | Three.js · una escalera de plataformas, una por hito, con su icono en píxeles (birrete, portátil o diploma con sello) y su año; un Juanma en pixel art (pelo rizado con degradado, gafas, camiseta blanca) salta de una a otra | Una tarjeta grande por hito (año perfilado, detalle, títulos); la figura salta al hito en pantalla y un riel de progreso permite saltar a cualquiera |
| Contacto | Pueblo blanco sobre el Mediterráneo (arte ASCII animado), a sangre | Email, teléfono, redes y formulario |

Un único tema oscuro: la página es una pantalla LED (la luz hace los puntos). Entre secciones los puntos se dispersan y la siguiente imagen se imprime.

## Stack

React 19 · TypeScript (estricto) · Vite 6 · Tailwind CSS 3 · Three.js con un shader GLSL propio (sin React Three Fiber: un único renderer imperativo, cargado de forma diferida) · ASCII Magic · Vercel. Requiere Node 20 o superior.

## Puesta en marcha

```bash
npm install
npm run dev         # http://localhost:3000
npm run typecheck   # tsc --noEmit
npm run build       # copia ASCII Magic a public/ y genera dist/
npm run preview
```

### Asistente (coste cero)

El botón del robot abre el asistente: cabecera de semitono animada, preguntas frecuentes en tarjetas y respuestas «vivas» (si nombra un proyecto aparece su tarjeta con enlaces y un botón que lo selecciona en la web; si habla de contacto o del CV, aparecen los botones; cada respuesta termina con preguntas de seguimiento). Funciona **siempre y sin pagar nada**:

1. **Sin claves**, responde con los datos del propio portfolio (`assistant/local.ts`): formación, experiencia, certificados, tecnologías, proyectos, contacto y CV. Sin red ni coste.
2. **Con claves**, `api/chat.ts` (función de Vercel) usa IA de proveedores con **nivel gratuito y sin tarjeta**, en orden: Gemini y Groq. Si uno agota su cuota o falla, prueba el siguiente; si ninguno responde, el navegador vuelve a las respuestas locales.

Lo que sabe el modelo se genera a partir de `translations.ts` y `content.ts` (`assistant/knowledge.ts`), así que nunca se desactualiza. Lo personal (familia, agradecimientos, carné…) está en la lista `PERSONAL` de ese mismo fichero: el asistente solo comparte lo que aparece ahí, con un tono cercano, y deriva cualquier otra pregunta privada al email.

Protección, por capas:
- **Antes del modelo:** solo peticiones del propio sitio, JSON pequeño y validado (máx. 10 mensajes de 800 caracteres), límites por IP y por día, limpieza de caracteres invisibles y un filtro de inyección (ES/EN) que responde sin llamar a la IA a «ignora tus instrucciones», «actúa como», «muestra tu prompt», etiquetas de sistema, etc. Los mensajes anteriores manipulados se descartan.
- **En el modelo:** reglas estrictas de tema, persona e idioma; el visitante nunca puede añadir instrucciones.
- **Después del modelo:** si la respuesta empieza a recitar las instrucciones (marcador aleatorio o líneas de las reglas), se corta y se sustituye. En el navegador, el texto nunca se trata como HTML y solo son pulsables los enlaces del propio portfolio.

| Variable (opcional, solo servidor) | Uso |
|----------|-----|
| `GEMINI_API_KEY` | Clave de [Google AI Studio](https://aistudio.google.com/app/apikey) creada en un proyecto **sin facturación**: así nunca se puede cobrar. |
| `GEMINI_MODEL` | Modelo de Gemini (por defecto `gemini-flash-lite-latest`). |
| `GROQ_API_KEY` | Clave de [Groq](https://console.groq.com/keys) (nivel gratuito, sin tarjeta). |
| `GROQ_MODEL` | Modelo de Groq (por defecto `llama-3.1-8b-instant`). |

En local, copia `.env.example` a `.env`: `npm run dev` sirve también `/api/chat` con esas claves. En Vercel, se añaden en *Settings → Environment Variables*. Ninguna clave llega nunca al navegador.

El formulario de contacto **no** usa backend: valida los campos y abre la aplicación de correo del visitante con el mensaje preparado (`mailto:`), y lo dice explícitamente en la interfaz.

## Arquitectura

```
App.tsx                 idioma, pantalla de carga, motor, puntero/lupa, terminal, asistente y visor de PDF
translations.ts         todo el texto ES/EN (tipado)
content.ts              enlaces, proyectos y ficheros independientes del idioma
components/             Navbar, Hero, About, Skills, Projects, Journey, Contact, Footer,
                        Preloader, Terminal (tecla / o botón >_), Neofetch, GitGraph, DocumentViewer,
                        Assistant, ui.tsx, brand.ts (la marca como datos: logo, carga y neofetch)
assistant/              knowledge.ts (perfil + reglas del modelo) y local.ts (respuestas sin IA)
api/chat.ts             función de Vercel del asistente (proveedores gratuitos, streaming)
engine/                 (chunk diferido)
  bus.ts                puente React → mundo (sin Three.js; va en el bundle principal)
  World.ts              renderer, scroll → sección, encaje en [data-stage], calma, lupa, calidad
  halftone.ts           shader de semitono: puntos / pixel art / glifos, lupa, disolución
  sources.ts            piezas ASCII Magic y fotos → rejilla de celdas (color + tono)
  palette.ts, kit.ts    paleta común y utilidades de escena
  chapters/             plates.ts (imágenes planas) + skills / projects / journey (3D)
scripts/copy-ascii-magic.mjs   copia runtime + 734 piezas a public/ascii-magic-art
```

### Pipeline de render

1. **Fuente**: una imagen plana (cada fotograma de la pieza ASCII se convierte en color + tono: tinta del glifo × luz del color, estiramiento por percentiles y curva) o una escena 3D renderizada a un *render target* de baja resolución con profundidad.
2. **Rejilla**: en las imágenes, cada punto muestrea su centro y toma uno de cuatro tamaños con tramado Bayer 4×4; en las escenas 3D (*modo sólido*) cada celda tiene tamaño fijo y su color se sombrea con la luz recibida, para que los objetos se lean como pixel art nítido.
3. **Lupa (void)**: alrededor del cursor la imagen se curva hacia dentro formando un hueco y los puntos se convierten en glifos ASCII.
4. **Calma**: los elementos `[data-calm]` hacen retroceder los puntos bajo el texto para que siempre se lea.
5. **Disolución / intro**: los puntos se encogen con una dispersión determinista entre secciones y se "imprimen" desde el sujeto al entrar. Las imágenes a sangre se funden con la página en su borde inferior.

Cada sección con imagen tiene un `[data-stage]`: las imágenes planas se encajan en esa caja (en móvil se muestra casi todo el ancho y el texto fluye debajo) y las escenas 3D desplazan la lente de la cámara para caer exactamente dentro. **Un solo canvas** para toda la página.

### Arte ASCII

El paquete `ascii-magic-art` se instala por npm. Las dos piezas del motor se importan como módulos; además, `npm run dev` / `npm run build` copian su runtime y sus **734 piezas** a `public/ascii-magic-art` (ignorado por git) para usar su elemento `<ascii-art>`: avión de papel al enviar el formulario, separador *circuit-trace* a casi todo el ancho en el pie, comando `ascii` en la terminal y respaldo sin WebGL.

### Marca y pantalla de carga

La marca es una "J" en pixel art con un cursor de bloque naranja apoyado en su línea base, en una rejilla de 5 × 5 (`components/brand.ts`); se usa en la cabecera, el pie, el favicon, el neofetch y la carga. La pantalla de carga (canvas 2D) es una rejilla de puntos que recorre una onda de luz mientras el logo se imprime píxel a píxel, se escribe el nombre y avanza el contador; al terminar, la pantalla se deshace en cuadrados de semitono desde el logo hacia fuera y el inicio se imprime debajo. Se puede saltar (botón, Esc, Enter o clic), sale una vez por sesión y nunca con `prefers-reduced-motion`.

### Terminal

Tecla `/` o botón `>_`. Autocompletado con Tab (sugerencia en gris, → también acepta), historial con ↑↓, Ctrl+L limpia, Ctrl+C cancela, Esc cierra; todo comando en la salida es clicable y en móvil hay una fila de comandos rápidos. Comandos: `help`, `about`, `skills`, `projects [id]`, `open <id>`, `git log` (la trayectoria como `git log --graph`), `git status`, `cv`, `contact`, `email`, `goto <sección>`, `lang`, `ascii …`, `neofetch` (ficha con el logo en píxeles, datos leídos de los propios textos y paleta), `history`, `date`, `echo`, `clear`, `exit` (y `sudo`).

### Rendimiento y accesibilidad

- Motor en chunk diferido (~150 kB gzip); las piezas, en chunks propios de ~4 kB; el contenido HTML se pinta antes.
- Un único `WebGLRenderer`, geometría instanciada, materiales cacheados, `dispose()` completo; solo se anima la sección visible.
- Pausa con la pestaña oculta. En el nivel bajo (táctil / pocos núcleos): sin sombras, densidad de píxel ≤ 1,5 y 30 fps solo en reposo; mientras la página se desplaza se dibuja cada fotograma para que la imagen no dé tirones frente al texto. En táctil la lupa solo aparece con un toque, nunca al deslizar. Baja resolución automáticamente si el dispositivo no llega.
- `prefers-reduced-motion`: sin preloader, mundo estático (solo se re-renderiza si algo cambia), arte ASCII en fotograma fijo, sin animaciones de texto.
- Sin WebGL (o con `?2d` en la URL): imágenes con el reproductor 2D del paquete, retrato como imagen, ilustraciones de texto en las escenas 3D; todo el contenido y las funciones siguen disponibles.
- Todo el contenido es HTML semántico; las imágenes tienen `role="img"` con descripción. Navegación por teclado, foco visible, pestañas de proyectos con flechas, formulario etiquetado con errores anunciados.

## Despliegue

Vercel construye con `npm run build` y publica `dist/`; `api/chat.ts` se despliega como función. `vercel.json` añade cabeceras de seguridad (CSP estricta, HSTS, `nosniff`, `frame-ancestors`, `Permissions-Policy`) y caché larga e inmutable para los ficheros con hash de `/assets`. Las variables del asistente se configuran en el panel del proyecto.

## Licencias de terceros

- Arte ASCII: paquete `ascii-magic-art` (MIT); su `LICENSE` y `NOTICE` se copian junto a los ficheros en `/ascii-magic-art/`.
- Tipografías: Instrument Serif, Geist y Geist Mono (Google Fonts). Iconos: Font Awesome.

---

<div align="center">juanmafr2007@gmail.com · Málaga, España</div>
