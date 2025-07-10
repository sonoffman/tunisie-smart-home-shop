
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
  try {
    console.log('Starting PDF generation with data:', { invoice, customer, parameters });
    
    // Vérifications de sécurité
    if (!invoice || !customer) {
      throw new Error('Données manquantes: facture ou client');
    }

    if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      throw new Error('Aucun article trouvé dans la facture');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Configuration des couleurs avec typage correct
    const primaryColor: [number, number, number] = [41, 128, 185];
    const secondaryColor: [number, number, number] = [52, 73, 94];
    const lightGray: [number, number, number] = [236, 240, 241];
    const accentColor: [number, number, number] = [46, 204, 113];

    // En-tête moderne avec dégradé
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Ajout d'un effet de dégradé visuel avec une bande plus claire
    doc.setFillColor(52, 152, 219);
    doc.rect(0, 35, pageWidth, 5, 'F');
    
    // Logo et nom de l'entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('SONOFF TUNISIE', margin, 25);

    // Informations entreprise à droite
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const companyInfo = [
      'Spécialiste en domotique intelligente',
      'Tunis, Tunisie',
      'Tél: +216 50 33 00 00',
      'Email: contact@sonoff-tunisie.tn'
    ];
    
    let yPos = 12;
    companyInfo.forEach((line) => {
      doc.text(line, pageWidth - margin, yPos, { align: 'right' });
      yPos += 4;
    });

    // Type de document avec style moderne
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    
    // Couleur spécifique selon le type de document
    if (parameters.documentType === 'Facture') {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    } else if (parameters.documentType === 'Devis') {
      doc.setTextColor(243, 156, 18); // Orange
    } else {
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    }
    
    doc.text(parameters.documentType.toUpperCase(), margin, 60);
    
    // Numéro et date avec encadré stylé
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(margin, 70, pageWidth - (2 * margin), 25, 3, 3, 'F');
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, 70, pageWidth - (2 * margin), 25, 3, 3, 'S');
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° ${invoice.invoice_number}`, margin + 5, 82);
    doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}`, margin + 5, 90);

    // Informations client avec design moderne
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, 105, pageWidth - (2 * margin), 40, 5, 5, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1);
    doc.roundedRect(margin, 105, pageWidth - (2 * margin), 40, 5, 5, 'S');
    
    // Titre client avec icône
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 CLIENT', margin + 10, 118);
    
    // Informations client
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    let clientY = 128;
    doc.text(customer.name, margin + 10, clientY);
    clientY += 5;
    doc.text(customer.address, margin + 10, clientY);
    clientY += 5;
    if (customer.phone) {
      doc.text(`📞 ${customer.phone}`, margin + 10, clientY);
      clientY += 5;
    }
    if (customer.email) {
      doc.text(`📧 ${customer.email}`, margin + 10, clientY);
    }

    // Tableau des articles avec style professionnel
    const tableStartY = 155;
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    
    console.log('Processing items for PDF table:', items);
    
    // Calculs corrects - convertir TTC vers HT
    const tableData = items.map((item: any, index: number) => {
      // Les prix dans les commandes sont en TTC, il faut les convertir en HT
      const priceTTC = Number(item.unitPrice) || Number(item.price) || 0;
      const priceHT = priceTTC / 1.19; // Convertir TTC vers HT
      const tvaUnitaire = priceTTC - priceHT; // TVA unitaire
      const quantity = Number(item.quantity) || 0;
      const totalHT = priceHT * quantity; // Total HT
      const totalTTC = priceTTC * quantity; // Total TTC
      
      console.log(`Item ${index + 1} calculations:`, {
        description: item.description,
        priceTTC,
        priceHT: priceHT.toFixed(3),
        tvaUnitaire: tvaUnitaire.toFixed(3),
        quantity,
        totalHT: totalHT.toFixed(3),
        totalTTC: totalTTC.toFixed(3)
      });
      
      return [
        item.description || item.name || `Article ${index + 1}`,
        quantity.toString(),
        `${priceHT.toFixed(3)} DT`,
        `${tvaUnitaire.toFixed(3)} DT`,
        `${priceTTC.toFixed(3)} DT`,
        `${totalTTC.toFixed(3)} DT`
      ];
    });

    (doc as any).autoTable({
      startY: tableStartY,
      head: [['Désignation', 'Qté', 'Prix unit. HT', 'TVA unit.', 'Prix unit. TTC', 'Total TTC']],
      body: tableData,
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
        fillColor: [248, 249, 250]
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 70, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.3
      }
    });

    // Totaux avec design moderne
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Utiliser les totaux de la facture (qui sont déjà corrects)
    const subtotalHT = Number(invoice.subtotal_ht) || 0;
    const totalTVA = Number(invoice.tva) || 0;
    const timbreFiscal = Number(invoice.timbre_fiscal) || 1.0;
    const totalTTC = Number(invoice.total_ttc) || 0;

    console.log('PDF totals:', {
      subtotalHT: subtotalHT.toFixed(3),
      totalTVA: totalTVA.toFixed(3),
      timbreFiscal: timbreFiscal.toFixed(3),
      totalTTC: totalTTC.toFixed(3)
    });

    // Encadré pour les totaux
    const totalsWidth = 80;
    const totalsX = pageWidth - margin - totalsWidth;
    
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(totalsX, finalY - 5, totalsWidth, 50, 3, 3, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.8);
    doc.roundedRect(totalsX, finalY - 5, totalsWidth, 50, 3, 3, 'S');

    const totalsData = [
      ['Sous-total HT:', `${subtotalHT.toFixed(3)} DT`],
      ['TVA (19%):', `${totalTVA.toFixed(3)} DT`],
      ['Timbre fiscal:', `${timbreFiscal.toFixed(3)} DT`],
      ['TOTAL TTC:', `${totalTTC.toFixed(3)} DT`]
    ];

    let totalY = finalY + 5;
    totalsData.forEach((row, index) => {
      doc.setFontSize(10);
      if (index === totalsData.length - 1) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(12);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      }
      
      doc.text(row[0], totalsX + 5, totalY, { align: 'left' });
      doc.text(row[1], totalsX + totalsWidth - 5, totalY, { align: 'right' });
      totalY += 8;
    });

    // Message personnalisé avec style
    if (parameters.footerMessage) {
      const messageY = finalY + 70;
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.roundedRect(margin, messageY - 5, pageWidth - (2 * margin), 20, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(255, 255, 255);
      doc.text(parameters.footerMessage, pageWidth / 2, messageY + 5, { align: 'center' });
    }

    // Pied de page moderne
    const footerY = pageHeight - 25;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, footerY, pageWidth, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('🌐 www.sonoff-tunisie.tn | 📞 +216 50 33 00 00 | 📧 contact@sonoff-tunisie.tn', 
             pageWidth / 2, footerY + 15, { align: 'center' });

    console.log('PDF generation completed successfully');
    return doc;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`Erreur lors de la génération du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};
