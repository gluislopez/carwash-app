import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabase'; // Asegúrate de que este archivo exista en src/supabase.js

// Importa tus componentes
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Employees from './pages/Employees';
import Customers from './pages/Customers';
import Reports from './pages/Reports';

// Este componente verifica si estás logueado
const RequireAuth = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Verificar sesión al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios en la sesión (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{color: 'white', padding: '2rem'}}>Cargando...</div>;
  
  // Si no hay sesión, mandar al Login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Ruta pública: Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas: Todo lo demás */}
      <Route
        path="*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/services" element={<Services />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<div style={{color:'white', padding:'2rem'}}>Configuración</div>} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
