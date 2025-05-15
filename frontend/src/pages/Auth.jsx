import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import '../styles/Auth.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Auth = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const url = isLogin
      ? `${API_URL}/api/login`
      : `${API_URL}/api/register`;

    try {
      const response = await axios.post(url, formData, {
        withCredentials: true // Important pentru sesiuni
      });

      if (response.data.user) {
        // Salvăm informațiile utilizatorului în localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert(isLogin ? 'Autentificare reușită!' : 'Cont creat cu succes!');
        navigate('/'); // Redirecționăm către pagina principală
      }
    } catch (error) {
      setError(error.response?.data?.error || 'A apărut o eroare. Vă rugăm încercați din nou.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-form">
          <div className="logo"></div>
          <h1 className="title">Hello</h1>
          <form onSubmit={handleSubmit} className={isLogin ? "login-mode" : "register-mode"}>
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="Username"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  placeholder="Prenume"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  placeholder="Nume"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </>
            )}
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email"
              className="input-field"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="Password"
              className="input-field"
              onChange={handleChange}
              required
            />
            {error && <p className="error">{error}</p>}
            {isLogin && <button type="button" className="forgot-password">Ai uitat parola?</button>}

            <button type="submit" className="login-button">
              {isLogin ? 'Autentificare' : 'Înregistrare'}
            </button>
            <button type="button" onClick={toggleMode} className="toggle-button">
              {isLogin ? 'Creează un cont' : 'Ai deja un cont? Autentifică-te'}
            </button>
          </form>
        </div>
        <div className="image-block">
          <img src="/lol1.jpg" alt="image" className="image" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
