
export interface Project {
  title: string;
  desc: string;
  category: 'software' | 'systems';
  tech: string[];
  icon: string;
  gradient: string;
  image: string;
  url: string;
  repo?: string;
}

// ── Document viewer (CV + certification titles) ──────────────────
export interface ViewerSource {
  id: string;            // 'es' | 'en' | 'pdf'
  label: string;         // "Español", "English", "Título"
  flag?: string;         // optional emoji for the CV language toggle
  url: string;           // '/CV…ES.pdf' | '/certs/ccna.pdf'
  downloadName: string;  // filename used when downloading
}

export interface ViewerDoc {
  title: string;             // modal header
  sources: ViewerSource[];   // 1 (cert) or 2 (CV ES/EN)
  activeId?: string;         // initially selected source
}

export interface ViewerLabels {
  download: string;
  close: string;
  openInNewTab: string;
  cannotDisplay: string;
}