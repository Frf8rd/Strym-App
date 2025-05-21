import React, { useState } from 'react';
import { FiUser, FiMessageCircle, FiHeart, FiMoreHorizontal, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
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
    // Initialize likedPosts as a Set if it's undefined
    const likedPostsSet = React.useMemo(() => {
        return likedPosts instanceof Set ? likedPosts : new Set();
    }, [likedPosts]);

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
                        <FiArrowLeft /> Back
                    </button>
                </div>
                <div className="no-results">No results found</div>
            </div>
        );
    }

    return (
        <div className="search-results">
            <div className="search-header">
                <button className="back-button" onClick={onBack}>
                    <FiArrowLeft /> Back
                </button>
            </div>
            {results.posts.length > 0 && (
                <div className="search-section">
                    <h3>Posts</h3>
                    <div className="posts-list">
                        {results.posts.map(post => (
                            <div key={`post-${post.post_id}`} className="post-card">
                                <div className="post-header">
                                    <div className="user-info">
                                        <img
                                            key={`img-${post.post_id}`}
                                            src={post.user?.profilePicture ? 
                                                `http://localhost:5000/uploads/${post.user.profilePicture}` : 
                                                `https://ui-avatars.com/api/?name=${post.user?.username || 'User'}`}
                                            alt={post.user?.username || 'User'}
                                            className="avatar"
                                            onClick={() => onUserClick(post.user_id)}
                                            style={{ cursor: 'pointer' }}
                                            onError={(e) => {
                                                console.error('Error loading image:', post.user?.profilePicture);
                                                e.target.src = `https://ui-avatars.com/api/?name=${post.user?.username || 'User'}`;
                                            }}
                                        />
                                        <div className="user-details">
                                            <span 
                                                key={`username-${post.post_id}`}
                                                className="username"
                                                onClick={() => onUserClick(post.user_id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {post.user?.username || 'User'}
                                            </span>
                                            <span key={`time-${post.post_id}`} className="post-time">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="post-menu">
                                        <button 
                                            key={`menu-${post.post_id}`}
                                            className="post-menu-button"
                                            onClick={() => handleMenuClick(post.post_id)}
                                        >
                                            <FiMoreHorizontal />
                                        </button>
                                        {activeMenu === post.post_id && (
                                            <div key={`dropdown-${post.post_id}`} className="post-menu-dropdown">
                                                {(user && (user.id === post.user_id || user.role === 'admin')) ? (
                                                    <>
                                                        <div 
                                                            key={`edit-${post.post_id}`}
                                                            className="post-menu-option"
                                                            onClick={() => {
                                                                startEditing(post);
                                                                handleMenuClose();
                                                            }}
                                                        >
                                                            <FiEdit2 /> Edit
                                                        </div>
                                                        <div 
                                                            key={`delete-${post.post_id}`}
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
                                                    key={`like-${post.post_id}`}
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
                                
                                <div key={`content-${post.post_id}`} className="post-content">{post.content}</div>
                                {post.media_url && (
                                    <div key={`media-${post.post_id}`} className="post-media">
                                        {post.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                            <img 
                                                key={`img-media-${post.post_id}`}
                                                src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} 
                                                alt="Post media" 
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                                onError={(e) => {
                                                    console.error('Error loading image:', post.media_url);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <video 
                                                key={`video-media-${post.post_id}`}
                                                src={post.media_url.startsWith('http') ? post.media_url : `http://localhost:5000${post.media_url}`} 
                                                controls 
                                                style={{ maxWidth: '100%', height: 'auto' }}
                                            />
                                        )}
                                    </div>
                                )}
                                
                                <div key={`interactions-${post.post_id}`} className="post-interactions">
                                    <button 
                                        key={`comment-${post.post_id}`}
                                        className="interaction-button"
                                        onClick={() => onPostClick(post.post_id)}
                                    >
                                        <FiMessageCircle className="interaction-icon" />
                                        <span>Comment</span>
                                    </button>
                                    <button 
                                        key={`like-button-${post.post_id}`}
                                        className={`interaction-button ${likedPostsSet.has(post.post_id) ? 'liked' : ''}`}
                                        onClick={() => handleLike(post.post_id)}
                                    >
                                        <FiHeart className="interaction-icon" />
                                        <span>Like</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.users.length > 0 && (
                <div className="search-section">
                    <h3>Users</h3>
                    <div className="users-list">
                        {results.users.map((user, index) => (
                            <div 
                                key={`user-${user.user_id || user.id || index}`}
                                className="user-result"
                                onClick={() => onUserClick(user.user_id || user.id)}
                            >
                                <img
                                    key={`user-img-${user.user_id || user.id || index}`}
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
                                <div key={`user-info-${user.user_id || user.id || index}`} className="user-info">
                                    <div key={`user-username-${user.user_id || user.id || index}`} className="username">{user.username}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
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
                                onClick={() => handleDelete(postToDelete)}
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

export default SearchResults; 