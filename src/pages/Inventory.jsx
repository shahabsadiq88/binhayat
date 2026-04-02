import { useEffect, useState, useRef } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/products';
import { useToast } from '../components/Toast';

const CATEGORIES = ['Fan', 'LED', 'Wire', 'Switch', 'Socket', 'Meter', 'Cable', 'Battery', 'Inverter', 'Panel', 'MCB', 'Other'];
const UNITS = ['pcs', 'meter', 'box', 'roll', 'set', 'pair'];

const emptyForm = {
  name: '', category: '', brand: '', model: '', price: '',
  cost_price: '', quantity: '', low_stock_threshold: '5',
  unit: 'pcs', description: '',
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const toast = useToast();

  async function load() {
    try {
      const data = await getProducts();
      setProducts(data);
      setFiltered(data);
    } catch {
      toast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = products;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q)
      );
    }
    if (catFilter) list = list.filter((p) => p.category === catFilter);
    setFiltered(list);
  }, [search, catFilter, products]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name || '', category: p.category || '', brand: p.brand || '',
      model: p.model || '', price: p.price || '', cost_price: p.cost_price || '',
      quantity: p.quantity || '', low_stock_threshold: p.low_stock_threshold || '5',
      unit: p.unit || 'pcs', description: p.description || '',
    });
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name || !form.price || !form.quantity) {
      toast('Name, price, and quantity are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        cost_price: parseFloat(form.cost_price) || 0,
        quantity: parseInt(form.quantity),
        low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      };
      if (editing) {
        await updateProduct(editing.id, payload);
        toast('Product updated!');
      } else {
        await addProduct(payload);
        toast('Product added!');
      }
      setShowModal(false);
      load();
    } catch {
      toast('Failed to save product.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast('Product deleted.');
      load();
    } catch {
      toast('Failed to delete product.', 'error');
    } finally {
      setDeleting(null);
    }
  }

  function stockBadge(p) {
    if (p.quantity === 0) return <span className="badge badge-red">Out of Stock</span>;
    if (p.quantity <= p.low_stock_threshold) return <span className="badge badge-amber">⚠ Low Stock</span>;
    return <span className="badge badge-green">In Stock</span>;
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Inventory</h2>
        <p className="page-subtitle">{filtered.length} products</p>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by name, brand or model…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No products found</h3>
            <p>Add your first product using the button above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand / Model</th>
                  <th>Price</th>
                  <th>Cost Price</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.name}</td>
                    <td><span className="badge badge-blue">{p.category || '—'}</span></td>
                    <td className="text-secondary">{[p.brand, p.model].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="text-accent font-bold">Rs {Number(p.price).toLocaleString()}</td>
                    <td className="text-muted">Rs {Number(p.cost_price || 0).toLocaleString()}</td>
                    <td className={`font-bold ${p.quantity === 0 ? 'text-red' : p.quantity <= p.low_stock_threshold ? 'text-accent' : 'text-green'}`}>
                      {p.quantity}
                    </td>
                    <td className="text-muted">{p.unit || 'pcs'}</td>
                    <td>{stockBadge(p)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input name="name" className="form-input" placeholder="e.g. LED Bulb 9W" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input name="brand" className="form-input" placeholder="e.g. Philips" value={form.brand} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model</label>
                    <input name="model" className="form-input" placeholder="e.g. X9-Pro" value={form.model} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Sale Price (Rs) *</label>
                    <input name="price" type="number" className="form-input" placeholder="0" value={form.price} onChange={handleChange} required min="0" step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cost Price (Rs)</label>
                    <input name="cost_price" type="number" className="form-input" placeholder="0" value={form.cost_price} onChange={handleChange} min="0" step="0.01" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input name="quantity" type="number" className="form-input" placeholder="0" value={form.quantity} onChange={handleChange} required min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low Stock Alert Below</label>
                    <input name="low_stock_threshold" type="number" className="form-input" placeholder="5" value={form.low_stock_threshold} onChange={handleChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select name="unit" className="form-select" value={form.unit} onChange={handleChange}>
                      {UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-textarea" placeholder="Optional notes…" value={form.description} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? '✅ Update Product' : '✅ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
