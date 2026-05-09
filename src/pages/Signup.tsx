import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert into nutricionistas table
        // We use the ID returned from Auth
        const { error: profileError } = await supabase
          .from('nutricionistas')
          .insert([
            {
              id: authData.user.id,
              nome: fullName,
              email: email
            },
          ]);

        if (profileError) throw profileError;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="logo-container">
          <div className="logo-text">
            MilaniNutri <span>Gestão</span>
          </div>
        </div>

        <h1 className="auth-title">Crie sua Conta</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Nome Completo</label>
            <div className="input-container">
              <UserCircle className="input-icon" size={20} />
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="input-container">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <div className="input-container">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="password-hint">Mínimo de 6 caracteres</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirmar Senha</label>
            <div className="input-container">
              <Lock className="input-icon" size={20} />
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <hr className="divider" />

        <div className="auth-footer">
          Já tem conta? <Link to="/login" className="auth-link">Faça login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
