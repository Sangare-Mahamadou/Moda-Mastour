"use client";

import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <h2>Votre panier est vide.</h2>
        <Link href="/shop" className="btn-primary" style={{ marginTop: '2rem' }}>Retourner à la boutique</Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="page-title">Votre Panier</h1>
      <div className="cart-items">
        {cart.map((item, idx) => (
          <div key={item.cartItemId || idx} className="cart-item" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="cart-item-info" style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>
                {item.name} {item.size && <span style={{fontSize: '0.9rem', color: '#666'}}>(Taille: {item.size})</span>}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>Quantité :</label>
                <input 
                  type="number" 
                  min="1" 
                  value={item.quantity} 
                  onChange={(e) => updateQuantity(item.cartItemId as string, Number(e.target.value))} 
                  style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center' }}
                />
              </div>
            </div>
            <div className="cart-item-price" style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-gold)' }}>
                {(item.price * item.quantity).toLocaleString()} FCFA
              </p>
              <button onClick={() => removeFromCart(item.cartItemId as string)} className="btn-text-danger">Retirer</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total : {total.toLocaleString()} FCFA</h3>
        <Link href="/checkout" className="btn-primary checkout-btn">Procéder au Paiement</Link>
      </div>
    </div>
  );
}
