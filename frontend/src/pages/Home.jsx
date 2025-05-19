import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('http://localhost:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.error('Eroare la obținerea profilului', err);
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Eroare la deconectare:', error);
    }
  };

  return (
    <div>
      <h1>Welcome {user ? user.username : 'Guest'}</h1>
      {user && <p>{user.bio}</p>}
      <button 
        onClick={handleLogout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#393E46',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}
      >
        Deconectare
      </button>
    </div>
  );
};

export default Home;
