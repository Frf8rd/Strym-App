import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiSettings, FiAlertCircle, FiFileText, FiSearch, FiTrash2, FiDownload } from 'react-icons/fi';
import axios from 'axios';
import '../styles/AdminPanel.css';

const AdminPanel = ({ onBack }) => {
    const { user: currentUser } = useAuth();
    const { language, translations } = useLanguage();
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

    const handleExportData = async () => {
        try {
            const response = await axios.get('/api/admin/export-data');
            const data = response.data.data;
            
            // Convert data to CSV format
            const headers = ['ID', 'Username', 'Email', 'Role', 'Profile Picture', 'Created At', 'Updated At'];
            const csvContent = [
                headers.join(','),
                ...data.map(user => [
                    user.id,
                    `"${user.username}"`,
                    `"${user.email}"`,
                    user.role,
                    user.profilePicture,
                    user.createdAt,
                    user.updatedAt
                ].join(','))
            ].join('\n');

            // Create and download the file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `user_data_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting data:', error);
            setError('Failed to export data');
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
                <h2>{translations[language].adminPanel}</h2>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <FiUsers /> {translations[language].users}
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <FiSettings /> {translations[language].settings}
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                >
                    <FiFileText /> {translations[language].reports}
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
                                    placeholder={translations[language].searchUsers}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button 
                                className="export-button"
                                onClick={handleExportData}
                            >
                                <FiDownload /> {translations[language].exportData}
                            </button>
                        </div>
                        <h3>{translations[language].userManagement}</h3>
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
                                            <option value="user">{translations[language].users}</option>
                                            <option value="admin">{translations[language].adminPanel}</option>
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
                        <h3>{translations[language].settings}</h3>
                        <p>{translations[language].settingsComingSoon}</p>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="reports-section">
                        <h3>{translations[language].reports}</h3>
                        <p>{translations[language].reportsComingSoon}</p>
                    </div>
                )}
            </div>

            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="delete-confirm-modal">
                        <h3>{translations[language].confirmDelete}</h3>
                        <p>{translations[language].deleteConfirmation}</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                {translations[language].cancel}
                            </button>
                            <button 
                                className="confirm-delete-button"
                                onClick={() => handleDeleteUser(showDeleteConfirm)}
                            >
                                {translations[language].delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel; 