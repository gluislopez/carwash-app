import React, { useState } from 'react';
import { Plus, Trash2, Edit2, DollarSign } from 'lucide-react';
import useSupabase from '../hooks/useSupabase';

const Services = () => {
  const { data: services, loading, create, update, remove } = useSupabase('services');
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    commissionRate: ''
  });

  const handleAddNew = () => {
    setFormData({ name: '', price: '', commissionRate: '' });
    setCurrentService(null);
    setIsEditing(true);
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      price: service.price,
      commissionRate: (service.commission_rate * 100).toFixed(2)
    });
    setCurrentService(service);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serviceData = {
      name: formData.name,
      price: parseFloat(formData.price),
      commission_rate: parseFloat(formData.commissionRate) / 100
    };

    try {
      if (currentService) {
        await update(currentService.id, serviceData);
      } else {
        await create(serviceData);
      }
      setIsEditing(false);
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando servicios...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Servicios</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona los precios y comisiones.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={20} />
          Nuevo Servicio
        </button>
      </div>

      {isEditing && (
        <div className="card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{currentService ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Nombre del Servicio</label>
              <input
                type="text"
                className="input"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Lavado Completo"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="label">Precio ($)</label>
                <input
                  type="number"
                  className="input"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">Comisión (%)</label>
                <input
                  type="number"
                  className="input"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.commissionRate}
                  onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="10.5"
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
                <th>Servicio</th>
                <th>Precio</th>
                <th>Comisión</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay servicios registrados.
                  </td>
                </tr>
              ) : (
                services.map(service => (
                  <tr key={service.id}>
                    <td style={{ fontWeight: 500 }}>{service.name}</td>
                    <td>${service.price.toFixed(2)}</td>
                    <td>{(service.commission_rate * 100).toFixed(2)}%</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(service)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(service.id)}>
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

export default Services;
