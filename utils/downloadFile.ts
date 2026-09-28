// Generic file download via a transient anchor element.
// Used by the document viewer and the certification cards.
export function downloadFile(url: string, name: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
