# 🥗 MilaniNutri Gestão

O **MilaniNutri Gestão** é um sistema completo e moderno desenvolvido para nutricionistas que buscam excelência no acompanhamento de seus pacientes. O sistema foca em uma experiência visual "premium", oferecendo ferramentas robustas para gestão de consultas, planos alimentares e análise de evolução física.

## ✨ Funcionalidades Principais

- **📊 Dashboard Inteligente**: Visão geral de pacientes, consultas semanais e alertas de pacientes sem retorno.
- **👥 Gestão de Pacientes**: Cadastro completo com dados clínicos, hábitos e histórico.
- **📑 Sistema de Consultas**: Registro de medidas antropométricas (peso, cintura, quadril, etc.) e acompanhamento de metas.
- **📈 Gráficos de Evolução**: Visualização dinâmica da evolução do paciente usando gráficos de radar e área.
- **🍎 Planos Alimentares**: Estrutura para criação e visualização de dietas personalizadas.
- **🌙 Modo Escuro (Dark Mode)**: Interface totalmente adaptável com design harmonizado e moderno.
- **🔐 Segurança Avançada**: Autenticação segura e Row Level Security (RLS) no banco de dados.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando o estado da arte do desenvolvimento web:

- **Frontend**: [React.js](https://reactjs.org/) com [Vite](https://vitejs.dev/) para máxima performance.
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) para um código mais seguro e manutenível.
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL) para persistência de dados e autenticação.
- **Ícones**: [Lucide React](https://lucide.dev/) para uma interface limpa e intuitiva.
- **Gráficos**: [Recharts](https://recharts.org/) para visualizações interativas.
- **Estilização**: CSS Moderno com suporte nativo a temas (Light/Dark).
- **Deployment**: Configurado para [Vercel](https://vercel.com/) com suporte a roteamento SPA.

## 🚀 Como o projeto foi desenvolvido

O desenvolvimento foi focado em três pilares principais:

1.  **UX/UI Premium**: Cada componente foi desenhado para transmitir profissionalismo, utilizando gradientes sutis, animações suaves e tipografia moderna.
2.  **Arquitetura Escalável**: Utilização de Context API para gerenciamento de estado global (Auth e Tema) e componentes modulares reaproveitáveis.
3.  **Segurança em Primeiro Lugar**: Integração nativa com Supabase Auth e implementação de políticas de segurança no banco de dados para garantir que os dados dos pacientes sejam acessíveis apenas pelo seu nutricionista responsável.

---

## ⚙️ Configuração para Desenvolvimento

Para rodar o projeto localmente:

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📦 Build e Deploy

Para gerar a versão de produção:
```bash
npm run build
```
O projeto já inclui um arquivo `vercel.json` configurado para deploys sem erros de 404 em Single Page Applications.

---
Desenvolvido com ❤️ para **MilaniNutri Gestão**.
