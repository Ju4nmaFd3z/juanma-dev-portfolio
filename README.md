<div align="center">

# Juanma Fernández — The Pixel Dimension

**Técnico SMR · Cisco CCNA · Estudiante de DAM · Málaga**

[Portfolio](https://juanma-dev-portfolio.vercel.app) · [LinkedIn](https://www.linkedin.com/in/juanma-fern%C3%A1ndez-rodr%C3%ADguez) · [GitHub](https://github.com/Ju4nmaFd3z)

</div>

---

Portfolio personal construido como un recorrido en seis capítulos por un mundo 3D renderizado en tiempo real como **pixel art**: geometría real de Three.js que un shader propio convierte en celdas, paleta limitada, tramado ordenado, contornos por profundidad y, en un capítulo, **glifos ASCII**.

> *"Para construir algo que perdure, primero hay que saber cómo se sostiene desde abajo."*

## Narrativa

| # | Capítulo | Escena 3D | Contenido |
|---|----------|-----------|-----------|
| 01 | Identidad | Fragmento de placa base; el procesador lleva «JM» en vóxeles | Presentación, CTAs, CV |
| 02 | Origen | Torre de PC abierta, ventiladores girando, panel lateral flotando | Historia, cita, ficha técnica |
| 03 | La pila | Siete losas apiladas renderizadas **en glifos** | Competencias por capa (L0 hardware → L6 DevOps), con su origen |
| 04 | Construcción | Pedestal con una pieza procedural por proyecto | 9 proyectos con enlaces, papel, stack |
| 05 | Evolución | Archipiélago con pilares; uno en Italia (Erasmus+) | Formación, certificaciones y experiencia |
| 06 | Conexión | Antena cuya parábola sigue al cursor | Canales directos y formulario |

Entre capítulos la imagen **se disuelve a través de la dimensión píxel**: las celdas crecen, pasa por glifos y se resuelve el capítulo siguiente.

## Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · Three.js (sin React Three Fiber: un único renderer imperativo, cargado de forma diferida) · Vercel.

## Puesta en marcha

```bash
npm install
npm run dev         # http://localhost:3000
npm run typecheck   # tsc --noEmit
npm run build       # genera dist/
npm run preview
```

### Variables de entorno

| Variable | Uso |
|----------|-----|
| `GEMINI_API_KEY` | Solo para el asistente IA (`api/chat.ts`, función serverless de Vercel). Sin ella el endpoint responde 503 y el asistente muestra su estado de servicio. Copia `.env.example` a `.env`. **Nunca** se expone al cliente. |

El formulario de contacto **no** usa backend: valida los campos y abre la aplicación de correo del visitante con el mensaje preparado (`mailto:`), y lo dice explícitamente en la interfaz.

## Arquitectura

```
App.tsx                 orquesta tema, idioma, preloader, motor 3D y modales
translations.ts         todo el texto ES/EN (tipado)
content.ts              enlaces, categorías y ficheros independientes del idioma
components/             Navbar, Hero, About, Skills, Projects, Journey, Contact, Footer,
                        Preloader, Terminal (tecla /), DocumentViewer, FloatingAI, ui.tsx
engine/                 (chunk diferido)
  bus.ts                puente React → mundo (sin Three.js; va en el bundle principal)
  World.ts              renderer, bucle, scroll → capítulo, lente, transiciones, calidad
  post.ts               shader de resolución pixel art + atlas de glifos
  palette.ts            paletas oscura («noche») y clara («papel»)
  kit.ts                materiales toon, vóxeles instanciados, utilidades
  chapters/*.ts         una escena por capítulo
```

### Pipeline de render

1. La escena se renderiza a un *render target* de baja resolución (60 % en escritorio, 42 % en móvil) con textura de profundidad.
2. `post.ts` divide la pantalla en celdas y muestrea **un** texel por celda (píxeles duros, no un filtro CSS).
3. Contornos: una celda claramente delante de su vecina recibe el color de contorno.
4. Tramado Bayer 4×4 y ajuste al color más cercano de la paleta (distancia perceptual 0.30/0.59/0.11).
5. Modo glifo: la paleta decide el color y el glifo codifica la luminancia residual (técnica estudiada en las piezas de ASCII Magic).

Cada sección tiene un elemento `[data-stage]`; el motor desplaza y escala la lente de la cámara para que la escena encaje exactamente en esa caja, así que 3D y maquetación se componen juntos en cualquier pantalla con **un solo canvas**.

### Rendimiento y accesibilidad

- Motor en chunk diferido (~150 kB gzip); el contenido HTML se pinta antes.
- Un único `WebGLRenderer`, geometría instanciada, materiales cacheados, `dispose()` completo.
- Pausa con la pestaña oculta; 30 fps y sin sombras en el nivel bajo (móvil / pocos núcleos); reducción automática de resolución si el dispositivo no llega.
- `prefers-reduced-motion`: sin preloader, mundo estático (solo se re-renderiza si algo cambia), sin animaciones de texto.
- Sin WebGL (o con `?2d` en la URL): fondo alternativo e ilustraciones de texto; todo el contenido y las funciones siguen disponibles.
- Todo el contenido es HTML semántico; las escenas tienen `role="img"` con descripción. Navegación por teclado, foco visible, pestañas de proyectos con flechas, formulario etiquetado con errores anunciados.

## Créditos

- Estética de glifos inspirada en [ASCII Magic](https://www.ascii-magic.com/ascii) (biblioteca MIT). No se incluye código ni piezas de la biblioteca: el efecto está reimplementado en GLSL.
- Tipografías: Space Grotesk, Inter, JetBrains Mono y Silkscreen (Google Fonts). Iconos: Font Awesome.

---

<div align="center">juanmafr2007@gmail.com · Málaga, España</div>
