
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
}

export const generateInvoicePdf = ({
  invoiceNumber,
  invoiceDate,
  customer,
  items,
  taxes,
  documentType = 'Facture'
}: GeneratePdfParams): jsPDF => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Colors - explicitly typed as tuples
  const primaryColor: [number, number, number] = [41, 128, 185];
  const secondaryColor: [number, number, number] = [52, 73, 94];
  const lightGray: [number, number, number] = [240, 240, 240];
  
  // Header with company logo and information
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company name and details in white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text("Smart Africa Technology", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Spécialiste en domotique et solutions IoT", 14, 27);
  doc.text("123 Rue de Tunis, Tunis 1000, Tunisie", 14, 32);
  doc.text("Tél: +216 55 123 456 | Email: contact@sonoff-store.tn", 14, 37);
  
  // Document title and number
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(documentType.toUpperCase(), 140, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoiceNumber}`, 140, 68);
  doc.text(`Date: ${format(new Date(invoiceDate), 'dd MMMM yyyy', { locale: fr })}`, 140, 76);
  
  // Customer information section
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(14, 85, 85, 35, 'F');
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Facturé à:", 18, 95);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(customer.name, 18, 102);
  doc.text(customer.address, 18, 108);
  doc.text(`Tél: ${customer.phone}`, 18, 114);
  if (customer.email) {
    doc.text(`Email: ${customer.email}`, 18, 120);
  }
  
  // Invoice items table
  const tableColumn = ["Description", "Qté", "Prix unit. HT", "Total HT"];
  const tableRows = items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toFixed(3)} DT`,
    `${item.total.toFixed(3)} DT`
  ]);
  
  // Calculate table start position
  const startY = 135;
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY,
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
      fillColor: [249, 249, 249]
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });
  
  // Totals section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals box
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(120, finalY, 76, 35, 'F');
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(10);
  
  // Totals lines
  doc.text('Sous-total HT:', 125, finalY + 8);
  doc.text(`${taxes.subtotalHT.toFixed(3)} DT`, 185, finalY + 8, { align: 'right' });
  
  doc.text('TVA (19%):', 125, finalY + 16);
  doc.text(`${taxes.tva.toFixed(3)} DT`, 185, finalY + 16, { align: 'right' });
  
  doc.text('Timbre fiscal:', 125, finalY + 24);
  doc.text(`${taxes.timbreFiscal.toFixed(3)} DT`, 185, finalY + 24, { align: 'right' });
  
  // Total TTC with emphasis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL TTC:', 125, finalY + 32);
  doc.text(`${taxes.totalTTC.toFixed(3)} DT`, 185, finalY + 32, { align: 'right' });
  
  // Footer section
  const footerY = finalY + 50;
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text("Modalités de paiement:", 14, footerY);
  doc.text("• Paiement à la livraison ou par virement bancaire", 14, footerY + 6);
  doc.text(`• Facture payable dans les 30 jours suivant la date d'émission`, 14, footerY + 12);
  
  // Thank you message
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text("Merci pour votre confiance !", 105, footerY + 25, { align: 'center' });
  
  // Add page border
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  return doc;
};
