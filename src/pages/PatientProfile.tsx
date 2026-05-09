import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, ChevronRight, Weight, Ruler, Activity, Apple, 
  User, ClipboardList, Utensils, Save, CheckCircle, Calendar, 
  History, TrendingUp, Info
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import Sidebar from '../components/Sidebar';
import ConsultationModal from '../components/ConsultationModal';
import { supabase } from '../lib/supabase';

type DataTab = 'pessoal' | 'clinico' | 'habitos';

interface Patient {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  data_nascimento: string;
  sexo: string;
  peso_inicial: number;
  altura: number;
  objetivos: string[];
  objetivo_texto: string;
  patologias: string[];
  medicamentos: string;
  suplementos: string;
  refeicoes_por_dia: number;
  horario_acorda: string;
  horario_dorme: string;
  litros_agua: number;
  atividade_fisica: boolean;
  atividade_fisica_descricao: string;
  observacoes: string;
}

interface Consultation {
  id: string;
  data_consulta: string;
  peso: number;
  cintura: number;
  quadril: number;
  percentual_gordura: number;
  observacoes: string;
  proximo_retorno: string;
  pontuacao_proteina: number;
  pontuacao_carboidrato: number;
  pontuacao_gordura: number;
  pontuacao_hidratacao: number;
  pontuacao_fibras: number;
  pontuacao_consistencia: number;
}

interface MealPlan {
  id: string;
  created_at: string;
  conteudo: any;
}

const PatientProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Tabs and Modals
  const [activeDataTab, setActiveDataTab] = useState<DataTab>('pessoal');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Patient
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (patientError) throw patientError;
      setPatient(patientData);

      // 2. Fetch Consultations
      const { data: consultData, error: consultError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });

      if (consultError) throw consultError;
      setConsultations(consultData || []);

      // 3. Fetch Meal Plans
      const { data: planData, error: planError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });

      if (planError) throw planError;
      setMealPlans(planData || []);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientUpdate = (field: keyof Patient, value: any) => {
    if (!patient) return;
    setPatient({ ...patient, [field]: value });
  };

  const savePatientChanges = async () => {
    if (!patient) return;
    setSaving(true);
    try {
      const sanitizedPatient = {
        ...patient,
        data_nascimento: patient.data_nascimento || null,
        email: patient.email || null,
        telefone: patient.telefone || null,
        whatsapp: patient.whatsapp || null
      };

      const { error } = await supabase
        .from('pacientes')
        .update(sanitizedPatient)
        .eq('id', id);

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="main-content">
          <div className="loading-state">Carregando perfil do paciente...</div>
        </main>
      </div>
    );
  }

  // Chart Data Preparation
  // We need to combine initial weight and consultations
  const weightData = [...consultations]
    .reverse() // Chronological order
    .map(c => ({
      date: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: c.peso
    }));

  // If no consultations, we could show the initial weight
  if (weightData.length === 0 && patient?.peso_inicial) {
    // Just a placeholder or nothing
  }

  // Radar Data Preparation
  const latestConsultation = consultations[0]; // Already ordered by descending date


  // Target Data based on Objectives
  const getTargetScore = (subject: string) => {
    const goals = patient?.objetivos || [];
    const lowerGoals = goals.map(g => g.toLowerCase());
    
    const isHypertrophy = lowerGoals.some(g => g.includes('hipertrofia') || g.includes('massa'));
    const isWeightLoss = lowerGoals.some(g => g.includes('emagrecimento') || g.includes('peso') || g.includes('gordura'));
    const isPerformance = lowerGoals.some(g => g.includes('performance') || g.includes('esporte') || g.includes('atleta'));

    switch(subject) {
      case 'Proteína': return isHypertrophy || isPerformance ? 90 : 70;
      case 'Carboidrato': return isPerformance ? 90 : isWeightLoss ? 50 : 70;
      case 'Gordura': return isWeightLoss ? 50 : 70;
      case 'Hidratação': return isPerformance ? 100 : 90;
      case 'Fibras': return isWeightLoss ? 95 : 80;
      case 'Consistência': return 100;
      default: return 80;
    }
  };

  const combinedRadarData = latestConsultation ? [
    { subject: 'Proteína', Real: latestConsultation.pontuacao_proteina || 0, Ideal: getTargetScore('Proteína'), fullMark: 100 },
    { subject: 'Carboidrato', Real: latestConsultation.pontuacao_carboidrato || 0, Ideal: getTargetScore('Carboidrato'), fullMark: 100 },
    { subject: 'Gordura', Real: latestConsultation.pontuacao_gordura || 0, Ideal: getTargetScore('Gordura'), fullMark: 100 },
    { subject: 'Hidratação', Real: latestConsultation.pontuacao_hidratacao || 0, Ideal: getTargetScore('Hidratação'), fullMark: 100 },
    { subject: 'Fibras', Real: latestConsultation.pontuacao_fibras || 0, Ideal: getTargetScore('Fibras'), fullMark: 100 },
    { subject: 'Consistência', Real: latestConsultation.pontuacao_consistencia || 0, Ideal: getTargetScore('Consistência'), fullMark: 100 },
  ] : [];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={() => navigate('/pacientes')} className="modal-close" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827' }}>{patient?.nome}</h1>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <span className="badge badge-primary">{patient?.sexo}</span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{patient?.email || 'Sem e-mail'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* Top header can have quick actions if needed, but let's follow the section-based requirement */}
          </div>
        </header>

        <div className="profile-layout">
          {/* SEÇÃO 1: Dados do Paciente */}
          <section className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">
                <User size={22} color="var(--primary-color)" />
                Dados do Paciente
              </h2>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
                onClick={savePatientChanges}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
            
            <div className="tabs-container" style={{ padding: '0 2rem', marginBottom: 0 }}>
              <button 
                className={`tab-button ${activeDataTab === 'pessoal' ? 'active' : ''}`} 
                onClick={() => setActiveDataTab('pessoal')}
              >
                Pessoal
              </button>
              <button 
                className={`tab-button ${activeDataTab === 'clinico' ? 'active' : ''}`} 
                onClick={() => setActiveDataTab('clinico')}
              >
                Clínico
              </button>
              <button 
                className={`tab-button ${activeDataTab === 'habitos' ? 'active' : ''}`} 
                onClick={() => setActiveDataTab('habitos')}
              >
                Hábitos
              </button>
            </div>

            <div className="profile-section-content">
              {activeDataTab === 'pessoal' && (
                <div className="editable-grid">
                  <div className="editable-field">
                    <label className="editable-label">Nome Completo</label>
                    <input 
                      type="text" className="editable-input" 
                      value={patient?.nome || ''} 
                      onChange={(e) => handlePatientUpdate('nome', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">E-mail</label>
                    <input 
                      type="email" className="editable-input" 
                      value={patient?.email || ''} 
                      onChange={(e) => handlePatientUpdate('email', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Telefone</label>
                    <input 
                      type="text" className="editable-input" 
                      value={patient?.telefone || ''} 
                      onChange={(e) => handlePatientUpdate('telefone', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">WhatsApp</label>
                    <input 
                      type="text" className="editable-input" 
                      value={patient?.whatsapp || ''} 
                      onChange={(e) => handlePatientUpdate('whatsapp', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Data de Nascimento</label>
                    <input 
                      type="date" className="editable-input" 
                      value={patient?.data_nascimento || ''} 
                      onChange={(e) => handlePatientUpdate('data_nascimento', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Sexo</label>
                    <select 
                      className="editable-input" 
                      value={patient?.sexo || ''} 
                      onChange={(e) => handlePatientUpdate('sexo', e.target.value)}
                      style={{ appearance: 'none' }}
                    >
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              )}

              {activeDataTab === 'clinico' && (
                <div className="editable-grid">
                  <div className="editable-field">
                    <label className="editable-label">Peso Inicial (kg)</label>
                    <input 
                      type="number" className="editable-input" 
                      value={patient?.peso_inicial || ''} 
                      onChange={(e) => handlePatientUpdate('peso_inicial', parseFloat(e.target.value))} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Altura (cm)</label>
                    <input 
                      type="number" className="editable-input" 
                      value={patient?.altura || ''} 
                      onChange={(e) => handlePatientUpdate('altura', parseFloat(e.target.value))} 
                    />
                  </div>
                  <div className="editable-field" style={{ gridColumn: 'span 2' }}>
                    <label className="editable-label">Objetivos</label>
                    <textarea 
                      className="editable-input" 
                      value={patient?.objetivo_texto || ''} 
                      onChange={(e) => handlePatientUpdate('objetivo_texto', e.target.value)}
                      style={{ minHeight: '80px' }}
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Medicamentos</label>
                    <input 
                      type="text" className="editable-input" 
                      value={patient?.medicamentos || ''} 
                      onChange={(e) => handlePatientUpdate('medicamentos', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Suplementos</label>
                    <input 
                      type="text" className="editable-input" 
                      value={patient?.suplementos || ''} 
                      onChange={(e) => handlePatientUpdate('suplementos', e.target.value)} 
                    />
                  </div>
                </div>
              )}

              {activeDataTab === 'habitos' && (
                <div className="editable-grid">
                  <div className="editable-field">
                    <label className="editable-label">Refeições/Dia</label>
                    <input 
                      type="number" className="editable-input" 
                      value={patient?.refeicoes_por_dia || ''} 
                      onChange={(e) => handlePatientUpdate('refeicoes_por_dia', parseInt(e.target.value))} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Água (Litros)</label>
                    <input 
                      type="number" step="0.1" className="editable-input" 
                      value={patient?.litros_agua || ''} 
                      onChange={(e) => handlePatientUpdate('litros_agua', parseFloat(e.target.value))} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Horário Acorda</label>
                    <input 
                      type="text" className="editable-input" 
                      value={patient?.horario_acorda || ''} 
                      onChange={(e) => handlePatientUpdate('horario_acorda', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field">
                    <label className="editable-label">Horário Dorme</label>
                    <input 
                      type="text" className="editable-input" 
                      value={patient?.horario_dorme || ''} 
                      onChange={(e) => handlePatientUpdate('horario_dorme', e.target.value)} 
                    />
                  </div>
                  <div className="editable-field" style={{ gridColumn: 'span 2' }}>
                    <label className="editable-label">Atividade Física</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <label className="radio-item">
                        <input 
                          type="radio" checked={patient?.atividade_fisica === true} 
                          onChange={() => handlePatientUpdate('atividade_fisica', true)} 
                        /> Sim
                      </label>
                      <label className="radio-item">
                        <input 
                          type="radio" checked={patient?.atividade_fisica === false} 
                          onChange={() => handlePatientUpdate('atividade_fisica', false)} 
                        /> Não
                      </label>
                    </div>
                    {patient?.atividade_fisica && (
                      <input 
                        type="text" className="editable-input" style={{ marginTop: '0.75rem' }}
                        placeholder="Qual atividade e frequência?"
                        value={patient?.atividade_fisica_descricao || ''} 
                        onChange={(e) => handlePatientUpdate('atividade_fisica_descricao', e.target.value)} 
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SEÇÃO 2: Consultas */}
          <section className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">
                <ClipboardList size={22} color="var(--primary-color)" />
                Evolução e Consultas
              </h2>
              <button 
                className="btn-primary" 
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                onClick={() => setIsConsultationModalOpen(true)}
              >
                <Plus size={18} />
                Nova Consulta
              </button>
            </div>
            
            <div className="profile-section-content">
              {/* Charts Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Weight Evolution Chart */}
                <div className="chart-container" style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <TrendingUp size={18} color="var(--primary-color)" />
                    <span style={{ fontWeight: 600, color: '#374151' }}>Evolução do Peso</span>
                  </div>
                  
                  {weightData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={weightData}>
                        <defs>
                          <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'var(--chart-text)', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: 'var(--chart-text)', fontSize: 12 }} 
                          dx={-10}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: '1px solid var(--border-color)', 
                            boxShadow: 'var(--shadow-lg)',
                            padding: '10px 15px',
                            backgroundColor: 'var(--card-bg)',
                            color: 'var(--text-main)'
                          }}
                          itemStyle={{ color: 'var(--primary-color)', fontWeight: 700 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="var(--primary-color)" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorPeso)" 
                          activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary-color)' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="chart-empty">
                      <Activity size={48} strokeWidth={1} />
                      <p>Nenhuma consulta registrada ainda</p>
                    </div>
                  )}
                </div>

                {/* Radar Chart */}
                <div className="chart-container" style={{ height: '100%', background: 'var(--chart-bg-gradient)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Apple size={18} color="var(--primary-color)" />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Performance Nutricional</span>
                    </div>
                  </div>

                  {combinedRadarData.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ height: '250px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={combinedRadarData}>
                            <PolarGrid stroke="var(--chart-grid)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--chart-text)', fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                              name="Meta"
                              dataKey="Ideal"
                              stroke="var(--text-muted)"
                              strokeWidth={1}
                              fill="var(--text-muted)"
                              fillOpacity={0.05}
                              strokeDasharray="4 4"
                            />
                            <Radar
                              name="Real"
                              dataKey="Real"
                              stroke="var(--primary-color)"
                              strokeWidth={2}
                              fill="var(--primary-color)"
                              fillOpacity={0.3}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid var(--border-color)', 
                                boxShadow: 'var(--shadow-lg)',
                                padding: '8px 12px',
                                fontSize: '12px',
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-main)'
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.5rem' }}>
                        {combinedRadarData.slice(0, 4).map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.subject}</span>
                            <span style={{ fontWeight: 700, color: item.Real >= item.Ideal - 10 ? '#10b981' : '#f59e0b' }}>{item.Real}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="chart-empty" style={{ height: '250px' }}>
                      <Activity size={48} strokeWidth={1} />
                      <p>Aguardando dados de consulta...</p>
                    </div>
                  )}
                </div>
              </div>


              {/* Consultation List */}
              <div className="patients-table-card">
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Peso</th>
                      <th>Cintura</th>
                      <th>Quadril</th>
                      <th>% Gordura</th>
                      <th>Próximo Retorno</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.length > 0 ? (
                      consultations.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={14} color="#9ca3af" />
                              {new Date(c.data_consulta).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td>{c.peso} kg</td>
                          <td>{c.cintura ? `${c.cintura} cm` : '-'}</td>
                          <td>{c.quadril ? `${c.quadril} cm` : '-'}</td>
                          <td>{c.percentual_gordura ? `${c.percentual_gordura}%` : '-'}</td>
                          <td>
                            {c.proximo_retorno ? (
                              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                                {new Date(c.proximo_retorno).toLocaleDateString('pt-BR')}
                              </span>
                            ) : '-'}
                          </td>
                          <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#6b7280' }}>
                            {c.observacoes || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                          Nenhuma consulta encontrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: Planos Alimentares */}
          <section className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">
                <Utensils size={22} color="var(--primary-color)" />
                Histórico de Planos Alimentares
              </h2>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                <Apple size={18} color="var(--primary-color)" />
                Gerar Plano Alimentar
              </button>
            </div>
            
            <div className="profile-section-content">
              {mealPlans.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {mealPlans.map(plan => (
                    <div key={plan.id} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div className="stat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="stat-icon" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <ClipboardList size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600 }}>Plano Alimentar</p>
                            <p style={{ fontWeight: 700, color: '#111827' }}>{new Date(plan.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <ChevronRight size={20} color="#9ca3af" />
                      </div>
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <span className="badge badge-primary">Completo</span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Gerado via IA</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-message" style={{ padding: '3rem' }}>
                  <Apple size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
                  <p>Nenhum plano alimentar gerado ainda.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="success-toast">
            <CheckCircle size={20} />
            Alterações salvas com sucesso!
          </div>
        )}

        {/* Modal */}
        <ConsultationModal 
          isOpen={isConsultationModalOpen} 
          onClose={() => setIsConsultationModalOpen(false)} 
          patientId={id || ''} 
          onSave={fetchProfileData} 
        />
      </main>
    </div>
  );
};

export default PatientProfile;
