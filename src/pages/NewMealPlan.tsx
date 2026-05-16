import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, CheckCircle, Sparkles, 
  Loader2, ChevronDown, ChevronUp, Utensils,
  Coffee, Sun, Sandwich, Moon, Apple
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getGeminiModel } from '../lib/gemini';
import Sidebar from '../components/Sidebar';

interface DayPlan {
  dia: string;
  refeicoes: {
    cafe_da_manha: string[];
    lanche_manha: string[];
    almoco: string[];
    lanche_tarde: string[];
    jantar: string[];
  };
}

interface WeeklyPlan {
  plano_semanal: DayPlan[];
}

const NewMealPlan: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>('Segunda-feira');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setPatient(data);
    if (error) console.error('Error fetching patient:', error);
  };

  const generateWithAI = async () => {
    if (!patient) return;
    
    setGenerating(true);
    try {
      let data;
      const isLocal = window.location.hostname === 'localhost';

      if (isLocal) {
        // Em desenvolvimento local, chamamos a API diretamente para evitar erros de rota do Vercel
        const model = getGeminiModel("gemini-2.5-flash");
        const prompt = `
          Você é um nutricionista profissional.
          Gere um plano alimentar semanal completo (Segunda a Domingo).
          Para cada refeição, forneça EXATAMENTE 3 opções variadas e saudáveis.

          Responda seguindo exatamente esta estrutura JSON:
          {
            "plano_semanal": [
              {
                "dia": "Segunda-feira",
                "refeicoes": {
                  "cafe_da_manha": ["opção 1", "opção 2", "opção 3"],
                  "lanche_manha": ["opção 1", "opção 2", "opção 3"],
                  "almoco": ["opção 1", "opção 2", "opção 3"],
                  "lanche_tarde": ["opção 1", "opção 2", "opção 3"],
                  "jantar": ["opção 1", "opção 2", "opção 3"]
                }
              }
            ]
          }

          Dados do Paciente:
          Nome: ${patient.nome}
          Objetivo: ${patient.objetivo_texto}
          Restrições: ${patient.restricoes_alergias || 'Nenhuma'}
          Preferências: ${patient.alimentos_preferidos || 'Brasil'}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // No modo JSON, a resposta deve ser um JSON limpo, mas mantemos o tratamento básico
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        data = JSON.parse(cleanJson);
      } else {
        // Em produção, usamos a serverless function por segurança
        const response = await fetch('/api/gerar-plano', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientData: patient })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro na geração');
        }
        data = await response.json();
      }

      setWeeklyPlan(data);
      setExpandedDay(data.plano_semanal[0]?.dia || null);
    } catch (error: any) {
      console.error('Error generating plan:', error);
      alert('Erro ao gerar plano com IA: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleEditOption = (dayIndex: number, mealKey: keyof DayPlan['refeicoes'], optionIndex: number, value: string) => {
    if (!weeklyPlan) return;
    
    const newPlan = { ...weeklyPlan };
    newPlan.plano_semanal[dayIndex].refeicoes[mealKey][optionIndex] = value;
    setWeeklyPlan(newPlan);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weeklyPlan) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('planos_alimentares')
        .insert([
          {
            paciente_id: id,
            conteudo: weeklyPlan
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/pacientes/${id}`);
      }, 2000);

    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Erro ao salvar plano alimentar.');
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (key: string) => {
    switch(key) {
      case 'cafe_da_manha': return <Coffee size={18} />;
      case 'lanche_manha': return <Apple size={18} />;
      case 'almoco': return <Sun size={18} />;
      case 'lanche_tarde': return <Sandwich size={18} />;
      case 'jantar': return <Moon size={18} />;
      default: return <Utensils size={18} />;
    }
  };

  const getMealLabel = (key: string) => {
    switch(key) {
      case 'cafe_da_manha': return 'Café da Manhã';
      case 'lanche_manha': return 'Lanche da Manhã';
      case 'almoco': return 'Almoço';
      case 'lanche_tarde': return 'Lanche da Tarde';
      case 'jantar': return 'Jantar';
      default: return key;
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
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Plano Alimentar com IA</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Paciente: <strong>{patient?.nome}</strong></p>
            </div>
          </div>
          {!weeklyPlan && (
            <button 
              onClick={generateWithAI} 
              disabled={generating}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', border: 'none' }}
            >
              {generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {generating ? 'Gerando Plano...' : 'Gerar com IA'}
            </button>
          )}
        </header>

        {success && (
          <div className="success-banner">
            <CheckCircle size={20} />
            Plano alimentar gerado e salvo com sucesso!
          </div>
        )}

        {!weeklyPlan && !generating && (
          <div className="empty-state-card" style={{ padding: '4rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '1rem', border: '2px dashed var(--border-color)' }}>
            <Sparkles size={48} color="var(--primary-color)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)' }}>Pronta para gerar o plano?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto 2rem' }}>
              Nossa IA analisará os objetivos, restrições e preferências de {patient?.nome} para criar um cardápio semanal completo.
            </p>
            <button onClick={generateWithAI} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 3rem' }}>
              Começar Geração
            </button>
          </div>
        )}

        {generating && (
          <div className="loading-overlay-card">
            <div className="loading-spinner-container">
              <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
              <h3 style={{ marginTop: '1.5rem', fontWeight: 600 }}>A IA está elaborando o melhor cardápio...</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Isso pode levar alguns segundos.</p>
            </div>
          </div>
        )}

        {weeklyPlan && (
          <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="weekly-plan-container">
              {weeklyPlan.plano_semanal.map((day, dayIdx) => (
                <div key={day.dia} className="day-card" style={{ marginBottom: '1rem', background: 'var(--card-bg)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <button 
                    type="button"
                    className="day-header"
                    onClick={() => setExpandedDay(expandedDay === day.dia ? null : day.dia)}
                    style={{ width: '100%', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedDay === day.dia ? 'var(--bg-main)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{day.dia}</span>
                    {expandedDay === day.dia ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {expandedDay === day.dia && (
                    <div className="day-content" style={{ padding: '2rem' }}>
                      <div className="meals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {Object.entries(day.refeicoes).map(([mealKey, options]) => (
                          <div key={mealKey} className="meal-box" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--primary-color)' }}>
                              {getMealIcon(mealKey)}
                              <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                                {getMealLabel(mealKey)}
                              </span>
                            </div>
                            
                            <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {options.map((opt, optIdx) => (
                                <div key={optIdx} style={{ position: 'relative' }}>
                                  <span style={{ position: 'absolute', left: '-1rem', top: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{optIdx + 1}</span>
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    style={{ fontSize: '0.875rem', paddingLeft: '0.75rem', background: 'var(--card-bg)' }}
                                    value={opt}
                                    onChange={(e) => handleEditOption(dayIdx, mealKey as keyof DayPlan['refeicoes'], optIdx, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions" style={{ position: 'sticky', bottom: '2rem', backgroundColor: 'white', zIndex: 10, boxShadow: '0 -4px 6px -1px rgb(0 0 0 / 0.05)', margin: '2rem -2rem -2rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setWeeklyPlan(null)}>
                Descartar e Tentar Novamente
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.75rem 4rem' }} 
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? 'Salvando...' : 'Salvar Plano Semanal'}
              </button>
            </div>
          </form>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-overlay-card {
          padding: 6rem;
          text-align: center;
          background: var(--card-bg);
          border-radius: 1rem;
          box-shadow: var(--shadow-md);
        }
      `}} />
    </div>
  );
};

export default NewMealPlan;
