/**
 * Formata uma string de data (YYYY-MM-DD) para pt-BR sem sofrer deslocamento de fuso horário.
 * Útil para campos do tipo 'date' do Postgres que não possuem componente de hora.
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  // Se for uma string de data (YYYY-MM-DD), dividimos para evitar que o JS interprete como UTC
  if (dateString.includes('-')) {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Mês no JS é 0-indexado
      const day = parseInt(parts[2]);
      
      return new Date(year, month, day).toLocaleDateString('pt-BR');
    }
  }
  
  // Caso contrário, tenta o fallback padrão (para timestamps por exemplo)
  return new Date(dateString).toLocaleDateString('pt-BR');
};

/**
 * Converte uma string de data (YYYY-MM-DD) em um objeto Date local (à meia-noite).
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
