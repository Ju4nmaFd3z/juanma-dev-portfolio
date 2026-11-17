import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/** Last line of defence: if rendering throws, offer a reload instead of a blank page. */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[app] render failed', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const es = document.documentElement.lang !== 'en';
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0a0d', color: '#d2c9bb', fontFamily: 'Geist, system-ui, sans-serif', textAlign: 'center', padding: '2rem' }}>
        <div>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>{es ? 'Algo ha ido mal al cargar la página.' : 'Something went wrong loading the page.'}</p>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: '0.7rem 1.5rem', background: '#ff8a3a', color: '#120a05', border: 0, borderRadius: 999, cursor: 'pointer', fontWeight: 600 }}>
            {es ? 'Recargar' : 'Reload'}
          </button>
        </div>
      </div>
    );
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
