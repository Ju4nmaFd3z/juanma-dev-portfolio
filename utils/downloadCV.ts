export function downloadCV(lang: 'es' | 'en'): void {
  const fileName = lang === 'es'
    ? 'CVJuanManuelFernandezRodriguezES.pdf'
    : 'CVJuanManuelFernandezRodriguezEN.pdf';
  const link = document.createElement('a');
  link.href = `/${fileName}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
