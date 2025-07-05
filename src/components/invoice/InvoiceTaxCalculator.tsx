
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvoiceTaxCalculatorProps {
  subtotal: number; // Total TTC des articles
  onCalculate: (values: {
    subtotalHT: number;
    tva: number;
    timbreFiscal: number;
    totalTTC: number;
  }) => void;
}

const InvoiceTaxCalculator = ({ subtotal, onCalculate }: InvoiceTaxCalculatorProps) => {
  const [timbreFiscal, setTimbreFiscal] = useState(1.0);
  const [tvaRate] = useState(19); // 19% fixe

  useEffect(() => {
    // Calcul du HT à partir du TTC
    const subtotalHT = subtotal / 1.19; // Prix HT = Prix TTC / 1.19
    const tva = subtotalHT * (tvaRate / 100);
    const totalTTC = subtotalHT + tva + timbreFiscal;

    onCalculate({
      subtotalHT,
      tva,
      timbreFiscal,
      totalTTC
    });
  }, [subtotal, timbreFiscal, tvaRate, onCalculate]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label>Sous-total TTC articles</Label>
          <div className="text-lg font-semibold">{subtotal.toFixed(3)} DT</div>
        </div>
        <div>
          <Label>Sous-total HT calculé</Label>
          <div className="text-lg font-semibold">{(subtotal / 1.19).toFixed(3)} DT</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timbre-fiscal">Timbre Fiscal (DT)</Label>
        <Input
          id="timbre-fiscal"
          type="number"
          step="0.001"
          value={timbreFiscal}
          onChange={(e) => setTimbreFiscal(parseFloat(e.target.value) || 1.0)}
          className="w-full"
        />
      </div>

      <div className="border-t pt-4">
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Sous-total HT:</span>
            <span>{(subtotal / 1.19).toFixed(3)} DT</span>
          </div>
          <div className="flex justify-between">
            <span>TVA (19%):</span>
            <span>{((subtotal / 1.19) * 0.19).toFixed(3)} DT</span>
          </div>
          <div className="flex justify-between">
            <span>Timbre fiscal:</span>
            <span>{timbreFiscal.toFixed(3)} DT</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total TTC:</span>
            <span>{((subtotal / 1.19) + ((subtotal / 1.19) * 0.19) + timbreFiscal).toFixed(3)} DT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTaxCalculator;
