
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const DebugPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [debugResults, setDebugResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
            <p>Vous devez être connecté en tant qu'administrateur pour accéder à cette page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const runDebugTests = async () => {
    setTesting(true);
    const results: any = {};
    
    try {
      // Test 1: Vérifier l'authentification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      results.session = { session: !!session, error: sessionError };
      
      // Test 2: Vérifier le profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      results.profile = { data: profile, error: profileError };
      
      // Test 3: Vérifier la fonction is_admin
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin', { user_id: user.id });
      results.adminCheck = { data: adminCheck, error: adminError };
      
      // Test 4: Tester la création d'un client (sans réellement créer)
      const testCustomer = {
        name: 'Test Customer - ' + Date.now(),
        address: 'Test Address',
        phone: '12345678',
        email: 'test@test.com'
      };
      
      const { data: customerTest, error: customerError } = await supabase
        .from('customers')
        .insert([testCustomer])
        .select()
        .single();
      
      results.customerTest = { data: customerTest, error: customerError };
      
      // Si le client a été créé, le supprimer
      if (customerTest && !customerError) {
        await supabase
          .from('customers')
          .delete()
          .eq('id', customerTest.id);
      }
      
      // Test 5: Tester l'accès au bucket banners
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      results.bucketsTest = { data: buckets, error: bucketsError };
      
      setDebugResults(results);
      
    } catch (error: any) {
      console.error('Erreur lors des tests:', error);
      results.globalError = error.message;
      setDebugResults(results);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-sonoff-blue">Page de Debug</h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations d'authentification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Is Admin:</strong> {isAdmin ? '✅ Oui' : '❌ Non'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tests de diagnostic</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runDebugTests} 
                disabled={testing}
                className="mb-4"
              >
                {testing ? 'Tests en cours...' : 'Lancer les tests'}
              </Button>

              {debugResults && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Résultats des tests:</h3>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(debugResults, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DebugPage;
