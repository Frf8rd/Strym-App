import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Auth = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/');
    } catch (error) {
      setError(error.error || 'A apărut o eroare. Vă rugăm încercați din nou.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
    navigate(isLogin ? '/register' : '/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-logo">
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path fill="#4a90e2" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/>
                <path fill="#4a90e2" d="M12,6c-3.31,0-6,2.69-6,6s2.69,6,6,6s6-2.69,6-6S15.31,6,12,6z M12,16c-2.21,0-4-1.79-4-4s1.79-4,4-4s4,1.79,4,4S14.21,16,12,16z"/>
              </svg>
              <span>STRYM</span>
            </div>
            <h1>{isLogin ? 'Bine ai revenit!' : 'Creează cont'}</h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Autentifică-te pentru a continua' 
                : 'Completează formularul pentru a crea un cont nou'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="Nume utilizator"
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
            )}

            <div className="form-group">
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                placeholder="Adresa de email"
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="form-group">
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                placeholder="Parola"
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            {isLogin && (
              <button type="button" className="forgot-password">
                Ai uitat parola?
              </button>
            )}

            <button type="submit" className="submit-button">
              {isLogin ? 'Autentificare' : 'Înregistrare'}
            </button>

            <div className="auth-divider">
              <span>sau</span>
            </div>

            <button type="button" onClick={toggleMode} className="toggle-button">
              {isLogin ? 'Creează un cont nou' : 'Ai deja un cont? Autentifică-te'}
            </button>
          </form>
        </div>

        <div className="auth-image">
          <div className="image-overlay">
            <h2>Hello</h2>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;