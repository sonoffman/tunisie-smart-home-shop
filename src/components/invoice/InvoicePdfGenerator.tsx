
import { Customer, InvoiceItem } from '@/types/supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GeneratePdfParams {
  invoiceNumber: string;
  invoiceDate: string;
  customer: Customer;
  items: InvoiceItem[];
  taxes: {
    subtotalHT: number;
    tva: number;
    timbreFiscal: number;
    totalTTC: number;
  };
  documentType?: string;
  footerMessage?: string;
}

export const generateInvoicePdf = ({
  invoiceNumber,
  invoiceDate,
  customer,
  items,
  taxes,
  documentType = 'Facture',
  footerMessage = 'Merci de votre confiance !'
}: GeneratePdfParams): jsPDF => {
  const doc = new jsPDF();
  
  // Colors - explicitly typed as tuples
  const primaryColor: [number, number, number] = [41, 128, 185];
  const secondaryColor: [number, number, number] = [52, 73, 94];
  const lightGray: [number, number, number] = [240, 240, 240];
  const orange: [number, number, number] = [243, 156, 18];
  
  // Header with modern design
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Company logo area (placeholder)
  doc.setFillColor(255, 255, 255);
  doc.rect(14, 10, 30, 20, 'F');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(8);
  doc.text('LOGO', 29, 22, { align: 'center' });
  
  // Company information in white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("Smart Africa Technology", 50, 20);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text("Spécialiste en domotique et solutions IoT", 50, 28);
  doc.text("123 Rue de Tunis, Tunis 1000, Tunisie", 50, 35);
  doc.text("Tél: +216 55 123 456 | Email: contact@sonoff-store.tn", 50, 42);
  
  // Document title and number with modern styling
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(140, 60, 56, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(documentType.toUpperCase(), 168, 70, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoiceNumber}`, 168, 78, { align: 'center' });
  doc.text(`Date: ${format(new Date(invoiceDate), 'dd/MM/yyyy', { locale: fr })}`, 168, 85, { align: 'center' });
  
  // Customer information with modern box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(14, 95, 90, 40, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(14, 95, 90, 40);
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Facturé à:", 18, 105);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(customer.name, 18, 115);
  doc.text(customer.address, 18, 122);
  doc.text(`Tél: ${customer.phone}`, 18, 129);
  if (customer.email) {
    doc.text(`Email: ${customer.email}`, 18, 136);
  }
  
  // Invoice items table with better styling
  const tableColumn = ["Description", "Qté", "Prix unit. HT", "Total HT"];
  const tableRows = items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toFixed(3)} DT`,
    `${item.total.toFixed(3)} DT`
  ]);
  
  const startY = 150;
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor, 
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: secondaryColor
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249]
    },
    columnStyles: {
      0: { cellWidth: 85, halign: 'left' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });
  
  // Totals section with modern design
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Totals box with border
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(120, finalY, 76, 45, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(120, finalY, 76, 45);
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Totals lines
  doc.text('Sous-total HT:', 125, finalY + 10);
  doc.text(`${taxes.subtotalHT.toFixed(3)} DT`, 190, finalY + 10, { align: 'right' });
  
  doc.text('TVA (19%):', 125, finalY + 20);
  doc.text(`${taxes.tva.toFixed(3)} DT`, 190, finalY + 20, { align: 'right' });
  
  doc.text('Timbre fiscal:', 125, finalY + 30);
  doc.text(`${taxes.timbreFiscal.toFixed(3)} DT`, 190, finalY + 30, { align: 'right' });
  
  // Draw line before total
  doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.line(125, finalY + 35, 190, finalY + 35);
  
  // Total TTC with emphasis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(125, finalY + 37, 65, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC:', 128, finalY + 42);
  doc.text(`${taxes.totalTTC.toFixed(3)} DT`, 187, finalY + 42, { align: 'right' });
  
  // Footer section with custom message
  const footerY = finalY + 60;
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text("Modalités de paiement:", 14, footerY);
  doc.text("• Paiement à la livraison ou par virement bancaire", 14, footerY + 8);
  doc.text("• Document payable dans les 30 jours suivant la date d'émission", 14, footerY + 16);
  
  // Custom footer message
  if (footerMessage) {
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text(footerMessage, 105, footerY + 30, { align: 'center' });
  }
  
  // Add decorative border
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.rect(5, 5, 200, 287);

  return doc;
};
