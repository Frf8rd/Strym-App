import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Configure axios defaults
axios.defaults.withCredentials = true;

const authService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/login`, {
                email,
                password
            }, {
                withCredentials: true
            });
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'A apărut o eroare la autentificare' };
        }
    },

    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/register`, userData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { error: 'A apărut o eroare la înregistrare' };
        }
    },

    logout: async () => {
        try {
            await axios.post(`${API_URL}/api/logout`, {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Eroare la deconectare:', error);
        } finally {
            localStorage.removeItem('user');
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await axios.get(`${API_URL}/api/me`, {
                withCredentials: true
            });
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data.user;
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 404) {
                localStorage.removeItem('user');
            }
            throw error.response?.data || { error: 'A apărut o eroare la obținerea datelor utilizatorului' };
        }
    },

    isAuthenticated: () => {
        const user = localStorage.getItem('user');
        return !!user;
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService; 