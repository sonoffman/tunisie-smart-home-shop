
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const DebugAuth = () => {
  const { user, isAdmin } = useAuth();
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('=== DEBUG AUTH STATUS ===');
      
      // Vérifier l'état de l'authentification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session Error:', sessionError);
      
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      console.log('Auth User:', authUser);
      console.log('User Error:', userError);
      
      // Vérifier les données du contexte
      console.log('Context User:', user);
      console.log('Is Admin:', isAdmin);
      
      setAuthStatus({
        session: session,
        sessionError: sessionError,
        authUser: authUser,
        userError: userError,
        contextUser: user,
        isAdmin: isAdmin,
        hasValidSession: !!session && !!authUser,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'
      });
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus({ error: error });
    }
  };

  const testCustomerCreation = async () => {
    try {
      console.log('=== TEST CUSTOMER CREATION ===');
      
      const testCustomer = {
        name: 'Test Client Debug',
        address: 'Test Address Debug',
        phone: '12345678',
        email: 'test@debug.com'
      };
      
      console.log('Attempting to create customer:', testCustomer);
      
      const { data, error } = await supabase
        .from('customers')
        .insert(testCustomer)
        .select()
        .single();
      
      console.log('Customer creation result:', { data, error });
      
      if (error) {
        setTestResults(prev => ({
          ...prev,
          customerTest: { success: false, error: error.message, details: error }
        }));
        toast({
          title: "Échec test client",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setTestResults(prev => ({
          ...prev,
          customerTest: { success: true, data: data }
        }));
        toast({
          title: "Succès test client",
          description: "Client créé avec succès",
        });
      }
    } catch (error: any) {
      console.error('Customer creation test error:', error);
      setTestResults(prev => ({
        ...prev,
        customerTest: { success: false, error: error.message }
      }));
    }
  };

  const testStorageUpload = async () => {
    try {
      console.log('=== TEST STORAGE UPLOAD ===');
      
      // Créer un fichier de test
      const testFile = new File(['test content'], 'test-debug.txt', { type: 'text/plain' });
      const fileName = `debug-test-${Date.now()}.txt`;
      
      console.log('Attempting to upload file:', fileName);
      
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, testFile);
      
      console.log('Upload result:', { data, error });
      
      if (error) {
        setTestResults(prev => ({
          ...prev,
          storageTest: { success: false, error: error.message, details: error }
        }));
        toast({
          title: "Échec test storage",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setTestResults(prev => ({
          ...prev,
          storageTest: { success: true, data: data }
        }));
        toast({
          title: "Succès test storage",
          description: "Fichier uploadé avec succès",
        });
        
        // Nettoyer le fichier de test
        await supabase.storage.from('banners').remove([fileName]);
      }
    } catch (error: any) {
      console.error('Storage upload test error:', error);
      setTestResults(prev => ({
        ...prev,
        storageTest: { success: false, error: error.message }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug Authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkAuthStatus} variant="outline">
            Rafraîchir le statut
          </Button>
          
          {authStatus && (
            <div className="space-y-2 text-sm">
              <div><strong>Session valide:</strong> {authStatus.hasValidSession ? '✅ Oui' : '❌ Non'}</div>
              <div><strong>User ID:</strong> {authStatus.authUser?.id || 'N/A'}</div>
              <div><strong>Email:</strong> {authStatus.authUser?.email || 'N/A'}</div>
              <div><strong>Is Admin:</strong> {authStatus.isAdmin ? '✅ Oui' : '❌ Non'}</div>
              <div><strong>Session expire:</strong> {authStatus.sessionExpiry}</div>
              
              {authStatus.sessionError && (
                <div className="text-red-600">
                  <strong>Erreur session:</strong> {authStatus.sessionError.message}
                </div>
              )}
              
              {authStatus.userError && (
                <div className="text-red-600">
                  <strong>Erreur utilisateur:</strong> {authStatus.userError.message}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧪 Tests de Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={testCustomerCreation} variant="outline">
              Tester création client
            </Button>
            <Button onClick={testStorageUpload} variant="outline">
              Tester upload storage
            </Button>
          </div>
          
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              {testResults.customerTest && (
                <div className="p-3 border rounded">
                  <div className="font-semibold">
                    Test Client: {testResults.customerTest.success ? '✅ Succès' : '❌ Échec'}
                  </div>
                  {testResults.customerTest.error && (
                    <div className="text-red-600 text-sm mt-1">
                      {testResults.customerTest.error}
                    </div>
                  )}
                </div>
              )}
              
              {testResults.storageTest && (
                <div className="p-3 border rounded">
                  <div className="font-semibold">
                    Test Storage: {testResults.storageTest.success ? '✅ Succès' : '❌ Échec'}
                  </div>
                  {testResults.storageTest.error && (
                    <div className="text-red-600 text-sm mt-1">
                      {testResults.storageTest.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugAuth;
