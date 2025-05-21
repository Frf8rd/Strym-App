import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from './EditProfileModal';
import { FiArrowLeft, FiMessageCircle, FiHeart, FiMoreHorizontal, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../styles/UserProfile.css';

const UserProfile = ({ user, onBack }) => {
    const { user: currentUser } = useAuth();
    const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
    const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
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
                    <span className="post-count">{user.postsCount} posts</span>
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
                            Edit Profile
                        </button>
                    ) : (
                        <button 
                            className={`follow-button ${isFollowing ? 'following' : ''}`}
                            onClick={handleFollow}
                            disabled={isLoading}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
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
                        <span className="stat-value">{user.followingCount}</span>
                        <span className="stat-label">Following</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{followersCount}</span>
                        <span className="stat-label">Followers</span>
                    </div>
                </div>
            </div>

            <div className="feed-type-selector">
                <button className="feed-type-btn active">Posts</button>
                <button className="feed-type-btn">Replies</button>
                <button className="feed-type-btn">Media</button>
                <button className="feed-type-btn">Likes</button>
            </div>

            <div className="posts-feed">
                {loading ? (
                    <div className="loading">Loading posts...</div>
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
                                                        <FiEdit2 /> Edit
                                                    </div>
                                                    <div 
                                                        className="post-menu-option delete"
                                                        onClick={() => {
                                                            setPostToDelete(post.post_id);
                                                            handleMenuClose();
                                                        }}
                                                    >
                                                        <FiTrash2 /> Delete
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
                                                <FiHeart /> Like
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
                                    <div className="edit-actions">
                                        <button 
                                            onClick={() => handleUpdatePost(post.post_id)}
                                            className="save-edit"
                                        >
                                            Save
                                        </button>
                                        <button 
                                            onClick={() => setEditingPost(null)}
                                            className="cancel-edit"
                                        >
                                            Cancel
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
                                    <span>Comment</span>
                                </button>
                                        <button 
                                            className={`interaction-button ${likedPosts.has(post.post_id) ? 'liked' : ''}`}
                                            onClick={() => handleLike(post.post_id)}
                                        >
                                    <FiHeart className="interaction-icon" />
                                    <span>Like</span>
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
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setPostToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-delete-button"
                                onClick={() => handleDeletePost(postToDelete)}
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

export default UserProfile;