import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/FollowingUsers.css';

const FollowingUsers = () => {
    const [followingUsers, setFollowingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFollowingUsers = async () => {
            if (!user) return;
            
            try {
                const response = await axios.get('http://localhost:5000/users/following', {
                    withCredentials: true
                });
                setFollowingUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching following users:', error);
                setLoading(false);
            }
        };

        fetchFollowingUsers();
    }, [user]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="who-to-follow">
            <h3>Who to follow</h3>
            <div className="following-users-list">
                {followingUsers.map((user) => (
                    <div key={user.id} className="following-user-card">
                        <img
                            src={user.profilePicture ? 
                                `http://localhost:5000/uploads/${user.profilePicture}` : 
                                `https://ui-avatars.com/api/?name=${user.username}`}
                            alt={user.username}
                            className="following-user-avatar"
                        />
                        <div className="following-user-info">
                            <div className="following-user-name">{user.username}</div>
                            <div className="following-user-bio">
                                {user.bio || 'No bio available'}
                            </div>
                        </div>
                        <button className="unfollow-button">Unfollow</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FollowingUsers; 