import React, { useState } from 'react';
import { translations } from '../translations';

interface ContactProps { lang: 'es' | 'en'; }

const Contact: React.FC<ContactProps> = ({ lang }) => {
  const t = translations[lang].contact;
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Contacto Portfolio: ${formData.name}`;
    const body = `Hola Juanma,\n\nSoy ${formData.name} (${formData.email}).\n\n${formData.message}`;
    const mailtoUrl = `mailto:juanmafr2007@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSent(true);
    setTimeout(() => { setSent(false); setFormData({ name: '', email: '', message: '' }); }, 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-5xl md:text-7xl font-display font-black mb-6 tracking-tighter text-neutral-900 dark:text-white">
          {lang === 'es' ? 'Pongámonos en ' : 'Get in '}
          <span className="gradient-text">{lang === 'es' ? 'contacto' : 'touch'}</span>
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-stretch">
        {/* Info Card */}
        <div className="lg:col-span-2">
          <div className="glass-card p-10 rounded-[2.5rem] border border-black/10 dark:border-white/10 h-full flex flex-col bg-gradient-to-br from-black/[0.01] dark:from-white/[0.03] to-transparent shadow-sm dark:shadow-none">
            <h3 className="text-2xl font-bold mb-10 text-neutral-900 dark:text-white">{t.infoTitle}</h3>
            <div className="space-y-8 flex-1 flex flex-col justify-center">
              <div className="group flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{t.labels.email}</span>
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 group-hover:border-blue-600/30 dark:group-hover:border-blue-500/30 transition-all">
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate text-sm">juanmafr2007@gmail.com</span>
                  <button 
                    onClick={() => copyToClipboard('juanmafr2007@gmail.com', 'email')}
                    className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                  >
                    <i className={`fa-solid ${copied === 'email' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                  </button>
                </div>
              </div>

              <div className="group flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{t.labels.phone}</span>
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 group-hover:border-blue-600/30 dark:group-hover:border-blue-500/30 transition-all">
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium text-sm">(+34) 643 71 80 54</span>
                  <button 
                    onClick={() => copyToClipboard('643718054', 'tel')}
                    className="text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                  >
                    <i className={`fa-solid ${copied === 'tel' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                  </button>
                </div>
              </div>

              <div className="group flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{t.labels.location}</span>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <i className="fa-solid fa-location-dot text-blue-600 dark:text-blue-500"></i>
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium text-sm">{t.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="glass-card p-10 rounded-[2.5rem] h-full flex flex-col space-y-8 border border-black/10 dark:border-white/10 bg-gradient-to-br from-black/[0.01] dark:from-white/[0.03] to-transparent shadow-sm dark:shadow-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">{t.form.name}</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t.form.placeholderName}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl px-5 py-4 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600/50 dark:focus:border-blue-500/50 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">{t.form.email}</label>
                <input 
                  type="email" required value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={t.form.placeholderEmail}
                  className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl px-5 py-4 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600/50 dark:focus:border-blue-500/50 transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-700"
                />
              </div>
            </div>
            <div className="space-y-3 flex-1 flex flex-col">
              <label className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">{t.form.message}</label>
              <textarea 
                required value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder={t.form.placeholderMsg}
                className="flex-1 w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl px-5 py-4 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-600/50 dark:focus:border-blue-500/50 resize-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-700 min-h-[150px]"
              ></textarea>
            </div>
            <button 
              type="submit" disabled={sent}
              className={`cursor-hide group w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${sent ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-xl' : 'bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white shadow-xl shadow-black/10 dark:shadow-white/5'}`}
            >
              {sent ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>}
              {sent ? t.form.sent : t.form.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;