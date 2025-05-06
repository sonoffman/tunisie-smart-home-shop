
import React from 'react';

interface InvoiceTaxCalculatorProps {
  subtotal: number;
  onCalculate: (values: {
    subtotalHT: number;
    tva: number;
    timbreFiscal: number;
    totalTTC: number;
  }) => void;
}

/**
 * Calcule les taxes pour une facture
 * - Le prix TTC des produits est déjà inclus dans le sous-total
 * - On calcule le prix HT en divisant par 1.19 (TVA à 19%)
 * - On ajoute 1 DT de timbre fiscal
 */
const InvoiceTaxCalculator: React.FC<InvoiceTaxCalculatorProps> = ({ subtotal, onCalculate }) => {
  React.useEffect(() => {
    // Le prix est en TTC, donc on calcule le HT
    const subtotalHT = +(subtotal / 1.19).toFixed(3);
    const tva = +(subtotal - subtotalHT).toFixed(3);
    const timbreFiscal = 1; // 1 DT de timbre fiscal
    const totalTTC = +(subtotal + timbreFiscal).toFixed(3);

    onCalculate({
      subtotalHT,
      tva,
      timbreFiscal,
      totalTTC
    });
  }, [subtotal, onCalculate]);

  return null; // Ce composant ne rend rien, il effectue simplement des calculs
};

export default InvoiceTaxCalculator;
