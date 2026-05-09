import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

type TabType = 'pessoal' | 'clinico' | 'habitos';

const NewPatient: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pessoal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivos: [] as string[],
    objetivo_texto: '',
    nivel_atividade: '',
    patologias: [] as string[],
    restricoes_alimentares: [] as string[],
    alergias: [] as string[],
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  const [age, setAge] = useState<number | null>(null);
  const [imc, setImc] = useState<string | null>(null);

  // Calculations
  useEffect(() => {
    if (formData.data_nascimento) {
      const birth = new Date(formData.data_nascimento);
      const today = new Date();
      let ageValue = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        ageValue--;
      }
      setAge(ageValue);
    } else {
      setAge(null);
    }
  }, [formData.data_nascimento]);

  useEffect(() => {
    if (formData.peso_inicial && formData.altura) {
      const weight = parseFloat(formData.peso_inicial);
      const height = parseFloat(formData.altura) / 100; // cm to m
      if (height > 0) {
        const imcValue = weight / (height * height);
        setImc(imcValue.toFixed(2));
      }
    } else {
      setImc(null);
    }
  }, [formData.peso_inicial, formData.altura]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleMultiSelect = (category: 'objetivos' | 'patologias' | 'restricoes_alimentares' | 'alergias', item: string) => {
    setFormData(prev => {
      const current = [...prev[category]];
      if (current.includes(item)) {
        return { ...prev, [category]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [category]: [...current, item] };
      }
    });
  };

  const formatTime = (value: string) => {
    if (!value) return '';
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 4) cleaned = cleaned.substring(0, 4);
    
    if (cleaned.length === 1) return `0${cleaned}:00`;
    if (cleaned.length === 2) return `${cleaned}:00`;
    if (cleaned.length === 3) return `0${cleaned.charAt(0)}:${cleaned.substring(1)}`;
    if (cleaned.length === 4) return `${cleaned.substring(0, 2)}:${cleaned.substring(2)}`;
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([
          {
            ...formData,
            data_nascimento: formData.data_nascimento || null,
            nutricionista_id: user?.id,
            peso_inicial: formData.peso_inicial ? parseFloat(formData.peso_inicial) : null,
            altura: formData.altura ? parseFloat(formData.altura) : null,
            refeicoes_por_dia: formData.refeicoes_por_dia ? parseInt(formData.refeicoes_por_dia) : null,
            litros_agua: formData.litros_agua ? parseFloat(formData.litros_agua) : null,
            horario_acorda: formatTime(formData.horario_acorda),
            horario_dorme: formatTime(formData.horario_dorme)
          }
        ])
        .select();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        if (data && data[0]) {
          navigate(`/pacientes/${data[0].id}`);
        } else {
          navigate('/pacientes');
        }
      }, 2000);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Erro ao salvar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="main-content">
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/pacientes')} className="btn-secondary" style={{ padding: '0.5rem' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Novo Paciente</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Cadastre um novo acompanhamento nutricional.</p>
            </div>
          </div>
        </header>

        {success && (
          <div className="success-banner">
            <CheckCircle size={20} />
            Paciente cadastrado com sucesso! Redirecionando...
          </div>
        )}

        <div className="tabs-container">
          <button className={`tab-button ${activeTab === 'pessoal' ? 'active' : ''}`} onClick={() => setActiveTab('pessoal')}>
            1. Pessoal
          </button>
          <button className={`tab-button ${activeTab === 'clinico' ? 'active' : ''}`} onClick={() => setActiveTab('clinico')}>
            2. Clínico
          </button>
          <button className={`tab-button ${activeTab === 'habitos' ? 'active' : ''}`} onClick={() => setActiveTab('habitos')}>
            3. Hábitos
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          {activeTab === 'pessoal' && (
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="nome">Nome Completo *</label>
                <input id="nome" type="text" className="form-input" value={formData.nome} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="data_nascimento">Data de Nascimento</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input id="data_nascimento" type="date" className="form-input" value={formData.data_nascimento} onChange={handleInputChange} />
                  {age !== null && <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--primary-color)' }}>{age} anos</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <div className="radio-group">
                  {['Feminino', 'Masculino', 'Outro'].map(s => (
                    <label key={s} className="radio-item">
                      <input type="radio" name="sexo" checked={formData.sexo === s} onChange={() => setFormData(prev => ({ ...prev, sexo: s }))} />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="telefone">Telefone</label>
                <input id="telefone" type="text" className="form-input" placeholder="(00) 0000-0000" value={formData.telefone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="whatsapp">WhatsApp</label>
                <input id="whatsapp" type="text" className="form-input" placeholder="(00) 00000-0000" value={formData.whatsapp} onChange={handleInputChange} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="email">E-mail</label>
                <input id="email" type="email" className="form-input" placeholder="paciente@exemplo.com" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>
          )}

          {activeTab === 'clinico' && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="peso_inicial">Peso Atual</label>
                <div className="input-with-unit">
                  <input id="peso_inicial" type="number" step="0.1" className="form-input" value={formData.peso_inicial} onChange={handleInputChange} />
                  <span className="input-unit">kg</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="altura">Altura</label>
                <div className="input-with-unit">
                  <input id="altura" type="number" className="form-input" value={formData.altura} onChange={handleInputChange} />
                  <span className="input-unit">cm</span>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">IMC Calculado</label>
                <input type="text" className="form-input readonly-input" value={imc || 'Aguardando peso e altura'} readOnly />
              </div>
              
              <div className="form-section-title">Objetivos</div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div className="checkbox-group">
                  {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                    <label key={obj} className="checkbox-item">
                      <input type="checkbox" checked={formData.objetivos.includes(obj)} onChange={() => handleMultiSelect('objetivos', obj)} />
                      {obj}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="objetivo_texto">Outros objetivos / Detalhes</label>
                <textarea id="objetivo_texto" className="form-input" value={formData.objetivo_texto} onChange={handleInputChange}></textarea>
              </div>

              <div className="form-section-title">Saúde e Restrições</div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Patologias</label>
                <div className="checkbox-group">
                  {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].map(p => (
                    <label key={p} className="checkbox-item">
                      <input type="checkbox" checked={formData.patologias.includes(p)} onChange={() => handleMultiSelect('patologias', p)} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="medicamentos">Medicamentos Contínuos</label>
                <textarea id="medicamentos" className="form-input" value={formData.medicamentos} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="suplementos">Suplementos em Uso</label>
                <textarea id="suplementos" className="form-input" value={formData.suplementos} onChange={handleInputChange}></textarea>
              </div>
            </div>
          )}

          {activeTab === 'habitos' && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="refeicoes_por_dia">Refeições por dia</label>
                <input id="refeicoes_por_dia" type="number" className="form-input" value={formData.refeicoes_por_dia} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="litros_agua">Água por dia</label>
                <div className="input-with-unit">
                  <input id="litros_agua" type="number" step="0.1" className="form-input" value={formData.litros_agua} onChange={handleInputChange} />
                  <span className="input-unit">litros</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="horario_acorda">Horário que acorda</label>
                <input id="horario_acorda" type="text" className="form-input" placeholder="ex: 6 ou 0630" value={formData.horario_acorda} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="horario_dorme">Horário que dorme</label>
                <input id="horario_dorme" type="text" className="form-input" placeholder="ex: 23 ou 2230" value={formData.horario_dorme} onChange={handleInputChange} />
              </div>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Pratica Atividade Física?</label>
                <div className="radio-group">
                  <label className="radio-item">
                    <input type="radio" checked={formData.atividade_fisica === true} onChange={() => setFormData(prev => ({ ...prev, atividade_fisica: true }))} />
                    Sim
                  </label>
                  <label className="radio-item">
                    <input type="radio" checked={formData.atividade_fisica === false} onChange={() => setFormData(prev => ({ ...prev, atividade_fisica: false }))} />
                    Não
                  </label>
                </div>
              </div>
              
              {formData.atividade_fisica && (
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="atividade_fisica_descricao">Qual atividade e frequência?</label>
                  <input id="atividade_fisica_descricao" type="text" className="form-input" value={formData.atividade_fisica_descricao} onChange={handleInputChange} />
                </div>
              )}

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="observacoes">Observações Gerais</label>
                <textarea id="observacoes" className="form-input" value={formData.observacoes} onChange={handleInputChange}></textarea>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/pacientes')}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
              <Save size={20} />
              {loading ? 'Salvando...' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewPatient;
