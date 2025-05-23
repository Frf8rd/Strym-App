import React, { useState } from 'react';
import axios from 'axios';
import { FiImage, FiX } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPost, newPost, setNewPost }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const { language, translations } = useLanguage();

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onPost(e);
        onClose();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            
            const fullUrl = `http://localhost:5000/uploads/${response.data.filename}`;
            setNewPost({
                ...newPost,
                media_url: fullUrl,
                media_type: file.type.startsWith('image/') ? 'image' : 'video'
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadError(file.type.startsWith('image/') ? 
                translations[language].imageUploadError : 
                translations[language].videoUploadError
            );
        } finally {
            setUploading(false);
        }
    };

    const remainingChars = 280 - (newPost.content?.length || 0);
    const characterCounterClass = 
        remainingChars < 0 ? 'error' : 
        remainingChars < 20 ? 'warning' : '';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{translations[language].createPost}</h2>
                    <button className="close-button" onClick={onClose}>
                        <FiX />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="post-input-container">
                        <textarea
                            placeholder={translations[language].writeSomething}
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            maxLength={280}
                        />
                    </div>
                    
                    <div className="media-options">
                        <label className="upload-button">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <FiImage className="upload-icon" />
                            <span>{translations[language].addImage}</span>
                        </label>
                        {uploading && <span className="uploading-text">{translations[language].loading}</span>}
                        {uploadError && <span className="upload-error">{uploadError}</span>}
                        {newPost.media_url && (
                            <div className="preview-container">
                                {newPost.media_type === 'image' ? (
                                    <img src={newPost.media_url} alt="Preview" className="media-preview" />
                                ) : (
                                    <video src={newPost.media_url} controls className="media-preview" />
                                )}
                                <button
                                    type="button"
                                    className="remove-media"
                                    onClick={() => setNewPost({ ...newPost, media_url: '', media_type: 'image' })}
                                >
                                    <FiX />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="modal-actions">
                        <button 
                            type="submit" 
                            disabled={!newPost.content?.trim() || remainingChars < 0}
                            className="submit-post"
                        >
                            {translations[language].createPostButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;