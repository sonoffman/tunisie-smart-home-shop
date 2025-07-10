
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const DebugAuthStatus = () => {
  const { user, isAdmin, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('=== DEBUG AUTH STATUS ===');
      
      // Vérifier la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session Error:', sessionError);
      
      // Vérifier l'utilisateur
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      console.log('Auth User:', authUser);
      console.log('User Error:', userError);
      
      // Vérifier le profil
      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        console.log('Profile:', profile);
        console.log('Profile Error:', profileError);
        
        // Tester la fonction is_admin
        const { data: adminCheck, error: adminError } = await supabase
          .rpc('is_admin', { user_id: authUser.id });
        
        console.log('Admin Check:', adminCheck);
        console.log('Admin Error:', adminError);
        
        setDebugInfo({
          session: session,
          sessionError: sessionError,
          authUser: authUser,
          userError: userError,
          profile: profile,
          profileError: profileError,
          adminCheck: adminCheck,
          adminError: adminError,
          contextUser: user,
          contextIsAdmin: isAdmin,
          contextLoading: loading
        });
      }
    };
    
    checkAuth();
  }, [user, isAdmin, loading]);

  if (!user) {
    return (
      <div className="fixed top-4 right-4 p-4 bg-red-100 border border-red-400 rounded max-w-md">
        <h3 className="font-bold text-red-800">🔍 Debug: Utilisateur non connecté</h3>
        <p className="text-red-700">Vous devez vous connecter d'abord</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 p-4 bg-blue-100 border border-blue-400 rounded max-w-md max-h-96 overflow-y-auto">
      <h3 className="font-bold text-blue-800">🔍 Debug Auth Status</h3>
      <div className="text-sm mt-2 space-y-1">
        <div><strong>User ID:</strong> {user?.id}</div>
        <div><strong>Email:</strong> {user?.email}</div>
        <div><strong>Is Admin (Context):</strong> {isAdmin ? '✅' : '❌'}</div>
        <div><strong>Loading:</strong> {loading ? '⏳' : '✅'}</div>
        
        {debugInfo && (
          <>
            <hr className="my-2" />
            <div><strong>Session Valid:</strong> {debugInfo.session ? '✅' : '❌'}</div>
            <div><strong>Profile Found:</strong> {debugInfo.profile ? '✅' : '❌'}</div>
            <div><strong>Profile Role:</strong> {debugInfo.profile?.role || 'N/A'}</div>
            <div><strong>Admin RPC:</strong> {debugInfo.adminCheck ? '✅' : '❌'}</div>
            
            {debugInfo.profileError && (
              <div className="text-red-600"><strong>Profile Error:</strong> {debugInfo.profileError.message}</div>
            )}
            {debugInfo.adminError && (
              <div className="text-red-600"><strong>Admin Error:</strong> {debugInfo.adminError.message}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DebugAuthStatus;
