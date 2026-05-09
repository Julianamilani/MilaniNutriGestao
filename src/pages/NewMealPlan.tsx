import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, CheckCircle, Clock, Utensils } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

interface MealItem {
  id: string;
  text: string;
}

interface Meal {
  id: string;
  horario: string;
  titulo: string;
  itens: MealItem[];
}

const NewMealPlan: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patientName, setPatientName] = useState('');

  const [meals, setMeals] = useState<Meal[]>([
    {
      id: crypto.randomUUID(),
      horario: '08:00',
      titulo: 'Café da Manhã',
      itens: [{ id: crypto.randomUUID(), text: '' }]
    }
  ]);

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

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        id: crypto.randomUUID(),
        horario: '',
        titulo: '',
        itens: [{ id: crypto.randomUUID(), text: '' }]
      }
    ]);
  };

  const removeMeal = (mealId: string) => {
    setMeals(meals.filter(m => m.id !== mealId));
  };

  const updateMeal = (mealId: string, field: keyof Meal, value: string) => {
    setMeals(meals.map(m => m.id === mealId ? { ...m, [field]: value } : m));
  };

  const addItem = (mealId: string) => {
    setMeals(meals.map(m => 
      m.id === mealId 
        ? { ...m, itens: [...m.itens, { id: crypto.randomUUID(), text: '' }] } 
        : m
    ));
  };

  const removeItem = (mealId: string, itemId: string) => {
    setMeals(meals.map(m => 
      m.id === mealId 
        ? { ...m, itens: m.itens.filter(i => i.id !== itemId) } 
        : m
    ));
  };

  const updateItem = (mealId: string, itemId: string, text: string) => {
    setMeals(meals.map(m => 
      m.id === mealId 
        ? { ...m, itens: m.itens.map(i => i.id === itemId ? { ...i, text } : i) } 
        : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Clean data for JSONB storage (remove UI IDs)
    const cleanedPlan = meals.map(m => ({
      horario: m.horario,
      titulo: m.titulo,
      itens: m.itens.map(i => i.text).filter(t => t.trim() !== '')
    })).filter(m => m.titulo.trim() !== '');

    try {
      const { error } = await supabase
        .from('planos_alimentares')
        .insert([
          {
            paciente_id: id,
            conteudo: cleanedPlan
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
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>Novo Plano Alimentar</h1>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Criando cardápio para: <strong>{patientName}</strong></p>
            </div>
          </div>
        </header>

        {success && (
          <div className="success-banner">
            <CheckCircle size={20} />
            Plano alimentar salvo com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {meals.map((meal) => (
            <div key={meal.id} className="form-card" style={{ marginBottom: '1.5rem', position: 'relative' }}>
              {meals.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeMeal(meal.id)}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={18} />
                </button>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-label">Horário</label>
                  <div className="input-with-unit">
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="00:00" 
                      value={meal.horario}
                      onChange={(e) => updateMeal(meal.id, 'horario', e.target.value)}
                    />
                    <Clock size={16} className="input-unit" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Refeição (ex: Almoço)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Título da refeição"
                    value={meal.titulo}
                    onChange={(e) => updateMeal(meal.id, 'titulo', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Opções e Alimentos</label>
                {meal.itens.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary-color)' }}>
                      <Utensils size={16} />
                    </div>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: 2 fatias de pão integral + 1 ovo"
                      value={item.text}
                      onChange={(e) => updateItem(meal.id, item.id, e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeItem(meal.id, item.id)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                      disabled={meal.itens.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => addItem(meal.id)}
                >
                  <Plus size={14} />
                  Adicionar Opção
                </button>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            className="btn-secondary" 
            style={{ width: '100%', marginBottom: '2.5rem', borderStyle: 'dashed', backgroundColor: 'transparent' }}
            onClick={addMeal}
          >
            <Plus size={20} />
            Adicionar Nova Refeição
          </button>

          <div className="form-actions" style={{ position: 'sticky', bottom: '2rem', backgroundColor: 'white', zIndex: 10, boxShadow: '0 -4px 6px -1px rgb(0 0 0 / 0.05)', margin: '0 -2rem -2rem', padding: '1.5rem 2rem' }}>
            <button type="button" className="btn-secondary" onClick={() => navigate(`/pacientes/${id}`)}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 'auto', padding: '0.75rem 3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
              disabled={loading}
            >
              <Save size={20} />
              {loading ? 'Salvando...' : 'Salvar Plano Alimentar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewMealPlan;
