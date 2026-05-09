import React, { useEffect, useState } from 'react';
import { Users, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

interface Patient {
  id: string;
  nome: string;
}

interface StatData {
  totalPatients: number;
  weeklyAppointments: number;
  dormantPatients: Patient[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatData>({
    totalPatients: 0,
    weeklyAppointments: 0,
    dormantPatients: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Total Patients
      const { count: patientCount } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user?.id);

      // 2. Weekly Appointments
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const { count: appointmentCount } = await supabase
        .from('consultas')
        .select('id, paciente_id', { count: 'exact' })
        .gte('data_consulta', startOfWeek.toISOString().split('T')[0])
        .lte('data_consulta', endOfWeek.toISOString().split('T')[0]);
      
      // Note: The RLS on 'consultas' table already filters by patients belonging to this nutritionist

      // 3. Dormant Patients (No consultation in last 30 days AND no future return scheduled)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // Get all patients first
      const { data: allPatients } = await supabase
        .from('pacientes')
        .select('id, nome')
        .eq('nutricionista_id', user?.id);

      if (allPatients) {
        // Get last consultation and next return for these patients
        const { data: allConsultations } = await supabase
          .from('consultas')
          .select('paciente_id, data_consulta, proximo_retorno')
          .in('paciente_id', allPatients.map(p => p.id));

        const dormant = allPatients.filter(patient => {
          const patientConsults = allConsultations?.filter(c => c.paciente_id === patient.id) || [];
          
          if (patientConsults.length === 0) return true; // Never had a consultation? Could be dormant or new.

          // Find most recent activity
          const latestConsultDate = new Date(Math.max(...patientConsults.map(c => new Date(c.data_consulta).getTime())));
          const hasFutureReturn = patientConsults.some(c => c.proximo_retorno && new Date(c.proximo_retorno) > today);

          return latestConsultDate < thirtyDaysAgo && !hasFutureReturn;
        });

        setStats({
          totalPatients: patientCount || 0,
          weeklyAppointments: appointmentCount || 0,
          dormantPatients: dormant
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <p>Carregando dados do dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Bem-vinda de volta ao MilaniNutri Gestão.</p>
        </header>

        <div className="dashboard-grid">
          {/* Card 1: Total Patients */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total de Pacientes</span>
              <div className="stat-icon">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.totalPatients}</div>
          </div>

          {/* Card 2: Weekly Appointments */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Consultas da Semana</span>
              <div className="stat-icon">
                <Calendar size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.weeklyAppointments}</div>
          </div>

          {/* Card 3: Patients without return */}
          <div className="list-card">
            <div className="stat-header">
              <span className="stat-title">Pacientes sem Retorno</span>
              <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="list-header" style={{ marginTop: '0.5rem' }}>
              <p className="list-subtitle">Última consulta há mais de 30 dias e sem retorno agendado.</p>
            </div>

            <div className="patient-list-container">
              {stats.dormantPatients.length > 0 ? (
                <ul className="patient-list">
                  {stats.dormantPatients.map(patient => (
                    <li key={patient.id} className="patient-item">
                      <Link to={`/pacientes/${patient.id}`} className="patient-link">
                        {patient.nome}
                      </Link>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sem retorno</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-data-message">
                  Nenhum paciente sem retorno no momento.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
