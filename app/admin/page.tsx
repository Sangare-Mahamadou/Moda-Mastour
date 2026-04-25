"use client";

import { useEffect, useState } from 'react';

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Robe de Soirée Istanbul", description: "Élégance pure avec détails brodés.", price: 45000, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80", quantity: 15 },
  { id: 2, name: "Abaya Khadija", description: "Minimalisme et confort en soie perlée.", price: 35000, imageUrl: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=500&q=80", quantity: 8 },
  { id: 3, name: "Tunique Ankara Gold", description: "Mélange chic et urbain.", price: 25000, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80", quantity: 20 }
];

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
            resolve(compressedFile);
          } else {
            reject(new Error('Erreur de compression'));
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState<'COMMANDES' | 'PRODUITS'>('PRODUITS');

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Produit en édition
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: 0, originalPrice: 0, quantity: 0, imageUrl: '', sizes: [] as string[], additionalInfo: '', description: '' });
  const [isEditingUploading, setIsEditingUploading] = useState(false);

  // Nouveau produit
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, originalPrice: 0, quantity: 0, imageUrl: '', sizes: [] as string[], additionalInfo: '', description: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [editSizeInput, setEditSizeInput] = useState('');

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique'];

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) setOrders(data);
      }
    } catch {
      console.error("Failed to fetch orders");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) setProducts(data);
      }
    } catch {
      console.error("Failed to fetch products");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Mastou2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setError("");
    } else {
      setError("Mot de passe incorrect.");
    }
  };

  const handleUpdateProduct = async (id: number) => {
    try {
      const p = products.find(prod => prod.id === id);
      const imageUrl = editForm.imageUrl || p?.imageUrl;
      
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          ...editForm, 
          price: Number(editForm.price), 
          originalPrice: Number(editForm.originalPrice) > 0 ? Number(editForm.originalPrice) : null,
          quantity: Number(editForm.quantity), 
          imageUrl, 
          sizes: editForm.sizes 
        })
      });
      if (res.ok) {
        await fetchProducts();
        setEditingId(null);
      }
    } catch (e) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Êtes-vous sûre de vouloir supprimer ce produit ?")) {
      try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) await fetchProducts();
      } catch (e) {
        alert("Erreur de suppression");
      }
    }
  };

  const uploadFileToServer = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Erreur serveur HTTP " + res.status);
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const handleNewProductFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const compressedFile = await compressImage(e.target.files[0]);
        const url = await uploadFileToServer(compressedFile);
        setNewProduct({ ...newProduct, imageUrl: url });
      } catch(err: any) {
        alert("Echec de l'upload: " + err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEditProductFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsEditingUploading(true);
      try {
        const compressedFile = await compressImage(e.target.files[0]);
        const url = await uploadFileToServer(compressedFile);
        setEditForm({ ...editForm, imageUrl: url });
      } catch(err: any) {
        alert("Echec de l'upload: " + err.message);
      } finally {
        setIsEditingUploading(false);
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) return;
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          originalPrice: Number(newProduct.originalPrice) > 0 ? Number(newProduct.originalPrice) : null,
          quantity: Number(newProduct.quantity),
          imageUrl: newProduct.imageUrl,
          sizes: newProduct.sizes,
          description: newProduct.description,
          additionalInfo: newProduct.additionalInfo
        })
      });
      if (res.ok) {
        await fetchProducts();
        setNewProduct({ name: '', price: 0, originalPrice: 0, quantity: 0, imageUrl: '', sizes: [], additionalInfo: '', description: '' });
      } else {
        alert("Erreur serveur lors de la création.");
      }
    } catch (e) {
      alert("Erreur d'ajout");
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '10rem auto', padding: '2rem', background: 'var(--color-white)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Espace Vendeuse</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}/>
          </div>
          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Se Connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="page-title" style={{ margin: '0' }}>Tableau de Bord</h1>
        <button className="btn-secondary logout-btn" onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('admin_auth'); }}>Déconnexion</button>
      </div>
      
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('PRODUITS')}
          className={activeTab === 'PRODUITS' ? 'active-tab' : ''}
        >Catalogue</button>
        <button 
          onClick={() => setActiveTab('COMMANDES')}
          className={activeTab === 'COMMANDES' ? 'active-tab' : ''}
        >Commandes Récentes</button>
      </div>

      {activeTab === 'PRODUITS' ? (
        <div className="admin-card">
          <h2 style={{ marginBottom: '2rem', fontWeight: 300 }}>Gestion des Produits</h2>
          
          <div className="admin-add-form">
            <h3 style={{ marginBottom: '1rem' }}>+ Ajouter un vêtement</h3>
            <form onSubmit={handleAddProduct} className="add-product-form">
              <div className="form-group-flex">
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} required/>
                </div>
                <div className="form-group short-input">
                  <label>Prix de Vente Actuel (FCFA)</label>
                  <input type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: Number(e.target.value)})} required/>
                </div>
                <div className="form-group short-input">
                  <label>Prix Normal avant promo (Optionnel)</label>
                  <input type="number" value={newProduct.originalPrice} onChange={e=>setNewProduct({...newProduct, originalPrice: Number(e.target.value)})} placeholder="Ex: 50000" />
                </div>
                <div className="form-group short-input">
                  <label>Quantité</label>
                  <input type="number" value={newProduct.quantity} onChange={e=>setNewProduct({...newProduct, quantity: Number(e.target.value)})} required/>
                </div>
              </div>
              <div className="form-group">
                <label>Description du produit</label>
                <textarea value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} className="edit-input" placeholder="Ex: Tissu doux..."></textarea>
              </div>
              <div className="form-group">
                <label>Informations supplémentaires (Entretien, Matière...)</label>
                <textarea value={newProduct.additionalInfo} onChange={e=>setNewProduct({...newProduct, additionalInfo: e.target.value})} className="edit-input" placeholder="Ex: Lavage à froid uniquement. 100% Coton."></textarea>
              </div>
              <div className="form-group">
                <label>Tailles disponibles</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {AVAILABLE_SIZES.map(size => (
                    <label key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'normal' }}>
                      <input 
                        type="checkbox" 
                        checked={newProduct.sizes.includes(size)} 
                        onChange={(e) => {
                          if (e.target.checked) setNewProduct({...newProduct, sizes: [...newProduct.sizes, size]});
                          else setNewProduct({...newProduct, sizes: newProduct.sizes.filter(s => s !== size)});
                        }}
                      /> {size}
                    </label>
                  ))}
                  {newProduct.sizes.filter(s => !AVAILABLE_SIZES.includes(s)).map(customSize => (
                    <label key={customSize} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'normal', color: 'var(--color-gold)' }}>
                      <input 
                        type="checkbox" 
                        checked={true} 
                        onChange={() => setNewProduct({...newProduct, sizes: newProduct.sizes.filter(s => s !== customSize)})}
                      /> {customSize}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={newSizeInput} 
                    onChange={e => setNewSizeInput(e.target.value)} 
                    placeholder="Autre taille (ex: 42)" 
                    className="edit-input" 
                    style={{ width: '150px', margin: 0 }}
                  />
                  <button type="button" onClick={() => {
                    if (newSizeInput && !newProduct.sizes.includes(newSizeInput)) {
                      setNewProduct({...newProduct, sizes: [...newProduct.sizes, newSizeInput]});
                    }
                    setNewSizeInput('');
                  }} className="btn-secondary" style={{ padding: '0.5rem' }}>Ajouter</button>
                </div>
              </div>
              <div className="form-group">
                <label>Importer une photo (Depuis PC/Téléphone)</label>
                <input type="file" accept="image/*" onChange={handleNewProductFileSelect} disabled={isUploading}/>
                {isUploading && <span style={{fontSize: '0.8rem', color: 'orange'}}>Chargement en cours...</span>}
                {newProduct.imageUrl && !isUploading && <span style={{fontSize: '0.8rem', color: 'green', fontWeight: 'bold'}}>Image chargée avec succès !</span>}
              </div>
              <button type="submit" className="btn-primary" disabled={isUploading}>Créer le produit</button>
            </form>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom du Produit</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id}>
                    {editingId === p.id ? (
                      <>
                        <td className="edit-cell">
                          <input type="text" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} placeholder="Nom du vêtement" className="edit-input" />
                          <textarea value={editForm.description} onChange={e=>setEditForm({...editForm, description: e.target.value})} placeholder="Description" className="edit-input"></textarea>
                          <textarea value={editForm.additionalInfo} onChange={e=>setEditForm({...editForm, additionalInfo: e.target.value})} placeholder="Info Sup" className="edit-input"></textarea>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <small>Tailles:</small><br/>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginBottom: '0.3rem' }}>
                              {AVAILABLE_SIZES.map(s => (
                                <label key={s} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <input type="checkbox" checked={editForm.sizes.includes(s)} onChange={e => {
                                      if (e.target.checked) setEditForm({...editForm, sizes: [...editForm.sizes, s]});
                                      else setEditForm({...editForm, sizes: editForm.sizes.filter(x => x !== s)});
                                  }}/> {s}
                                </label>
                              ))}
                              {editForm.sizes.filter(s => !AVAILABLE_SIZES.includes(s)).map(s => (
                                <label key={s} style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--color-gold)' }}>
                                  <input type="checkbox" checked={true} onChange={() => setEditForm({...editForm, sizes: editForm.sizes.filter(x => x !== s)})}/> {s}
                                </label>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                              <input 
                                type="text" 
                                value={editSizeInput} 
                                onChange={e => setEditSizeInput(e.target.value)} 
                                placeholder="Autre taille" 
                                className="edit-input" 
                                style={{ width: '100px', margin: 0, padding: '0.2rem', fontSize: '0.8rem' }}
                              />
                              <button type="button" onClick={() => {
                                if (editSizeInput && !editForm.sizes.includes(editSizeInput)) setEditForm({...editForm, sizes: [...editForm.sizes, editSizeInput]});
                                setEditSizeInput('');
                              }} style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', cursor: 'pointer' }}>Ajout</button>
                            </div>
                          </div>
                          <div>
                            <small style={{display:'block', marginBottom: '0.3rem'}}>Changer la photo :</small>
                            <input type="file" accept="image/*" onChange={handleEditProductFileSelect} disabled={isEditingUploading}/>
                            {isEditingUploading && <span style={{color: 'orange', fontSize: '0.7rem'}}>Chargement...</span>}
                            {editForm.imageUrl && editForm.imageUrl !== p.imageUrl && <span style={{color: 'green', fontSize: '0.7rem'}}>Nouvelle image reçue</span>}
                          </div>
                        </td>
                        <td className="edit-cell">
                          <small>Prix actuel:</small>
                          <input type="number" value={editForm.price} onChange={e=>setEditForm({...editForm, price: Number(e.target.value)})} className="edit-input" />
                          <small>Prix barré (promo):</small>
                          <input type="number" value={editForm.originalPrice} onChange={e=>setEditForm({...editForm, originalPrice: Number(e.target.value)})} className="edit-input" />
                        </td>
                        <td className="edit-cell"><input type="number" value={editForm.quantity} onChange={e=>setEditForm({...editForm, quantity: Number(e.target.value)})} className="edit-input" /></td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button onClick={() => handleUpdateProduct(p.id)} className="btn-success" disabled={isEditingUploading}>Sauver</button>
                            <button onClick={() => setEditingId(null)} className="btn-cancel">Annuler</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ fontWeight: 'bold' }}>
                          {p.name} {p.imageUrl?.includes('/uploads') ? '📸' : ''}
                          {p.sizes && p.sizes.length > 0 && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>Tailles : {p.sizes.join(', ')}</div>}
                        </td>
                        <td style={{ color: 'var(--color-gold)' }}>
                          {p.price.toLocaleString()}
                          {p.originalPrice && p.originalPrice > p.price && (
                            <div style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'line-through' }}>{p.originalPrice.toLocaleString()}</div>
                          )}
                        </td>
                        <td>{p.quantity}</td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button onClick={() => { setEditingId(p.id); setEditForm({ name: p.name, price: p.price, originalPrice: p.originalPrice || 0, quantity: p.quantity, imageUrl: '', sizes: p.sizes || [], additionalInfo: p.additionalInfo || '', description: p.description || '' }); }} className="btn-edit">Modifier</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="btn-delete">Suppr</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-card">
          <h2 style={{ marginBottom: '2rem', fontWeight: 300 }}>Commandes Récentes</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Contact</th>
                  <th>Moyen</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 'bold' }}>
                      {order.customerName}
                      <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem', fontWeight: 'normal' }}>
                        {order.items?.map((item: any, i: number) => (
                          <div key={i}>
                            {item.quantity}x {item.product?.name} {item.size ? `(Taille: ${item.size})` : ''}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{order.total.toLocaleString()} FCFA</td>
                    <td>{order.customerPhone}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
