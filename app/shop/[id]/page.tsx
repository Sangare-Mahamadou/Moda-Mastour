"use client";

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const found = data.find((p: any) => p.id === parseInt(params.id));
          setProduct(found || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) return <div className="loading-state">Chargement du produit...</div>;
  if (!product) return <div className="loading-state">Produit introuvable.</div>;

  const handleAdd = () => {
    if (product.sizes && product.sizes.length > 0 && selectedSizes.length === 0) {
      alert("Veuillez choisir au moins une taille avant d'ajouter au panier.");
      return;
    }
    
    const sizesToAdd = selectedSizes.length > 0 ? selectedSizes : [undefined];
    sizesToAdd.forEach(size => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl,
        size
      });
    });
    
    alert("Produit ajouté au panier avec succès !");
    setSelectedSizes([]);
  };

  return (
    <div className="product-details-container" style={{ position: 'relative' }}>
      {product.originalPrice && product.originalPrice > product.price && (
        <div style={{
          position: 'absolute', top: '10px', right: '20px',
          background: 'var(--color-turkey-red)', color: 'white',
          padding: '0.8rem 2rem', fontWeight: 'bold', fontSize: '1.2rem',
          transform: 'rotate(5deg)', zIndex: 10, boxShadow: '0 4px 15px rgba(139,0,0,0.4)',
          borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px'
        }}>
          💡 Promo Spéciale !
        </div>
      )}
      <div className="product-details-grid">
        <div className="product-image-large" style={{ backgroundImage: `url(${product.imageUrl})` }}></div>
        <div className="product-info-large">
          <h1>{product.name}</h1>
          <p className="price-large">
            {product.price.toLocaleString()} FCFA
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ marginLeft: '15px', textDecoration: 'line-through', color: '#999', fontSize: '1.2rem' }}>
                {product.originalPrice.toLocaleString()} FCFA
              </span>
            )}
          </p>
          <p className="description">{product.description}</p>
          
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Choisir la taille :</h3>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {product.sizes.map((s: string) => (
                  <button 
                    key={s} 
                    onClick={() => {
                        if (selectedSizes.includes(s)) setSelectedSizes(selectedSizes.filter(x => x !== s));
                        else setSelectedSizes([...selectedSizes, s]);
                    }}
                    style={{
                      padding: '0.5rem 1.2rem',
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

          <div className="actions">
            <button onClick={handleAdd} className="btn-primary">Ajouter au Panier</button>
            <button onClick={() => router.push('/cart')} className="btn-secondary" style={{ marginLeft: '1rem' }}>Voir le Panier</button>
          </div>

          {product.additionalInfo && (
            <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: 'var(--color-beige)', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-turkey-red)' }}>Informations Additionnelles</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1rem' }}>{product.additionalInfo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
