
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

const VerifyProduct = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [verificationResult, setVerificationResult] = useState<'valid' | 'invalid' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serialNumber.trim()) return;
    
    setIsSubmitting(true);
    
    // This is a mock verification - will be replaced with Supabase
    setTimeout(() => {
      // For demo purposes: if serial starts with 'S', it's valid
      const isValid = serialNumber.toUpperCase().startsWith('S');
      setVerificationResult(isValid ? 'valid' : 'invalid');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-sonoff-blue p-6">
            <h1 className="text-2xl font-bold text-white">Vérification Produit</h1>
            <p className="text-white/80 mt-2">
              Vérifiez l'authenticité de votre produit Sonoff en saisissant le numéro de série ci-dessous.
            </p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de série
                </label>
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Exemple: S12345678"
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-sonoff-blue hover:bg-sonoff-teal"
                disabled={isSubmitting || !serialNumber.trim()}
              >
                {isSubmitting ? 'Vérification...' : 'Vérifier'}
              </Button>
            </form>
            
            {verificationResult && (
              <div className={`mt-6 p-4 rounded-md ${
                verificationResult === 'valid' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {verificationResult === 'valid' ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700 font-medium">
                      Produit Sonoff certifié CERT Tunisie (Sajalni)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700 font-medium">
                      Produit non certifié
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyProduct;
