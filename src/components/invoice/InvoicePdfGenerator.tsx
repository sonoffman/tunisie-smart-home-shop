
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice, Customer, InvoiceItem } from '@/types/supabase';

interface InvoiceParameters {
  documentType: 'Facture' | 'Devis' | 'Bon de Livraison';
  footerMessage: string;
}

export const generateInvoicePDF = (
  invoice: Invoice,
  customer: Customer,
  parameters: InvoiceParameters
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Configuration des couleurs
  const primaryColor = [41, 128, 185]; // Bleu professionnel
  const secondaryColor = [52, 73, 94]; // Gris foncé
  const lightGray = [236, 240, 241];

  // En-tête avec logo et informations entreprise
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SONOFF TUNISIE', margin, 25);

  // Informations entreprise (à droite)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const companyInfo = [
    'Adresse de votre entreprise',
    'Ville, Code Postal',
    'Tél: +216 XX XX XX XX',
    'Email: contact@sonoff-tunisie.tn'
  ];
  
  companyInfo.forEach((line, index) => {
    doc.text(line, pageWidth - margin, 15 + (index * 4), { align: 'right' });
  });

  // Type de document et numéro
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(parameters.documentType.toUpperCase(), margin, 55);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.invoice_number}`, margin, 65);
  doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}`, margin, 75);

  // Informations client (encadré)
  doc.setFillColor(...lightGray);
  doc.rect(margin, 85, pageWidth - (2 * margin), 35, 'F');
  doc.setDrawColor(...secondaryColor);
  doc.rect(margin, 85, pageWidth - (2 * margin), 35);
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', margin + 5, 95);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(customer.name, margin + 5, 105);
  doc.text(customer.address, margin + 5, 112);
  if (customer.phone) doc.text(customer.phone, margin + 5, 119);
  if (customer.email) doc.text(customer.email, margin + 5, 126);

  // Tableau des articles
  const tableStartY = 135;
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  
  const tableData = items.map((item: InvoiceItem) => {
    const ttc = item.unitPrice;
    const ht = ttc / 1.19; // Calcul HT correct
    const tva = ttc - ht;
    
    return [
      item.description,
      item.quantity.toString(),
      `${ht.toFixed(3)} TND`,
      `${tva.toFixed(3)} TND`,
      `${ttc.toFixed(3)} TND`,
      `${(ttc * item.quantity).toFixed(3)} TND`
    ];
  });

  (doc as any).autoTable({
    startY: tableStartY,
    head: [['Désignation', 'Qté', 'Prix unit. HT', 'TVA unit.', 'Prix unit. TTC', 'Total TTC']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: secondaryColor
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    }
  });

  // Totaux (alignés à droite)
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Calculs corrects
  const realSubtotalHT = items.reduce((sum: number, item: InvoiceItem) => {
    return sum + ((item.unitPrice / 1.19) * item.quantity);
  }, 0);
  
  const totalTVA = items.reduce((sum: number, item: InvoiceItem) => {
    const ht = item.unitPrice / 1.19;
    const tva = item.unitPrice - ht;
    return sum + (tva * item.quantity);
  }, 0);

  const totalsData = [
    ['Sous-total HT:', `${realSubtotalHT.toFixed(3)} TND`],
    ['TVA (19%):', `${totalTVA.toFixed(3)} TND`],
    ['Timbre fiscal:', '1.000 TND'],
    ['Total TTC:', `${invoice.total_ttc.toFixed(3)} TND`]
  ];

  (doc as any).autoTable({
    startY: finalY,
    body: totalsData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      textColor: secondaryColor,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold', halign: 'right' },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: pageWidth - 100, right: margin }
  });

  // Message personnalisé
  if (parameters.footerMessage) {
    const messageY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...primaryColor);
    doc.text(parameters.footerMessage, pageWidth / 2, messageY, { align: 'center' });
  }

  // Pied de page
  const footerY = doc.internal.pageSize.height - 30;
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci de votre confiance | www.sonoff-tunisie.tn', pageWidth / 2, footerY + 15, { align: 'center' });

  return doc;
};
