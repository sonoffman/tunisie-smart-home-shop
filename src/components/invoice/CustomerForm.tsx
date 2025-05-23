
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CustomerFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface CustomerFormProps {
  onCustomerCreated: (customerId: string) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onCustomerCreated, onCancel }) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.phone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          email: formData.email || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Client créé avec succès",
      });

      onCustomerCreated(data.id);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de créer le client: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nom du client"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Numéro de téléphone"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Adresse email (optionnel)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse *</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Adresse complète du client"
          required
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer le client'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
