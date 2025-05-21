import React, { useState } from 'react';
import axios from 'axios';
import { FiX, FiImage } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import '../styles/EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdate }) => {
    const { language, translations } = useLanguage();
    const [formData, setFormData] = useState({
        username: user.username || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload image
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Store only the filename
            setFormData(prev => ({
                ...prev,
                profilePicture: response.data.filename
            }));
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.put(`/users/${user.id}`, formData);
            onProfileUpdate(response.data);
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{translations[language].editProfile}</h2>
                    <button className="close-button" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <div className="profile-image-section">
                        <img
                            src={previewImage || (formData.profilePicture ? 
                                `http://localhost:5000/uploads/${formData.profilePicture}` : 
                                `https://ui-avatars.com/api/?name=${formData.username}`)}
                            alt="Profile"
                            className="profile-image-preview"
                        />
                        <label className="upload-image-button">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <FiImage className="upload-icon" />
                            <span>{translations[language].changePhoto}</span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">{translations[language].username}</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">{translations[language].bio}</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            maxLength={160}
                            placeholder={translations[language].tellUsAboutYourself}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {translations[language].cancel}
                        </button>
                        <button
                            type="submit"
                            className="save-button"
                            disabled={loading}
                        >
                            {loading ? translations[language].saving : translations[language].saveChanges}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal; 