
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
}

export const generateInvoicePdf = ({
  invoiceNumber,
  invoiceDate,
  customer,
  items,
  taxes
}: GeneratePdfParams): jsPDF => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add company logo and information
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Smart Africa Technology", 14, 20);
  doc.text("123 Rue de Tunis", 14, 25);
  doc.text("Tunis, Tunisie", 14, 30);
  doc.text("Tel: +216 55 123 456", 14, 35);
  doc.text("Email: contact@sonoff-store.tn", 14, 40);
  
  // Add customer information (moved to left side)
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Facturé à:", 14, 50);
  doc.setTextColor(0, 0, 0);
  doc.text(customer.name, 14, 55);
  doc.text(customer.address, 14, 60);
  doc.text(`Tel: ${customer.phone}`, 14, 65);
  if (customer.email) {
    doc.text(`Email: ${customer.email}`, 14, 70);
  }
  
  // Add invoice title and number
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("FACTURE", 150, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text(`N° ${invoiceNumber}`, 150, 27, { align: "center" });
  doc.text(`Date: ${format(new Date(invoiceDate), 'dd MMMM yyyy', { locale: fr })}`, 150, 32, { align: "center" });
  
  // Add invoice items table
  const tableColumn = ["Description", "Quantité", "Prix unitaire (DT)", "Total (DT)"];
  const tableRows = items.map(item => [
    item.description,
    item.quantity.toString(),
    item.unitPrice.toFixed(3),
    item.total.toFixed(3)
  ]);
  
  // Use autoTable with proper import
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 80,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    foot: [
      [{ content: 'Sous-total HT:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.subtotalHT.toFixed(3)],
      [{ content: 'TVA (19%):', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.tva.toFixed(3)],
      [{ content: 'Timbre fiscal:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.timbreFiscal.toFixed(3)],
      [{ content: 'Total TTC:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, taxes.totalTTC.toFixed(3)]
    ],
    footStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add payment information and terms
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text("Modalités de paiement:", 14, finalY);
  doc.text("Paiement à la livraison ou par virement bancaire", 14, finalY + 5);
  doc.text("Merci pour votre confiance!", 105, finalY + 20, { align: "center" });

  return doc;
};
