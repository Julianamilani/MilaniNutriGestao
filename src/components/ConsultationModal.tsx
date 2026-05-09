import React, { useState } from 'react';
import { X, Save, Calendar, Weight, Ruler, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSave: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose, patientId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: '',
    pontuacao_proteina: 50,
    pontuacao_carboidrato: 50,
    pontuacao_gordura: 50,
    pontuacao_hidratacao: 50,
    pontuacao_fibras: 50,
    pontuacao_consistencia: 50
  });

  if (!isOpen) return null;

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
            paciente_id: patientId,
            data_consulta: formData.data_consulta,
            peso: formData.peso ? parseFloat(formData.peso) : null,
            cintura: formData.cintura ? parseFloat(formData.cintura) : null,
            quadril: formData.quadril ? parseFloat(formData.quadril) : null,
            percentual_gordura: formData.percentual_gordura ? parseFloat(formData.percentual_gordura) : null,
            observacoes: formData.observacoes,
            proximo_retorno: formData.proximo_retorno || null,
            pontuacao_proteina: formData.pontuacao_proteina,
            pontuacao_carboidrato: formData.pontuacao_carboidrato,
            pontuacao_gordura: formData.pontuacao_gordura,
            pontuacao_hidratacao: formData.pontuacao_hidratacao,
            pontuacao_fibras: formData.pontuacao_fibras,
            pontuacao_consistencia: formData.pontuacao_consistencia
          }
        ]);

      if (error) throw error;

      onSave();
      onClose();
      // Reset form
      setFormData({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: '',
        pontuacao_proteina: 50,
        pontuacao_carboidrato: 50,
        pontuacao_gordura: 50,
        pontuacao_hidratacao: 50,
        pontuacao_fibras: 50,
        pontuacao_consistencia: 50
      });
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Erro ao salvar consulta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Nova Consulta</h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="data_consulta">Data da Consulta *</label>
                <div className="input-container">
                  <Calendar className="input-icon" size={18} />
                  <input 
                    id="data_consulta" 
                    type="date" 
                    className="form-input" 
                    value={formData.data_consulta} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="peso">Peso Atual (kg) *</label>
                <div className="input-container">
                  <Weight className="input-icon" size={18} />
                  <input 
                    id="peso" 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="0.0"
                    value={formData.peso} 
                    onChange={handleInputChange} 
                    required
                  />
                  <span className="input-unit">kg</span>
                </div>
              </div>

              <div className="form-section-title">Medidas (Opcional)</div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="cintura">Cintura (cm)</label>
                <div className="input-container">
                  <Ruler className="input-icon" size={18} />
                  <input 
                    id="cintura" 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="0.0"
                    value={formData.cintura} 
                    onChange={handleInputChange} 
                  />
                  <span className="input-unit">cm</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quadril">Quadril (cm)</label>
                <div className="input-container">
                  <Ruler className="input-icon" size={18} />
                  <input 
                    id="quadril" 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="0.0"
                    value={formData.quadril} 
                    onChange={handleInputChange} 
                  />
                  <span className="input-unit">cm</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="percentual_gordura">% Gordura</label>
                <div className="input-container">
                  <Activity className="input-icon" size={18} />
                  <input 
                    id="percentual_gordura" 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="0.0"
                    value={formData.percentual_gordura} 
                    onChange={handleInputChange} 
                  />
                  <span className="input-unit">%</span>
                </div>
              </div>



              <div className="form-group">
                <label className="form-label" htmlFor="proximo_retorno">Próximo Retorno</label>
                <div className="input-container">
                  <Calendar className="input-icon" size={18} />
                  <input 
                    id="proximo_retorno" 
                    type="date" 
                    className="form-input" 
                    value={formData.proximo_retorno} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div className="form-section-title" style={{ gridColumn: 'span 2', marginTop: '1.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                Performance Nutricional (Radar)
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {[
                    { id: 'pontuacao_proteina', label: 'Proteínas', color: '#3b82f6' },
                    { id: 'pontuacao_carboidrato', label: 'Carboidratos', color: '#10b981' },
                    { id: 'pontuacao_gordura', label: 'Gorduras', color: '#f59e0b' },
                    { id: 'pontuacao_hidratacao', label: 'Hidratação', color: '#06b6d4' },
                    { id: 'pontuacao_fibras', label: 'Fibras', color: '#8b5cf6' },
                    { id: 'pontuacao_consistencia', label: 'Consistência', color: '#ec4899' },
                  ].map((p) => (
                    <div key={p.id} className="form-group" style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>{p.label}</label>
                        <span style={{ fontWeight: 700, color: p.color }}>{formData[p.id as keyof typeof formData]}%</span>
                      </div>
                      <input 
                        id={p.id}
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        className="form-input" 
                        style={{ padding: 0, height: '6px', background: '#e5e7eb', borderRadius: '3px', accentColor: p.color }}
                        value={formData[p.id as keyof typeof formData]} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" htmlFor="observacoes">Observações</label>
                <div className="input-container" style={{ display: 'block' }}>
                  <textarea 
                    id="observacoes" 
                    className="form-input" 
                    style={{ paddingLeft: '1rem' }}
                    placeholder="Anote aqui a evolução, dificuldades ou orientações passadas..."
                    value={formData.observacoes} 
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 'auto', padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
              disabled={loading}
            >
              <Save size={20} />
              {loading ? 'Salvando...' : 'Salvar Consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal;
