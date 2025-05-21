import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import EditProfileModal from './EditProfileModal';
import { FiArrowLeft, FiMessageCircle, FiHeart, FiMoreHorizontal, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import '../styles/UserProfile.css';

const UserProfile = ({ user, onBack }) => {
    const { user: currentUser } = useAuth();
    const { language, translations } = useLanguage();
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
    const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
    const [followingCount, setFollowingCount] = useState(user.followingCount || 0);
    const [isLoading, setIsLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [profileData, setProfileData] = useState(user);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [postToDelete, setPostToDelete] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/users/${user.id}`);
                setProfileData(response.data);
                setFollowersCount(response.data.followersCount);
                setFollowingCount(response.data.followingCount);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [user.id]);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/users/${user.id}/posts`);
                setPosts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user posts:', error);
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [user.id]);

    const isCurrentUser = currentUser && currentUser.id === user.id;

    const handleFollow = async () => {
        if (!currentUser) return;
        
        setIsLoading(true);
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const response = await axios.post(`/users/${user.id}/${endpoint}`);
            setIsFollowing(!isFollowing);
            setFollowersCount(response.data.followersCount);
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = (updatedData) => {
        setProfileData(updatedData);
    };

    const handleMenuClick = (postId) => {
        setActiveMenu(activeMenu === postId ? null : postId);
    };

    const handleMenuClose = () => {
        setActiveMenu(null);
    };

    const handleLike = async (postId) => {
        if (!currentUser) return;

        try {
            const response = await axios.post(`/posts/${postId}/like`, {
                user_id: currentUser.id
            });
            
            setLikedPosts(prev => {
                const newSet = new Set(prev);
                if (response.data.liked) {
                    newSet.add(postId);
                } else {
                    newSet.delete(postId);
                }
                return newSet;
            });
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const startEditing = (post) => {
        setEditingPost({
            post_id: post.post_id,
            content: post.content,
            media_url: post.media_url
        });
    };

    const handleUpdatePost = async (postId) => {
        try {
            const response = await axios.put(`/posts/${postId}`, {
                content: editingPost.content,
                media_url: editingPost.media_url
            });
            setPosts(posts.map(post => 
                post.post_id === postId ? response.data : post
            ));
            setEditingPost(null);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post.post_id !== postId));
            setPostToDelete(null);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleFileUpload = async (e, isEditing = false) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const fullUrl = `http://localhost:5000/uploads/${response.data.filename}`;
            if (isEditing) {
                setEditingPost({
                    ...editingPost,
                    media_url: fullUrl
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenu && !event.target.closest('.post-menu')) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenu]);

    return (
        <div className="profile-container">
            <div className="profile-top-header">
                <button className="back-button" onClick={onBack}>
                    <FiArrowLeft />
                </button>
                <div className="profile-top-info">
                    <h2 className="profile-name">{user.username}</h2>
                    <span className="post-count">{user.postsCount} {translations[language].posts}</span>
                </div>
            </div>

            <div className="profile-header">
                <div className="profile-cover" style={{ backgroundImage: 'url(/cover.jpg)' }}></div>
                <div className="profile-picture-container">
                    <img
                        src={user.profilePicture ? 
                            `http://localhost:5000/uploads/${user.profilePicture}` : 
                            `https://ui-avatars.com/api/?name=${user.username}`}
                        alt={user.username}
                        className="profile-picture"
                    />
                </div>
                <div className="profile-actions">
                    {currentUser && currentUser.id === user.id ? (
                        <button 
                            className="follow-button"
                            onClick={() => setShowEditModal(true)}
                        >
                            {translations[language].editProfile}
                        </button>
                    ) : (
                        <button 
                            className={`follow-button ${isFollowing ? 'following' : ''}`}
                            onClick={handleFollow}
                            disabled={isLoading}
                        >
                            {isFollowing ? translations[language].following : translations[language].follow}
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-info">
                <h1 className="profile-name">{user.username}</h1>
                <div className="profile-username">@{user.username}</div>
                
                {user.bio && <div className="profile-bio">{user.bio}</div>}
                
                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-value">{followingCount}</span>
                        <span className="stat-label">{translations[language].following}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{followersCount}</span>
                        <span className="stat-label">{translations[language].followers}</span>
                    </div>
                </div>
            </div>

            <div className="feed-type-selector">
                <button className="feed-type-btn active">{translations[language].posts}</button>
                <button className="feed-type-btn">{translations[language].replies}</button>
                <button className="feed-type-btn">{translations[language].media}</button>
                <button className="feed-type-btn">{translations[language].likes}</button>
            </div>

            <div className="posts-feed">
                {loading ? (
                    <div className="loading">{translations[language].loadingPosts}</div>
                ) : (
                    posts.map((post) => (
                        <div key={post.post_id} className="post-card">
                            <div className="post-header">
                                <div className="user-info">
                                    <img
                                        src={user.profilePicture ? 
                                            `http://localhost:5000/uploads/${user.profilePicture}` : 
                                            `https://ui-avatars.com/api/?name=${user.username}`}
                                        alt={user.username}
                                        className="avatar"
                                    />
                                    <div className="user-details">
                                        <span className="username">{user.username}</span>
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
                                            {(currentUser && (currentUser.id === post.user_id || currentUser.role === 'admin')) ? (
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
                            
                            {editingPost && editingPost.post_id === post.post_id ? (
                                <div className="edit-post-form">
                                    <textarea
                                        value={editingPost.content}
                                        onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                        maxLength={280}
                                    />
                                    <div className="edit-media-options">
                                        <label className="upload-button">
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                onChange={(e) => handleFileUpload(e, true)}
                                                style={{ display: 'none' }}
                                            />
                                            <FiImage className="upload-icon" />
                                            <span>{translations[language].addImage}</span>
                                        </label>
                                        {editingPost.media_url && (
                                            <div className="preview-container">
                                                {editingPost.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                    <img src={editingPost.media_url} alt="Preview" className="media-preview" />
                                                ) : (
                                                    <video src={editingPost.media_url} controls className="media-preview" />
                                                )}
                                                <button
                                                    type="button"
                                                    className="remove-media"
                                                    onClick={() => setEditingPost({ ...editingPost, media_url: '' })}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="edit-actions">
                                        <button 
                                            onClick={() => handleUpdatePost(post.post_id)}
                                            className="save-edit"
                                        >
                                            {translations[language].save}
                                        </button>
                                        <button 
                                            onClick={() => setEditingPost(null)}
                                            className="cancel-edit"
                                        >
                                            {translations[language].cancel}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                        <button className="interaction-button">
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
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onProfileUpdate={handleProfileUpdate}
            />

            {postToDelete && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="delete-confirm-modal">
                        <h3>{translations[language].confirmDelete}</h3>
                        <p>{translations[language].deleteConfirmation}</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setPostToDelete(null)}
                            >
                                {translations[language].cancel}
                            </button>
                            <button 
                                className="confirm-delete-button"
                                onClick={() => handleDeletePost(postToDelete)}
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

export default UserProfile;