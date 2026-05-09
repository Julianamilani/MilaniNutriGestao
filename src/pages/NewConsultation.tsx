import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

const NewConsultation: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patientName, setPatientName] = useState('');

  const [formData, setFormData] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  useEffect(() => {
    fetchPatientName();
  }, [id]);

  const fetchPatientName = async () => {
    const { data } = await supabase
      .from('pacientes')
      .select('nome')
      .eq('id', id)
      .single();
    if (data) setPatientName(data.nome);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('consultas')
        .insert([
          {
            paciente_id: id,
            data_consulta: formData.data_consulta,
            peso: formData.peso ? parseFloat(formData.peso) : null,
            cintura: formData.cintura ? parseFloat(formData.cintura) : null,
            quadril: formData.quadril ? parseFloat(formData.quadril) : null,
            percentual_gordura: formData.percentual_gordura ? parseFloat(formData.percentual_gordura) : null,
            observacoes: formData.observacoes,
            proximo_retorno: formData.proximo_retorno || null
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/pacientes/${id}`);
      }, 2000);

    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Erro ao salvar consulta. Verifique os dados.');
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
            <button onClick={() => navigate(`/pacientes/${id}`)} className="btn-secondary" style={{ padding: '0.5rem' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>Nova Consulta</h1>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Registrando evolução para: <strong>{patientName}</strong></p>
            </div>
          </div>
        </header>

        {success && (
          <div className="success-banner">
            <CheckCircle size={20} />
            Consulta registrada com sucesso! Voltando ao perfil...
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="data_consulta">Data da Consulta *</label>
              <input 
                id="data_consulta" 
                type="date" 
                className="form-input" 
                value={formData.data_consulta} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="peso">Peso Atual (kg)</label>
              <div className="input-with-unit">
                <input 
                  id="peso" 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={formData.peso} 
                  onChange={handleInputChange} 
                />
                <span className="input-unit">kg</span>
              </div>
            </div>

            <div className="form-section-title">Medidas Antropométricas</div>
            <div className="form-group">
              <label className="form-label" htmlFor="cintura">Cintura (cm)</label>
              <div className="input-with-unit">
                <input 
                  id="cintura" 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={formData.cintura} 
                  onChange={handleInputChange} 
                />
                <span className="input-unit">cm</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="quadril">Quadril (cm)</label>
              <div className="input-with-unit">
                <input 
                  id="quadril" 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={formData.quadril} 
                  onChange={handleInputChange} 
                />
                <span className="input-unit">cm</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="percentual_gordura">Percentual de Gordura (%)</label>
              <div className="input-with-unit">
                <input 
                  id="percentual_gordura" 
                  type="number" 
                  step="0.1" 
                  className="form-input" 
                  value={formData.percentual_gordura} 
                  onChange={handleInputChange} 
                />
                <span className="input-unit">%</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="proximo_retorno">Próximo Retorno</label>
              <input 
                id="proximo_retorno" 
                type="date" 
                className="form-input" 
                value={formData.proximo_retorno} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" htmlFor="observacoes">Observações e Evolução</label>
              <textarea 
                id="observacoes" 
                className="form-input" 
                placeholder="Descreva a evolução do paciente, dificuldades e conquistas..."
                value={formData.observacoes} 
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(`/pacientes/${id}`)}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 'auto', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
              disabled={loading}
            >
              <Save size={20} />
              {loading ? 'Salvando...' : 'Registrar Consulta'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewConsultation;
