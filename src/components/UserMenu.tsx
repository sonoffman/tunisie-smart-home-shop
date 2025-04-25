
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
import { User, LogOut, Settings, Shield, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { useCart } from '@/contexts/CartContext';

export function UserMenu() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

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
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        onClick={() => navigate('/cart')}
        className="relative"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Panier
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-sonoff-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Button>
      
      {isAdmin === true && (
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin')}
          className="text-sonoff-blue hover:text-sonoff-orange transition-colors"
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
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <Settings className="mr-2 h-4 w-4" />
            Profil
          </DropdownMenuItem>
          {isAdmin === true && (
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
