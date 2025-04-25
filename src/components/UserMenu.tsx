
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';

export function UserMenu() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  // Sortie de débogage pour diagnostiquer le problème
  console.log("UserMenu rendering - User:", user?.email);
  console.log("UserMenu rendering - Is Admin:", isAdmin);

  if (!user) {
    return (
      <>
        <Button variant="ghost" onClick={() => setShowAuthModal(true)}>
          <User className="h-5 w-5 mr-2" />
          Connexion
        </Button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="flex items-center">
      {isAdmin && (
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')}
          className="text-sonoff-blue hover:text-sonoff-orange transition-colors mr-2"
        >
          <Shield className="h-5 w-5 mr-2" />
          Admin
        </Button>
      )}
    
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <User className="h-5 w-5 mr-2" />
            Mon Compte
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <Settings className="mr-2 h-4 w-4" />
            Profil
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              <Shield className="mr-2 h-4 w-4" />
              Administration
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
