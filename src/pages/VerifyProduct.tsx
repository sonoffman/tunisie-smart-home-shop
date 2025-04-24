
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, XCircle, Search } from 'lucide-react';

const VerifyProduct = () => {
  const { toast } = useToast();
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    message: string;
    productName?: string;
  } | null>(null);

  const handleSerialCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serialNumber.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro de série",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      // Check if serial exists in the database
      const { data: serialData, error: serialError } = await supabase
        .from('serial_numbers')
        .select(`
          is_valid,
          products:product_id (
            name
          )
        `)
        .eq('serial_number', serialNumber.trim())
        .maybeSingle();
        
      if (serialError) throw serialError;
      
      // Log verification attempt
      await supabase
        .from('verification_requests')
        .insert([{
          serial_number: serialNumber.trim(),
          is_valid: !!serialData,
        }]);
      
      if (!serialData) {
        setResult({
          isValid: false,
          message: "Numéro de série invalide. Ce produit n'est pas authentique ou n'existe pas dans notre base de données."
        });
      } else if (!serialData.is_valid) {
        setResult({
          isValid: false,
          message: "Ce numéro de série a été marqué comme invalide. Veuillez contacter notre service client."
        });
      } else {
        setResult({
          isValid: true,
          message: "Numéro de série valide. Le produit est authentique.",
          productName: serialData.products?.name
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2 text-sonoff-blue">Vérification de produit</h1>
        <p className="text-gray-600 mb-8">
          Vérifiez l'authenticité de votre produit SONOFF en entrant son numéro de série ci-dessous.
        </p>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Vérification du numéro de série</CardTitle>
              <CardDescription>
                Entrez le numéro de série de votre produit SONOFF pour vérifier son authenticité.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSerialCheck}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serial-number">Numéro de série</Label>
                  <Input
                    id="serial-number"
                    placeholder="Ex: SON12345678"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                  />
                </div>
                
                {result && (
                  <div className={`p-4 rounded-md ${result.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex">
                      {result.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <p className={result.isValid ? 'text-green-700' : 'text-red-700'}>
                          {result.message}
                        </p>
                        {result.productName && (
                          <p className="text-green-600 mt-2">
                            Produit: <strong>{result.productName}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Vérification...' : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Vérifier
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="mt-8 bg-blue-50 p-4 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">Comment trouver votre numéro de série ?</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
              <li>Le numéro de série se trouve généralement sur l'étiquette du produit.</li>
              <li>Il peut également être imprimé sur l'emballage d'origine.</li>
              <li>Pour certains produits, vous pouvez le trouver dans les paramètres de l'application.</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyProduct;
