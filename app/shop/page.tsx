"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (quantity > 0) {
      addToCart({ ...product, quantity });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="product-card">
      <div 
        className="product-image-bg" 
        style={{ backgroundImage: `url(${product.imageUrl || 'https://via.placeholder.com/300x400?text=Moda+Mastou'})` }}
      ></div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">{product.price.toLocaleString()} FCFA</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', justifyContent: 'center', alignItems: 'stretch' }}>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: '70px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', fontSize: '1rem' }}
          />
          <button 
            onClick={handleAdd} 
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: '100%', borderRadius: '4px' }}
          >
            {added ? "✓ Ajouté" : "🛒 Ajouter"}
          </button>
        </div>

        <Link href={`/shop/${product.id}`} className="btn-secondary" style={{ display: 'block', width: '100%' }}>Détails</Link>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        
        if (!data || data.error) {
          throw new Error("DB vide ou indisponible");
        } else {
          setProducts(data);
        }
      } catch (e) {
        console.error("Erreur de récupération :", e);
        // Au cas où la base est vide
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <div className="loading-state">Chargement de la collection...</div>;

  return (
    <div className="shop-container">
      <h1 className="page-title">Notre Collection</h1>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
