import React from 'react';
import { X, Calendar, Coffee, Sun, Sandwich, Moon, Apple, Utensils } from 'lucide-react';

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
}

const MealPlanModal: React.FC<MealPlanModalProps> = ({ isOpen, onClose, plan }) => {
  if (!isOpen || !plan) return null;

  const content = plan.conteudo;
  const isWeekly = content && content.plano_semanal;

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
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="stat-icon" style={{ width: '2.5rem', height: '2.5rem' }}>
              <Calendar size={20} />
            </div>
            <h2 className="modal-title">Plano Alimentar - {new Date(plan.created_at).toLocaleDateString('pt-BR')}</h2>
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '2rem' }}>
          {isWeekly ? (
            <div className="weekly-plan-view">
              {content.plano_semanal.map((day: any) => (
                <div key={day.dia} style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-main)', paddingBottom: '0.5rem' }}>
                    {day.dia}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    {Object.entries(day.refeicoes).map(([mealKey, options]: [string, any]) => (
                      <div key={mealKey} style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                          {getMealIcon(mealKey)}
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>{getMealLabel(mealKey)}</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {options.map((opt: string, idx: number) => (
                            <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                              <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>•</span>
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="legacy-plan-view">
              {Array.isArray(content) ? content.map((meal: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '1rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>{meal.horario} - {meal.titulo}</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {meal.itens.map((item: string, i: number) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>- {item}</li>
                    ))}
                  </ul>
                </div>
              )) : <pre>{JSON.stringify(content, null, 2)}</pre>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
          <button className="btn-primary" onClick={() => window.print()} style={{ width: 'auto', padding: '0.75rem 2rem' }}>Imprimir Plano</button>
        </div>
      </div>
    </div>
  );
};

export default MealPlanModal;
