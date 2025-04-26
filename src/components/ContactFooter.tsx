
// Do not modify this file directly. This file is part of the Lovable project template.
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ContactFooter = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Créer un bucket pour les messages de contact si nécessaire
      const { data: bucketExists } = await supabase.storage.getBucket('contact-messages');
      
      if (!bucketExists) {
        const { error: bucketError } = await supabase.storage.createBucket('contact-messages', {
          public: false,
        });
        
        if (bucketError) throw bucketError;
      }
      
      // Créer également les autres buckets nécessaires pour l'application
      // Bucket pour les images de produits
      const { data: productBucketExists } = await supabase.storage.getBucket('product-images');
      
      if (!productBucketExists) {
        const { error: productBucketError } = await supabase.storage.createBucket('product-images', {
          public: true,
        });
        
        if (productBucketError) throw productBucketError;
      }
      
      // Bucket pour les bannières
      const { data: bannerBucketExists } = await supabase.storage.getBucket('banners');
      
      if (!bannerBucketExists) {
        const { error: bannerBucketError } = await supabase.storage.createBucket('banners', {
          public: true,
        });
        
        if (bannerBucketError) throw bannerBucketError;
      }
      
      // Enregistrer le message de contact
      const { error: contactError } = await supabase
        .from('customer_issues')
        .insert([
          { 
            customer_phone: phone,
            issue_description: `Nom: ${name}\nEmail: ${email}\nMessage: ${message}`,
            resolved: false
          }
        ]);
      
      if (contactError) throw contactError;
      
      toast({
        title: "Message envoyé",
        description: "Merci de nous avoir contacté. Nous vous répondrons dès que possible.",
      });
      
      // Réinitialiser le formulaire
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      toast({
        title: "Erreur",
        description: `Une erreur s'est produite: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-sonoff-blue">Contact</h2>
            <p className="text-gray-700">
              Vous avez des questions ou des préoccupations? Contactez-nous et notre équipe vous répondra dans les plus brefs délais.
            </p>
            
            <div className="space-y-2">
              <p className="font-semibold">Adresse</p>
              <p className="text-gray-600">123 Rue de l'Innovation, Tunis 1001, Tunisie</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">Téléphone</p>
              <p className="text-gray-600">+216 71 234 567</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">Email</p>
              <p className="text-gray-600">info@sonoff-tunisie.com</p>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold">Heures d'ouverture</p>
              <p className="text-gray-600">Lundi - Vendredi: 9h - 18h</p>
              <p className="text-gray-600">Samedi: 9h - 13h</p>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-xl font-semibold mb-4">Envoyez-nous un message</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nom</label>
                  <Input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Votre nom"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Téléphone</label>
                  <Input 
                    type="tel" 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Votre email"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea 
                  id="message" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Votre message"
                  rows={4}
                />
              </div>
              
              <Button type="submit" className="w-full bg-sonoff-blue hover:bg-sonoff-teal" disabled={submitting}>
                {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFooter;
