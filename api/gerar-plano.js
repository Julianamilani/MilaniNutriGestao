import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { patientData } = req.body;

  if (!patientData) {
    return res.status(400).json({ error: 'Patient data is required' });
  }

  // No backend, usamos a variável de ambiente do sistema (Vercel)
  // Localmente, o Vite não carrega automaticamente o .env para as funções em /api sem vercel dev
  const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

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
Objetivo: ${patientData.objetivo_texto}
Restrições: ${patientData.restricoes_alergias || 'Nenhuma'}
Preferências: ${patientData.alimentos_preferidos || 'Brasil'}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Tenta limpar o texto caso o modelo tenha incluído markdown por engano
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const jsonResponse = JSON.parse(cleanJson);

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return res.status(500).json({ error: 'Failed to generate meal plan', details: error.message });
  }
}
