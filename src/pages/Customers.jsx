import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Car } from 'lucide-react';
import useSupabase from '../hooks/useSupabase';

const Customers = () => {
  const { data: customers, loading, create, update, remove } = useSupabase('customers');
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehiclePlate: '',
    vehicleModel: ''
  });

  const handleAddNew = () => {
    setFormData({ name: '', phone: '', vehiclePlate: '', vehicleModel: '' });
    setCurrentCustomer(null);
    setIsEditing(true);
  };

  const handleEdit = (customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      vehiclePlate: customer.vehicle_plate,
      vehicleModel: customer.vehicle_model
    });
    setCurrentCustomer(customer);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerData = {
      name: formData.name,
      phone: formData.phone,
      vehicle_plate: formData.vehiclePlate,
      vehicle_model: formData.vehicleModel
    };

    try {
      if (currentCustomer) {
        await update(currentCustomer.id, customerData);
      } else {
        await create(customerData);
      }
      setIsEditing(false);
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando clientes...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Clientes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Directorio de clientes y vehículos.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {isEditing && (
        <div className="card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{currentCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Nombre del Cliente</label>
              <input
                type="text"
                className="input"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. María González"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Teléfono</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej. 555-1234"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="label">Placa / Matrícula</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.vehiclePlate}
                  onChange={e => setFormData({ ...formData, vehiclePlate: e.target.value })}
                  placeholder="ABC-123"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div>
                <label className="label">Modelo del Auto</label>
                <input
                  type="text"
                  className="input"
                  value={formData.vehicleModel}
                  onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                  placeholder="Ej. Toyota Corolla"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Vehículo</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay clientes registrados.
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 500 }}>{customer.name}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Car size={16} className="text-muted" />
                        <span>{customer.vehicle_plate}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {customer.vehicle_model ? `(${customer.vehicle_model})` : ''}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(customer)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(customer.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
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

export default Customers;
