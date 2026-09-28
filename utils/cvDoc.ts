import type { ViewerDoc } from '../types';
import { cvFileName } from './downloadCV';

// Builds the CV document (both language variants) for the DocumentViewer.
// `activeLang` selects which PDF is shown first.
export function buildCvDoc(activeLang: 'es' | 'en', title: string): ViewerDoc {
  return {
    title,
    activeId: activeLang,
    sources: [
      { id: 'es', label: 'Español', flag: '🇪🇸', url: `/${cvFileName('es')}`, downloadName: cvFileName('es') },
      { id: 'en', label: 'English', flag: '🇬🇧', url: `/${cvFileName('en')}`, downloadName: cvFileName('en') },
    ],
  };
}
