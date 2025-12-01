import React, { useState } from 'react';
import { Plus, Trash2, Edit2, UserCheck, UserX } from 'lucide-react';
import useSupabase from '../hooks/useSupabase';

const Employees = () => {
  const { data: employees, loading, create, update, remove } = useSupabase('employees');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    active: true
  });

  const handleAddNew = () => {
    setFormData({ name: '', active: true });
    setCurrentEmployee(null);
    setIsEditing(true);
  };

  const handleEdit = (employee) => {
    setFormData({
      name: employee.name,
      active: employee.active
    });
    setCurrentEmployee(employee);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este empleado?')) {
      await remove(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEmployee) {
        await update(currentEmployee.id, formData);
      } else {
        await create(formData);
      }
      setIsEditing(false);
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando empleados...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Empleados</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona tu equipo de trabajo.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={20} />
          Nuevo Empleado
        </button>
      </div>

      {isEditing && (
        <div className="card" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{currentEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Nombre Completo</label>
              <input
                type="text"
                className="input"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                Empleado Activo
              </label>
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
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay empleados registrados.
                  </td>
                </tr>
              ) : (
                employees.map(employee => (
                  <tr key={employee.id}>
                    <td style={{ fontWeight: 500 }}>{employee.name}</td>
                    <td>
                      <span className={`badge ${employee.active ? 'badge-success' : 'badge-danger'}`}>
                        {employee.active ? (
                          <><UserCheck size={14} /> Activo</>
                        ) : (
                          <><UserX size={14} /> Inactivo</>
                        )}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(employee)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(employee.id)}>
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

export default Employees;
