import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/products';
import { createSale } from '../services/sales';
import { useToast } from '../components/Toast';

export default function NewSale() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saving, setSaving] = useState(false);
  const searchRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); setShowResults(false); return; }
    const q = search.toLowerCase();
    const results = products.filter(
      (p) => p.quantity > 0 && (
        p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    ).slice(0, 8);
    setSearchResults(results);
    setShowResults(true);
  }, [search, products]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.quantity) }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        maxQty: product.quantity,
        unit: product.unit || 'pcs',
      }];
    });
    setSearch('');
    setShowResults(false);
  }

  function updateQty(productId, delta) {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.maxQty)) }
          : i
      )
    );
  }

  function removeItem(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discountAmt = Math.min(parseFloat(discount) || 0, subtotal);
  const total = subtotal - discountAmt;

  async function handleConfirm() {
    if (cart.length === 0) { toast('Add at least one item.', 'warning'); return; }
    setSaving(true);
    try {
      const saleData = {
        customerName, customerPhone,
        totalAmount: total,
        discount: discountAmt,
        paidAmount: total,
        paymentMethod,
      };
      const sale = await createSale(saleData, cart);
      toast('Sale confirmed! 🎉');
      navigate(`/invoice/${sale.id}`);
    } catch (e) {
      toast('Failed to create sale: ' + (e.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">New Sale</h2>
        <p className="page-subtitle">Search products, build customer bill</p>
      </div>

      <div className="page-body">
        <div className="sale-layout">
          {/* Left: Product Search */}
          <div>
            {/* Customer Info */}
            <div className="card mb-6">
              <div className="section-title">Customer Details (Optional)</div>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Customer Name</label>
                  <input className="form-input" placeholder="e.g. Ahmed Khan" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="03XX-XXXXXXX" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">💵 Cash</option>
                    <option value="credit">💳 Credit</option>
                    <option value="transfer">📱 Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="card">
              <div className="section-title">Add Products</div>
              <div style={{ position: 'relative' }} ref={searchRef}>
                <div className="search-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    className="search-input"
                    placeholder="Search product by name, brand, or category…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => search && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  />
                </div>
                {showResults && searchResults.length > 0 && (
                  <div className="product-search-result">
                    {searchResults.map((p) => (
                      <div key={p.id} className="product-result-item" onMouseDown={() => addToCart(p)}>
                        <div>
                          <div className="product-result-item-name">{p.name}</div>
                          <div className="product-result-item-meta">
                            {[p.category, p.brand].filter(Boolean).join(' · ')} · Stock: {p.quantity} {p.unit || 'pcs'}
                          </div>
                        </div>
                        <div className="product-result-item-price">Rs {Number(p.price).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
                {showResults && search && searchResults.length === 0 && (
                  <div className="product-search-result">
                    <div className="product-result-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                      No products found
                    </div>
                  </div>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0 8px' }}>
                  <div className="empty-state-icon" style={{ fontSize: '32px' }}>🛒</div>
                  <p>Search and add products above</p>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Unit Price</th>
                          <th>Qty</th>
                          <th>Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item) => (
                          <tr key={item.productId}>
                            <td className="font-semibold">{item.productName}</td>
                            <td>Rs {Number(item.unitPrice).toLocaleString()}</td>
                            <td>
                              <div className="qty-control">
                                <button className="qty-btn" onClick={() => updateQty(item.productId, -1)}>−</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button className="qty-btn" onClick={() => updateQty(item.productId, 1)}>+</button>
                              </div>
                            </td>
                            <td className="text-accent font-bold">
                              Rs {(item.quantity * item.unitPrice).toLocaleString()}
                            </td>
                            <td>
                              <button className="btn btn-icon btn-danger btn-sm" onClick={() => removeItem(item.productId)}>✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart Summary */}
          <div className="cart">
            <div className="cart-header">🧾 Bill Summary</div>
            <div className="cart-body">
              {cart.length === 0 ? (
                <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '20px 0' }}>Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cart-item-name truncate">{item.productName}</div>
                      <div className="cart-item-price">{item.quantity} × Rs {Number(item.unitPrice).toLocaleString()}</div>
                    </div>
                    <div className="font-bold text-accent">Rs {(item.quantity * item.unitPrice).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
            <div className="cart-footer">
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Discount (Rs)</label>
                <input
                  type="number"
                  className="form-input"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  min="0"
                  max={subtotal}
                  placeholder="0"
                />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Subtotal</span>
                  <span>Rs {subtotal.toLocaleString()}</span>
                </div>
                {discountAmt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--green-light)' }}>
                    <span>Discount</span>
                    <span>– Rs {discountAmt.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="cart-total">
                <span>Total</span>
                <span style={{ color: 'var(--accent-light)' }}>Rs {total.toLocaleString()}</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleConfirm}
                disabled={saving || cart.length === 0}
              >
                {saving ? 'Processing…' : '✅ Confirm & Print Bill'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
