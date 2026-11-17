import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serves the Vercel function in /api during `npm run dev`, so the assistant
 * can be tried locally with the keys from .env (never exposed to the client).
 */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const mod = await server.ssrLoadModule('/api/chat.ts');
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const headers = new Headers();
          Object.entries(req.headers).forEach(([k, v]) => { if (typeof v === 'string') headers.set(k, v); });
          const request = new Request(`http://${req.headers.host}/api/chat`, {
            method: req.method,
            headers,
            body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
          });
          const response: Response = req.method === 'POST' ? await mod.POST(request) : new Response(null, { status: 405 });
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          if (response.body) {
            const reader = response.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
          }
          res.end();
        } catch (err) {
          server.config.logger.error(`[dev-api] ${(err as Error).message}`);
          res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // make the server-side keys (no VITE_ prefix) visible to the dev function
  const env = loadEnv(mode, process.cwd(), '');
  for (const k of ['GEMINI_API_KEY', 'GEMINI_MODEL', 'GROQ_API_KEY', 'GROQ_MODEL']) if (env[k]) process.env[k] = env[k];

  return {
    server: {
      port: 3000,
      host: 'localhost',
    },
    plugins: [react(), devApi()],
    build: {
      // The WebGL engine (Three.js) is a single lazy chunk by design.
      chunkSizeWarningLimit: 650,
    },
  };
});
