
import React from 'react';

interface InvoiceSummaryProps {
  subtotalHT: number;
  tva: number;
  timbreFiscal: number;
  totalTTC: number;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotalHT,
  tva,
  timbreFiscal,
  totalTTC,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Sous-total HT:</span>
          <span>{subtotalHT.toFixed(3)} DT</span>
        </div>
        <div className="flex justify-between">
          <span>TVA (19%):</span>
          <span>{tva.toFixed(3)} DT</span>
        </div>
        <div className="flex justify-between">
          <span>Timbre fiscal:</span>
          <span>{timbreFiscal.toFixed(3)} DT</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total TTC:</span>
          <span>{totalTTC.toFixed(3)} DT</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
