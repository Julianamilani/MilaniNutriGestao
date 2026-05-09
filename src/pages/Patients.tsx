import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

interface Patient {
  id: string;
  nome: string;
  objetivo_texto: string;
  last_consultation?: string;
}

const Patients: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      // Fetch patients and their consultations
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id, 
          nome, 
          objetivo_texto,
          consultas (
            data_consulta
          )
        `)
        .eq('nutricionista_id', user?.id)
        .order('nome');

      if (error) throw error;

      if (data) {
        const processedPatients = data.map((p: any) => {
          // Find the most recent consultation date
          const consults = p.consultas || [];
          const lastConsult = consults.length > 0 
            ? consults.reduce((latest: string, current: any) => 
                new Date(current.data_consulta) > new Date(latest) ? current.data_consulta : latest
              , consults[0].data_consulta)
            : 'Nenhuma';

          return {
            id: p.id,
            nome: p.nome,
            objetivo_texto: p.objetivo_texto || 'Não informado',
            last_consultation: lastConsult !== 'Nenhuma' ? new Date(lastConsult).toLocaleDateString('pt-BR') : 'Nenhuma'
          };
        });
        setPatients(processedPatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Pacientes</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Gerencie sua lista de pacientes e acompanhamentos.</p>
          </div>
          <button 
            className="btn-primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            onClick={() => navigate('/pacientes/novo')}
          >
            <UserPlus size={20} />
            Novo Paciente
          </button>
        </header>

        <div className="search-bar" style={{ marginBottom: '2rem' }}>
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar paciente por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="patients-table-card">
          {loading ? (
            <div className="no-data-message">Carregando pacientes...</div>
          ) : filteredPatients.length > 0 ? (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Objetivo</th>
                  <th>Última Consulta</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id} onClick={() => navigate(`/pacientes/${patient.id}`)}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{patient.nome}</td>
                    <td>{patient.objetivo_texto}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="var(--text-muted)" />
                        {patient.last_consultation}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">
              {searchTerm ? 'Nenhum paciente encontrado com esse nome.' : 'Nenhum paciente cadastrado ainda.'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Patients;
