import React, { useState } from 'react';
import { CloudUpload, Check, AlertTriangle, Database } from 'lucide-react';
import { supabase } from '../supabase';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const migrateData = async () => {
    if (!window.confirm('Esto subirá tus datos locales a la nube. ¿Deseas continuar?')) return;
    
    setLoading(true);
    setStatus({ type: 'info', message: 'Iniciando migración...' });

    try {
      // 1. Migrate Services
      const localServices = JSON.parse(localStorage.getItem('services') || '[]');
      if (localServices.length > 0) {
        const { error } = await supabase.from('services').upsert(localServices.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          commission_rate: s.commissionRate
        })));
        if (error) throw error;
      }

      // 2. Migrate Employees
      const localEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      if (localEmployees.length > 0) {
        const { error } = await supabase.from('employees').upsert(localEmployees.map(e => ({
          id: e.id,
          name: e.name,
          active: e.active
        })));
        if (error) throw error;
      }

      // 3. Migrate Customers
      const localCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      if (localCustomers.length > 0) {
        const { error } = await supabase.from('customers').upsert(localCustomers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          vehicle_plate: c.vehiclePlate,
          vehicle_model: c.vehicleModel
        })));
        if (error) throw error;
      }

      // 4. Migrate Transactions
      const localTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      if (localTransactions.length > 0) {
        const { error } = await supabase.from('transactions').upsert(localTransactions.map(t => ({
          id: t.id,
          date: t.date,
          customer_id: t.customerId,
          employee_id: t.employeeId,
          service_id: t.serviceId,
          price: t.price,
          commission_amount: t.commissionAmount,
          tip_amount: t.tipAmount || 0,
          payment_method: t.paymentMethod || 'cash',
          extras: t.extras || [],
          total_price: t.totalPrice
        })));
        if (error) throw error;
      }

      setStatus({ type: 'success', message: '¡Migración completada con éxito!' });
    } catch (error) {
      console.error('Migration error:', error);
      setStatus({ type: 'error', message: 'Error en la migración: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Configuración</h1>
        <p style={{ color: 'var(--text-muted)' }}>Administra las opciones de la aplicación.</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={20} /> Base de Datos
        </h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          Sincroniza tus datos locales con la nube para acceder desde cualquier dispositivo.
        </p>

        {status.message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            backgroundColor: status.type === 'error' ? '#fee2e2' : status.type === 'success' ? '#dcfce7' : '#e0f2fe',
            color: status.type === 'error' ? '#991b1b' : status.type === 'success' ? '#166534' : '#075985',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {status.type === 'error' ? <AlertTriangle size={20} /> : <Check size={20} />}
            {status.message}
          </div>
        )}

        <button 
          className="btn btn-primary" 
          onClick={migrateData} 
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? 'Migrando...' : (
            <>
              <CloudUpload size={20} />
              Migrar Datos a la Nube
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
