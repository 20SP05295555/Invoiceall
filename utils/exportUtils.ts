export async function exportDocumentAsOnePagePDF(element: HTMLElement, filename: string, pages: number = 1): Promise<void> {
  const html2canvas = (window as any).html2canvas;
  if (!html2canvas) {
    throw new Error('html2canvas is not loaded');
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: null,
    logging: false,
    windowWidth: element.scrollWidth || 1024,
    ignoreElements: (el: Element) => el.classList?.contains('print:hidden') || el.hasAttribute?.('data-html2canvas-ignore')
  });

  const jsPDF = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
  if (!jsPDF) {
    throw new Error('jsPDF library is not loaded');
  }

  // Create A4 document (210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const imgProps = pdf.getImageProperties(imgData);

  if (pages === 2) {
    // 2-page full width export without shrinking or clipping
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // Page 1
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Page 2
    pdf.addPage('a4', 'portrait');
    pdf.addImage(imgData, 'JPEG', 0, -pdfHeight, imgWidth, imgHeight);
  } else {
    // 1-page fit edge-to-edge (margin = 0 so it fills completely width-wise)
    let imgWidth = pdfWidth;
    let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = (imgProps.width * imgHeight) / imgProps.height;
    }

    // Center horizontally if slightly adjusted
    const x = (pdfWidth - imgWidth) / 2;
    const y = 0;

    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export async function checkNeedsTwoPages(element: HTMLElement): Promise<boolean> {
  if (!element) return false;
  const ratio = element.scrollHeight / (element.scrollWidth || 1);
  // Standard A4 aspect ratio is 1.414. If ratio > 1.32, squeezing to 1 page shrinks content or cuts off
  return ratio > 1.32;
}

export async function exportDocumentAsJPEG(element: HTMLElement, filename: string): Promise<void> {
  const html2canvas = (window as any).html2canvas;
  if (!html2canvas) {
    throw new Error('html2canvas is not loaded');
  }

  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: null,
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
