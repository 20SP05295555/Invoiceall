export async function exportDocumentAsOnePagePDF(element: HTMLElement, filename: string): Promise<void> {
  const html2canvas = (window as any).html2canvas;
  if (!html2canvas) {
    throw new Error('html2canvas is not loaded');
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth || 1024,
    ignoreElements: (el: Element) => el.classList?.contains('print:hidden') || el.hasAttribute?.('data-html2canvas-ignore')
  });

  const jsPDF = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
  if (!jsPDF) {
    throw new Error('jsPDF library is not loaded');
  }

  // Create strict 1-page A4 document (210mm x 297mm / 8.27in x 11.69in)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10; // 10mm padding on all sides
  const availWidth = pdfWidth - margin * 2;
  const availHeight = pdfHeight - margin * 2;

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const imgProps = pdf.getImageProperties(imgData);

  // Scale image to fit strictly within 1 page without clipping
  let imgWidth = availWidth;
  let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  if (imgHeight > availHeight) {
    imgHeight = availHeight;
    imgWidth = (imgProps.width * imgHeight) / imgProps.height;
  }

  // Center horizontally on page
  const x = (pdfWidth - imgWidth) / 2;
  const y = margin;

  pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export async function exportDocumentAsJPEG(element: HTMLElement, filename: string): Promise<void> {
  const html2canvas = (window as any).html2canvas;
  if (!html2canvas) {
    throw new Error('html2canvas is not loaded');
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth || 1024,
    ignoreElements: (el: Element) => el.classList?.contains('print:hidden') || el.hasAttribute?.('data-html2canvas-ignore')
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const link = document.createElement('a');
  link.href = imgData;
  link.download = filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? filename : `${filename}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
