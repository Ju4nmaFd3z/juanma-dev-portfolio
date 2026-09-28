import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ViewerDoc, ViewerLabels } from '../types';
import { downloadFile } from '../utils/downloadFile';

interface DocumentViewerProps {
  doc: ViewerDoc | null;
  onClose: () => void;
  labels: ViewerLabels;
}

const hideCursor = () => document.body.classList.add('cursor-hidden-active');
const showCursor = () => document.body.classList.remove('cursor-hidden-active');

const DocumentViewer: React.FC<DocumentViewerProps> = ({ doc, onClose, labels }) => {
  const [activeId, setActiveId] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync the active source whenever a new document is opened.
  useEffect(() => {
    if (doc) setActiveId(doc.activeId ?? doc.sources[0]?.id ?? '');
  }, [doc]);

  // Hide the custom cursor while the pointer is over the PDF iframe. React's
  // synthetic onMouseEnter/Leave are unreliable on an <iframe> (it swallows the
  // delegated mouseover/out, so a slow entry never dispatches them) — attach
  // NATIVE listeners to the element instead, which always fire.
  useEffect(() => {
    const node = iframeRef.current;
    if (!node) return;
    node.addEventListener('mouseenter', hideCursor);
    node.addEventListener('mouseleave', showCursor);
    return () => {
      node.removeEventListener('mouseenter', hideCursor);
      node.removeEventListener('mouseleave', showCursor);
    };
  }, [activeId, doc]);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    // Lock scroll on BOTH <html> and <body> — the page's scroll container is the
    // root element, so locking body alone leaves the background scrollable.
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      // Clear any custom-cursor hover state that a control may have left stuck
      // if it unmounted before its mouseleave fired (e.g. clicking "close").
      document.body.classList.remove('safe-hover', 'link-hover', 'cursor-hidden-active');
    };
  }, [doc, onClose]);

  const active = doc?.sources.find(s => s.id === activeId) ?? doc?.sources[0];

  const handleDownload = useCallback(() => {
    if (active) downloadFile(active.url, active.downloadName);
  }, [active]);

  if (!doc || !active) return null;
  const showToggle = doc.sources.length > 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[19000] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-300"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      // Safety net: a move anywhere in the overlay only fires outside the iframe,
      // so it reliably restores the custom cursor even if the iframe's mouseleave
      // doesn't fire.
      onMouseMove={() => document.body.classList.remove('cursor-hidden-active')}
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
    >
      <div className="doc-viewer-panel relative flex flex-col w-[92vw] max-w-4xl h-[88vh] rounded-3xl overflow-hidden border border-white/15 dark:border-white/10 bg-white/70 dark:bg-neutral-950/70 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 ease-out">
        {/* Liquid-glass sheen */}
        <div className="doc-viewer-sheen pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h2 className="flex-1 min-w-0 truncate text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
            {doc.title}
          </h2>

          {showToggle && (
            <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.05] p-1 rounded-xl border border-black/5 dark:border-white/5">
              {doc.sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`cursor-safe flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    s.id === active.id
                      ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                  aria-pressed={s.id === active.id}
                >
                  {s.flag && <span className="text-sm leading-none">{s.flag}</span>}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleDownload}
            className="cursor-safe flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
          >
            <i className="fa-solid fa-download text-[10px]" aria-hidden="true"></i>
            <span className="hidden sm:inline">{labels.download}</span>
          </button>

          <button
            onClick={onClose}
            aria-label={labels.close}
            className="cursor-safe flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.05] text-neutral-600 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white active:scale-95 transition-all"
          >
            <i className="fa-solid fa-xmark text-base" aria-hidden="true"></i>
          </button>
        </div>

        {/* Body — embedded PDF. The iframe is a separate document that captures
            its own pointer events, so the custom cursor can't track inside it and
            would freeze at the edge it entered. Hide it while the pointer is over
            the PDF (native cursor takes over there) and restore it on leave. */}
        <div className="relative z-10 flex-1 min-h-0 p-3 sm:p-4">
          <iframe
            key={active.url}
            ref={iframeRef}
            src={active.url}
            title={doc.title}
            className="w-full h-full rounded-2xl bg-white border border-black/5 dark:border-white/5"
          />
        </div>

        {/* Mobile-only fallback — some mobile browsers (iOS) won't render PDFs in
            an iframe. Hidden on desktop, where the embed works and opening a new
            tab would otherwise strand the custom cursor over the PDF document. */}
        <div className="lg:hidden relative z-10 flex justify-center px-4 sm:px-6 py-3 border-t border-black/5 dark:border-white/5">
          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-safe inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <i className="fa-solid fa-up-right-from-square text-[10px]" aria-hidden="true"></i>
            {labels.openInNewTab}
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DocumentViewer;
