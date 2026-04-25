"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  additionalInfo?: string | null;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  sizes?: string[];
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const handleAdd = () => {
    if (product.sizes && product.sizes.length > 0 && selectedSizes.length === 0) {
      alert("Veuillez choisir au moins une taille avant d'ajouter au panier.");
      return;
    }
    if (quantity > 0) {
      const sizesToAdd = selectedSizes.length > 0 ? selectedSizes : [undefined];
      sizesToAdd.forEach(size => {
        addToCart({ ...product, quantity, size });
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      setSelectedSizes([]);
    }
  };

  return (
    <div className="product-card" style={{ position: 'relative' }}>
      {product.originalPrice && product.originalPrice > product.price && (
        <div style={{
          position: 'absolute', top: '15px', right: '-10px',
          background: 'var(--color-turkey-red)', color: 'white',
          padding: '0.5rem 1.5rem', fontWeight: 'bold', fontSize: '0.9rem',
          transform: 'rotate(5deg)', zIndex: 10, boxShadow: '0 4px 15px rgba(139,0,0,0.4)',
          borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          💡 Promo !
        </div>
      )}
      <div 
        className="product-image-bg" 
        style={{ backgroundImage: `url(${product.imageUrl || 'https://via.placeholder.com/300x400?text=Moda+Mastou'})` }}
      ></div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">
          {product.price.toLocaleString()} FCFA
          {product.originalPrice && product.originalPrice > product.price && (
            <span style={{ marginLeft: '10px', textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
              {product.originalPrice.toLocaleString()} FCFA
            </span>
          )}
        </p>
        
        {product.sizes && product.sizes.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {product.sizes.map((s: string) => (
                <button 
                  key={s} 
                  onClick={() => {
                    if (selectedSizes.includes(s)) setSelectedSizes(selectedSizes.filter(x => x !== s));
                    else setSelectedSizes([...selectedSizes, s]);
                  }}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.8rem',
                    border: selectedSizes.includes(s) ? '2px solid var(--color-black)' : '1px solid #ccc',
                    background: selectedSizes.includes(s) ? 'var(--color-black)' : 'var(--color-white)',
                    color: selectedSizes.includes(s) ? 'white' : 'var(--color-black)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

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
