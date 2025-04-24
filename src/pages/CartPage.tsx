
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash, Plus, Minus, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, totalAmount } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (id: string, amount: number, currentQuantity: number) => {
    const newQuantity = currentQuantity + amount;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Mon Panier</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-6">Vous n'avez pas encore ajouté de produits à votre panier.</p>
            <Button onClick={() => navigate('/')}>Découvrir nos produits</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-sonoff-blue">Mon Panier</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Articles dans votre panier</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex items-center">
                    <div className="h-20 w-20 rounded overflow-hidden mr-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">Prix: {item.price.toFixed(2)} DT</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} 
                        min="1" 
                        className="w-16 text-center"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} DT</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 h-8 w-8 mt-1"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between py-2">
                  <span>Sous-total</span>
                  <span>{totalAmount.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Livraison</span>
                  <span>Gratuit</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total</span>
                  <span>{totalAmount.toFixed(2)} DT</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button onClick={handleCheckout} className="w-full">
                  Passer à la commande <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleContinueShopping} className="w-full">
                  Continuer mes achats
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
