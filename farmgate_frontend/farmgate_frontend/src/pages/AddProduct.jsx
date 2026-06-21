import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../api';
import toast from 'react-hot-toast';

export default function AddProduct() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', category: 'alphonso', description: '', price_per_unit: '', unit: 'kg', stock: '', min_order_qty: 1, is_organic: false, harvest_date: '', is_available: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      productsAPI.detail(id).then(res => {
        const p = res.data;
        setForm({ name: p.name, category: p.category, description: p.description, price_per_unit: p.price_per_unit, unit: p.unit, stock: p.stock, min_order_qty: p.min_order_qty, is_organic: p.is_organic, harvest_date: p.harvest_date || '', is_available: p.is_available });
      });
    }
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await productsAPI.update(id, form);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(form);
        toast.success('Product listed! 🥭');
      }
      navigate('/farmer/dashboard');
    } catch (err) {
      toast.error(err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Failed to save product');
    } finally { setLoading(false); }
  };

  return (
    <div className="container section" style={{ maxWidth: '640px' }}>
      <h1 className="page-title">{isEdit ? 'Edit Product' : 'List New Product'}</h1>
      <p className="page-subtitle">{isEdit ? 'Update your product details' : 'Add a new mango variety to your store'}</p>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handle}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. Alphonso Mangoes Premium" required />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  {[['alphonso','Alphonso'],['kesar','Kesar'],['dasheri','Dasheri'],['langra','Langra'],['totapuri','Totapuri'],['other','Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit *</label>
                <select className="form-select" value={form.unit} onChange={set('unit')}>
                  {[['kg','Kilogram (kg)'],['box','Box'],['dozen','Dozen'],['piece','Piece']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input className="form-control" type="number" value={form.price_per_unit} onChange={set('price_per_unit')} placeholder="450" required min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock *</label>
                <input className="form-control" type="number" value={form.stock} onChange={set('stock')} placeholder="100" required min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Order</label>
                <input className="form-control" type="number" value={form.min_order_qty} onChange={set('min_order_qty')} placeholder="1" min={1} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={set('description')} placeholder="Describe your mangoes — origin, taste, quality..." required />
            </div>
            <div className="form-group">
              <label className="form-label">Harvest Date</label>
              <input className="form-control" type="date" value={form.harvest_date} onChange={set('harvest_date')} />
            </div>
            <div className="button-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input type="checkbox" checked={form.is_organic} onChange={set('is_organic')} />
                🌱 Organic
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input type="checkbox" checked={form.is_available} onChange={set('is_available')} />
                Available for sale
              </label>
            </div>
            <div className="button-group">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/farmer/dashboard')}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : isEdit ? '✓ Update Product' : '🥭 List Product'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
