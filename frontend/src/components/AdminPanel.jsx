import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiSettings, FiAlertCircle, FiFileText, FiSearch, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import '../styles/AdminPanel.css';

const AdminPanel = ({ onBack }) => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        if (currentUser?.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [currentUser, navigate]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users');
            setLoading(false);
        }
    };

    const handleUserRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
            fetchUsers(); // Refresh the users list
        } catch (error) {
            console.error('Error updating user role:', error);
            setError('Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            setShowDeleteConfirm(null);
            fetchUsers(); // Refresh the users list
        } catch (error) {
            console.error('Error deleting user:', error);
            setError(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <button className="back-button" onClick={onBack}>
                    <FiArrowLeft />
                </button>
                <h2>Admin Panel</h2>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <FiUsers /> Users
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <FiSettings /> Settings
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <FiFileText /> Reports
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'users' && (
                    <div className="users-section">
                        <div className="search-container">
                            <div className="search-box">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search users by username or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <h3>User Management</h3>
                        <div className="users-list">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="user-item">
                                    <div className="user-info">
                                        <img 
                                            src={user.profilePicture ? 
                                                `http://localhost:5000/uploads/${user.profilePicture}` : 
                                                `https://ui-avatars.com/api/?name=${user.username}`} 
                                            alt={user.username} 
                                            className="user-avatar"
                                            onError={(e) => {
                                                console.error('Error loading image:', user.profilePicture);
                                                e.target.src = `https://ui-avatars.com/api/?name=${user.username}`;
                                            }}
                                        />
                                        <div className="user-details">
                                            <span className="username">{user.username}</span>
                                            <span className="email">{user.email}</span>
                                        </div>
                                    </div>
                                    <div className="user-actions">
                                        <select 
                                            value={user.role}
                                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                            className="role-select"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {user.id !== currentUser.id && (
                                            <button 
                                                className="delete-button"
                                                onClick={() => setShowDeleteConfirm(user.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h3>Admin Settings</h3>
                        <p>Settings panel coming soon...</p>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="reports-section">
                        <h3>Reports</h3>
                        <p>Reports panel coming soon...</p>
                    </div>
                )}
            </div>

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="delete-confirm-modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-delete-button"
                                onClick={() => handleDeleteUser(showDeleteConfirm)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel; 