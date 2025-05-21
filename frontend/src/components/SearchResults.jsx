import React, { useState } from 'react';
import { FiUser, FiMessageCircle, FiHeart, FiMoreHorizontal, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import '../styles/SearchResults.css';

const SearchResults = ({ 
    results, 
    onUserClick, 
    onPostClick, 
    user, 
    handleLike, 
    handleMenuClick, 
    activeMenu, 
    handleMenuClose, 
    startEditing, 
    handleDeletePost, 
    likedPosts,
    onBack 
}) => {
    const { language, translations } = useLanguage();
    const [postToDelete, setPostToDelete] = useState(null);

    const handleDelete = (postId) => {
        handleDeletePost(postId);
        setPostToDelete(null);
    };

    if (!results || (results.users.length === 0 && results.posts.length === 0)) {
        return (
            <div className="search-results">
                <div className="search-header">
                    <button className="back-button" onClick={onBack}>
                        <FiArrowLeft /> {translations[language].back}
                    </button>
                </div>
                <div className="no-results">{translations[language].noResults}</div>
            </div>
        );
    }

    return (
        <div className="search-results">
            <div className="search-header">
                <button className="back-button" onClick={onBack}>
                    <FiArrowLeft /> {translations[language].back}
                </button>
                <h2>{translations[language].searchResults}</h2>
            </div>

            {results.users.length > 0 && (
                <div className="search-section">
                    <h3>{translations[language].users}</h3>
                    <div className="users-list">
                        {results.users.map(user => (
                            <div 
                                key={`user-${user.user_id}`} 
                                className="user-card"
                                onClick={() => onUserClick(user.user_id)}
                            >
                                <img 
                                    src={user.profilePicture ? 
                                        `http://localhost:5000/uploads/${user.profilePicture}` : 
                                        `https://ui-avatars.com/api/?name=${user.username}`}
                                    alt={user.username}
                                    className="user-avatar"
                                    onClick={() => onUserClick(user.user_id)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <div className="user-info">
                                    <span className="username">{user.username}</span>
                                    <span className="user-bio">{user.bio}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.posts.length > 0 && (
                <div className="search-section">
                    <h3>{translations[language].posts}</h3>
                    <div className="posts-list">
                        {results.posts.map(post => (
                            <div key={post.post_id} className="post-card">
                                <div className="post-header">
                                    <div className="user-info">
                                        <img
                                            src={post.user?.profilePicture ? 
                                                `http://localhost:5000/uploads/${post.user.profilePicture}` : 
                                                `https://ui-avatars.com/api/?name=${post.user?.username}`}
                                            alt={post.user?.username}
                                            className="avatar"
                                            onClick={() => onUserClick(post.user_id)}
                                        />
                                        <div className="user-details">
                                            <span 
                                                className="username"
                                                onClick={() => onUserClick(post.user_id)}
                                            >
                                                {post.user?.username}
                                            </span>
                                            <span className="post-time">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="post-menu">
                                        <button 
                                            className="post-menu-button"
                                            onClick={() => handleMenuClick(post.post_id)}
                                        >
                                            <FiMoreHorizontal />
                                        </button>
                                        {activeMenu === post.post_id && (
                                            <div className="post-menu-dropdown">
                                                {(user && (user.id === post.user_id || user.role === 'admin')) ? (
                                                    <>
                                                        <div 
                                                            className="post-menu-option"
                                                            onClick={() => {
                                                                startEditing(post);
                                                                handleMenuClose();
                                                            }}
                                                        >
                                                            <FiEdit2 /> {translations[language].edit}
                                                        </div>
                                                        <div 
                                                            className="post-menu-option delete"
                                                            onClick={() => {
                                                                setPostToDelete(post.post_id);
                                                                handleMenuClose();
                                                            }}
                                                        >
                                                            <FiTrash2 /> {translations[language].delete}
                                                        </div>
                                                    </>
                                                ) : null}
                                                <div 
                                                    className="post-menu-option"
                                                    onClick={() => {
                                                        handleLike(post.post_id);
                                                        handleMenuClose();
                                                    }}
                                                >
                                                    <FiHeart /> {translations[language].like}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="post-content">{post.content}</div>
                                {post.media_url && (
                                    <div className="post-media">
                                        {post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <img 
                                                src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} 
                                                alt="Post media" 
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                            />
                                        ) : (
                                            <video 
                                                src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} 
                                                controls 
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                            />
                                        )}
                                    </div>
                                )}
                                <div className="post-interactions">
                                    <button 
                                        className="interaction-button"
                                        onClick={() => onPostClick(post.post_id)}
                                    >
                                        <FiMessageCircle className="interaction-icon" />
                                        <span>{translations[language].comment}</span>
                                    </button>
                                    <button 
                                        className={`interaction-button ${likedPosts.has(post.post_id) ? 'liked' : ''}`}
                                        onClick={() => handleLike(post.post_id)}
                                    >
                                        <FiHeart className="interaction-icon" />
                                        <span>{translations[language].like}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {postToDelete && (
                <div className="modal-overlay">
                    <div className="delete-confirm-modal">
                        <h3>{translations[language].confirmDelete}</h3>
                        <p>{translations[language].deleteConfirmation}</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setPostToDelete(null)}
                            >
                                {translations[language].cancelDelete}
                            </button>
                            <button 
                                className="confirm-delete-button"
                                onClick={() => handleDelete(postToDelete)}
                            >
                                {translations[language].confirmDeleteButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults; 