"use client";

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({ name: '', phone: '', method: 'Orange Money' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Construction du message WhatsApp détaillé
    let message = `Bonjour Moda Mastou ! 👋\nJe souhaite passer une commande.\n\n*Client(e) :* ${formData.name}\n*Contact Paiement :* ${formData.phone} (${formData.method})\n\n*Détails de la commande :*\n`;
    
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (${(item.price * item.quantity).toLocaleString()} FCFA)\n`;
    });
    
    message += `\n*TOTAL À PAYER : ${total.toLocaleString()} FCFA*`;
    
    // Encodage du texte pour l'URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/2250767183515?text=${encodedMessage}`;
    
    setTimeout(() => {
      clearCart();
      window.location.href = whatsappUrl; // Redirige vers WhatsApp
    }, 800);
  };

  if (cart.length === 0) {
    return <div className="checkout-container"><p>Votre panier est vide.</p></div>;
  }

  return (
    <div className="checkout-container">
      <h1 className="page-title">Finaliser l'achat</h1>
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label>Nom complet</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Awa Koné" />
        </div>
        <div className="form-group">
          <label>Numéro de Téléphone (Mobile Money)</label>
          <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ex: 0707xx..." />
        </div>
        <div className="form-group">
          <label>Moyen de Paiement</label>
          <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
            <option value="Orange Money">Orange Money</option>
            <option value="MTN Mobile Money">MTN Mobile Money</option>
            <option value="Moov Money">Moov Money</option>
            <option value="Wave">Wave</option>
          </select>
        </div>
        
        <div className="checkout-summary">
          <h3>Total à payer : {total.toLocaleString()} FCFA</h3>
        </div>

        <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting} style={{ backgroundColor: '#25D366' }}>
          {isSubmitting ? "Redirection vers WhatsApp..." : `Payer et Envoyer par WhatsApp`}
        </button>
      </form>
    </div>
  );
}
