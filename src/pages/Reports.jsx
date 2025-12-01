import React, { useState } from 'react';
import { CreditCard, Mail } from 'lucide-react';
import useSupabase from '../hooks/useSupabase';

const Reports = () => {
  const { data: transactions } = useSupabase('transactions');
  const { data: employees } = useSupabase('employees');

  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({
    start: firstDay,
    end: lastDay
  });

  const filteredTransactions = transactions.filter(t => {
    const tDate = t.date.split('T')[0];
    return tDate >= dateRange.start && tDate <= dateRange.end;
  });

  const totalIncome = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.total_price) || 0), 0);
  const totalCommissions = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.commission_amount) || 0), 0);
  const totalTips = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.tip_amount) || 0), 0);

  // Payment Method Stats
  const paymentStats = {
    cash: filteredTransactions.filter(t => (t.payment_method || 'cash') === 'cash').reduce((sum, t) => sum + (parseFloat(t.total_price) || 0), 0),
    card: filteredTransactions.filter(t => t.payment_method === 'card').reduce((sum, t) => sum + (parseFloat(t.total_price) || 0), 0),
    transfer: filteredTransactions.filter(t => t.payment_method === 'transfer').reduce((sum, t) => sum + (parseFloat(t.total_price) || 0), 0),
  };

  // Calculate stats per employee
  const employeeStats = employees.map(emp => {
    const empTransactions = filteredTransactions.filter(t => t.employee_id === emp.id);
    const servicesCount = empTransactions.length;
    const commissions = empTransactions.reduce((sum, t) => sum + (parseFloat(t.commission_amount) || 0), 0);
    const tips = empTransactions.reduce((sum, t) => sum + (parseFloat(t.tip_amount) || 0), 0);
    
    return {
      ...emp,
      servicesCount,
      commissions,
      tips,
      totalEarnings: commissions + tips
    };
  }).filter(stat => stat.servicesCount > 0); // Only show active employees in this period

  const handleSendEmail = () => {
    const subject = `Reporte Carwash - ${dateRange.start} a ${dateRange.end}`;
    const body = `
RESUMEN FINANCIERO
------------------
Periodo: ${dateRange.start} a ${dateRange.end}

INGRESOS
--------
Total Ingresos: $${totalIncome.toFixed(2)}
Total Comisiones: $${totalCommissions.toFixed(2)}
Total Propinas: $${totalTips.toFixed(2)}
Total Nómina (A Pagar): $${(totalCommissions + totalTips).toFixed(2)}

MÉTODOS DE PAGO
---------------
Efectivo: $${paymentStats.cash.toFixed(2)}
Tarjeta: $${paymentStats.card.toFixed(2)}
Transferencia: $${paymentStats.transfer.toFixed(2)}

DETALLE POR EMPLEADO
--------------------
${employeeStats.map(e => `
${e.name}:
  - Servicios: ${e.servicesCount}
  - Comisiones: $${e.commissions.toFixed(2)}
  - Propinas: $${e.tips.toFixed(2)}
  - TOTAL: $${e.totalEarnings.toFixed(2)}
`).join('')}
    `.trim();

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Reportes Financieros</h1>
          <p style={{ color: 'var(--text-muted)' }}>Resumen de ingresos y pagos a empleados.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="date"
            className="input"
            value={dateRange.start}
            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <span style={{ color: 'var(--text-muted)' }}>a</span>
          <input
            type="date"
            className="input"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <button className="btn btn-primary" onClick={handleSendEmail} title="Enviar por Email">
            <Mail size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="label">Ingresos Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>${totalIncome.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3 className="label">Comisiones Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>${totalCommissions.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3 className="label">Propinas Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>${totalTips.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3 className="label">Total a Pagar (Nómina)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>${(totalCommissions + totalTips).toFixed(2)}</p>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={20} /> Desglose por Método de Pago
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
            <p className="label">Efectivo</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${paymentStats.cash.toFixed(2)}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
            <p className="label">Tarjeta</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${paymentStats.card.toFixed(2)}</p>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
            <p className="label">Transferencia</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${paymentStats.transfer.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Desglose por Empleado</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Servicios Realizados</th>
                <th>Comisiones Base</th>
                <th>Propinas</th>
                <th>Total a Pagar</th>
              </tr>
            </thead>
            <tbody>
              {employeeStats.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay actividad en este periodo.
                  </td>
                </tr>
              ) : (
                employeeStats.map(stat => (
                  <tr key={stat.id}>
                    <td style={{ fontWeight: 500 }}>{stat.name}</td>
                    <td>{stat.servicesCount}</td>
                    <td>${stat.commissions.toFixed(2)}</td>
                    <td>${stat.tips.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>${stat.totalEarnings.toFixed(2)}</td>
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

export default Reports;
