import React, { useState } from 'react';
import { Plus, Car, Trash2 } from 'lucide-react';
import useSupabase from '../hooks/useSupabase';

const Dashboard = () => {
  const { data: services } = useSupabase('services');
  const { data: employees } = useSupabase('employees');
  const { data: customers } = useSupabase('customers');
  const { data: transactions, create: createTransaction } = useSupabase('transactions');

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Transaction Form State
  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    employeeId: '',
    price: '',
    commissionAmount: '',
    tipAmount: '',
    paymentMethod: 'cash', // Default to cash
    extras: [] // Array of { description, price }
  });

  // State for a new extra item being added
  const [newExtra, setNewExtra] = useState({ description: '', price: '' });

  // Derived state for today's stats
  const today = new Date().toISOString().split('T')[0];
  const todaysTransactions = transactions.filter(t => t.date && t.date.startsWith(today));
  
  const totalIncome = todaysTransactions.reduce((sum, t) => sum + (parseFloat(t.total_price) || 0), 0);
  const totalCommissions = todaysTransactions.reduce((sum, t) => sum + (parseFloat(t.commission_amount) || 0) + (parseFloat(t.tip_amount) || 0), 0);

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setFormData({
        ...formData,
        serviceId,
        price: service.price,
        commissionAmount: service.price * service.commission_rate
      });
    } else {
      setFormData({ ...formData, serviceId: '', price: '', commissionAmount: '' });
    }
  };

  const handleAddExtra = () => {
    if (newExtra.description && newExtra.price) {
      setFormData({
        ...formData,
        extras: [...formData.extras, { ...newExtra, price: parseFloat(newExtra.price) }]
      });
      setNewExtra({ description: '', price: '' });
    }
  };

  const handleRemoveExtra = (index) => {
    const newExtras = [...formData.extras];
    newExtras.splice(index, 1);
    setFormData({ ...formData, extras: newExtras });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const basePrice = parseFloat(formData.price) || 0;
    const extrasTotal = formData.extras.reduce((sum, extra) => sum + extra.price, 0);
    const tip = parseFloat(formData.tipAmount) || 0;
    const totalPrice = basePrice + extrasTotal + tip;

    const newTransaction = {
      date: new Date().toISOString(),
      customer_id: formData.customerId,
      service_id: formData.serviceId,
      employee_id: formData.employeeId,
      price: basePrice,
      commission_amount: parseFloat(formData.commissionAmount),
      tip_amount: tip,
      payment_method: formData.paymentMethod,
      extras: formData.extras,
      total_price: totalPrice
    };
    
    try {
      await createTransaction(newTransaction);
      setIsModalOpen(false);
      setFormData({ customerId: '', serviceId: '', employeeId: '', price: '', commissionAmount: '', tipAmount: '', paymentMethod: 'cash', extras: [] });
    } catch (error) {
      alert('Error al registrar venta: ' + error.message);
    }
  };

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Cliente Casual';
  const getServiceName = (id) => services.find(s => s.id === id)?.name || 'Servicio Desconocido';
  const getEmployeeName = (id) => employees.find(e => e.id === id)?.name || 'Sin Asignar';

 const getPaymentMethodLabel = (method) => {
    switch (method) {
        case 'cash': return 'Efectivo';
        case 'card': return 'Tarjeta';
        case 'transfer': return 'AthMóvil'; // <--- CAMBIO AQUÍ
        default: return method;
    }
};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Resumen de operaciones del día: {today}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Registrar Servicio
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="label">Autos Lavados Hoy</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Car size={32} className="text-primary" />
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{todaysTransactions.length}</p>
          </div>
        </div>
        <div className="card">
          <h3 className="label">Ingresos Totales Hoy</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>${totalIncome.toFixed(2)}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>(Incluye extras y propinas)</p>
        </div>
        <div className="card">
          <h3 className="label">Comisiones + Propinas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>${totalCommissions.toFixed(2)}</p>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Registrar Nuevo Servicio</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Cliente</label>
                  <select
                    className="input"
                    required
                    value={formData.customerId}
                    onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                  >
                    <option value="">Seleccionar Cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.vehicle_plate}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Empleado</label>
                  <select
                    className="input"
                    required
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                  >
                    <option value="">Seleccionar Empleado...</option>
                    {employees.filter(e => e.active).map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Servicio Principal</label>
                <select
                  className="input"
                  required
                  value={formData.serviceId}
                  onChange={handleServiceChange}
                >
                  <option value="">Seleccionar Servicio...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>
                  ))}
                </select>
              </div>

              {/* Extras Section */}
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Servicios Adicionales (Extras)</label>
                
                {formData.extras.map((extra, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span>{extra.description}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>${extra.price.toFixed(2)}</span>
                      <button type="button" onClick={() => handleRemoveExtra(index)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Descripción (ej. Aspirado)"
                    value={newExtra.description}
                    onChange={e => setNewExtra({ ...newExtra, description: e.target.value })}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="Precio"
                    value={newExtra.price}
                    onChange={e => setNewExtra({ ...newExtra, price: e.target.value })}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddExtra}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Precio Base</label>
                  <input
                    type="number"
                    className="input"
                    readOnly
                    value={formData.price}
                  />
                </div>
                <div>
                  <label className="label">Propina ($)</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="0.50"
                    placeholder="0.00"
                    value={formData.tipAmount}
                    onChange={e => setFormData({ ...formData, tipAmount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Método de Pago</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['cash', 'card', 'transfer'].map(method => (
                    <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                      />
                      {getPaymentMethodLabel(method)}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Total a Cobrar</label>
                <div className="input" style={{ backgroundColor: 'var(--bg-secondary)', fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}>
                  $
                  {(
                    (parseFloat(formData.price) || 0) + 
                    formData.extras.reduce((sum, e) => sum + e.price, 0) + 
                    (parseFloat(formData.tipAmount) || 0)
                  ).toFixed(2)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Actividad Reciente</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Empleado</th>
                <th>Pago</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {todaysTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay servicios registrados hoy.
                  </td>
                </tr>
              ) : (
                todaysTransactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{getCustomerName(t.customer_id)}</td>
                    <td>
                      {getServiceName(t.service_id)}
                      {t.extras && t.extras.length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          + {t.extras.length} extras
                        </span>
                      )}
                    </td>
                    <td>{getEmployeeName(t.employee_id)}</td>
                    <td>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>
                        {getPaymentMethodLabel(t.payment_method || 'cash')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>${(t.total_price || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
