import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [user, setUser] = useState(null);

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

  return (
    <div>
      <h1>Welcome {user ? user.username : 'Guest'}</h1>
      {user && <p>{user.bio}</p>}
    </div>
  );
};

export default Home;
