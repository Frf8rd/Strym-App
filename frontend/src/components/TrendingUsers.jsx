import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/TrendingUsers.css';

const TrendingUsers = () => {
    const [trendingUsers, setTrendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchTrendingUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users/trending', {
                    withCredentials: true
                });
                setTrendingUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trending users:', error);
                setLoading(false);
            }
        };

        fetchTrendingUsers();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="trending-section">
            <h3>Trends for you</h3>
            <div className="trending-users-list">
                {trendingUsers.map((user) => (
                    <div key={user.id} className="trending-user-card">
                        <img
                            src={user.profilePicture ? 
                                `http://localhost:5000/uploads/${user.profilePicture}` : 
                                `https://ui-avatars.com/api/?name=${user.username}`}
                            alt={user.username}
                            className="trending-user-avatar"
                        />
                        <div className="trending-user-info">
                            <div className="trending-user-name">{user.username}</div>
                            <div className="trending-user-followers">
                                {user.followers_count} followers
                            </div>
                        </div>
                        <button className="follow-button">Follow</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingUsers; 