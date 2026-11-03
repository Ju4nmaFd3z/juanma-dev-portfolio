import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ViewerDoc, ViewerLabels } from '../types';
import { downloadFile } from '../utils/downloadFile';

interface DocumentViewerProps {
  doc: ViewerDoc | null;
  onClose: () => void;
  labels: ViewerLabels;
}

// Modal PDF viewer for the CV (ES/EN) and certificates.
const DocumentViewer: React.FC<DocumentViewerProps> = ({ doc, onClose, labels }) => {
  const [activeId, setActiveId] = useState<string>('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (doc) setActiveId(doc.activeId ?? doc.sources[0]?.id ?? '');
  }, [doc]);

  // Esc closes, scroll is locked, focus moves in and returns on close.
  useEffect(() => {
    if (!doc) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      prevFocus?.focus?.();
    };
  }, [doc, onClose]);

  const active = doc?.sources.find((s) => s.id === activeId) ?? doc?.sources[0];

  const handleDownload = useCallback(() => {
    if (active) downloadFile(active.url, active.downloadName);
  }, [active]);

  if (!doc || !active) return null;
  const showToggle = doc.sources.length > 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[19000] flex items-center justify-center p-3 sm:p-6 bg-black/60"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
    >
      <div className="relative flex flex-col w-[94vw] max-w-4xl h-[88vh] overflow-hidden border-2 border-lineStrong bg-bg shadow-[8px_8px_0_0_#000] px-frame">
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-line">
          <h2 className="flex-1 min-w-0 truncate text-sm sm:text-base font-semibold text-ink">{doc.title}</h2>

          {showToggle && (
            <div className="flex items-center gap-1 border border-line p-1" role="group">
              {doc.sources.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] font-mono text-[11px] uppercase tracking-widest transition-colors ${
                    s.id === active.id ? 'bg-ink text-bg' : 'text-muted hover:text-ink'
                  }`}
                  aria-pressed={s.id === active.id}
                >
                  {s.flag && <span className="text-sm leading-none" aria-hidden="true">{s.flag}</span>}
                  <span className={s.flag ? 'hidden sm:inline' : ''}>{s.label}</span>
                  {s.flag && <span className="sm:hidden">{s.id.toUpperCase()}</span>}
                </button>
              ))}
            </div>
          )}

          <button type="button" onClick={handleDownload} className="flex items-center gap-2 px-3 min-h-[40px] bg-accent text-onAccent font-mono text-[11px] font-bold uppercase tracking-widest hover:brightness-110">
            <i className="fa-solid fa-download" aria-hidden="true" />
            <span className="hidden sm:inline">{labels.download}</span>
            <span className="sr-only sm:hidden">{labels.download}</span>
          </button>

          <button ref={closeRef} type="button" onClick={onClose} aria-label={labels.close} className="icon-btn !w-10 !h-10 shrink-0">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-2 sm:p-3">
          <iframe key={active.url} src={active.url} title={doc.title} className="w-full h-full bg-white border border-line" />
        </div>

        {/* Some mobile browsers (iOS) won't render PDFs in an iframe. */}
        <div className="lg:hidden flex justify-center px-4 py-3 border-t border-line">
          <a href={active.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accentText">
            <i className="fa-solid fa-up-right-from-square" aria-hidden="true" />
            {labels.openInNewTab}
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DocumentViewer;
