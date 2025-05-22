import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiBell, FiMail, FiBookmark, FiList, FiImage, FiLogOut, FiMessageCircle, FiHeart, FiMoreHorizontal, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { RiQuillPenLine } from 'react-icons/ri';
import CreatePostModal from '../components/CreatePostModal';
import CommentModal from '../components/CommentModal';
import UserProfile from '../components/UserProfile';
import Settings from '../components/Settings';
import SearchResults from '../components/SearchResults';
import '../styles/Home.css';
import { useLanguage } from '../context/LanguageContext';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

const Home = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { language, translations } = useLanguage();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({
        content: '',
        media_url: ''
    });
    const [editingPost, setEditingPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [feedType, setFeedType] = useState('forYou');
    const [showSettings, setShowSettings] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);


    const rightSectionRef = useRef(null);
    const [isScrollLocked, setIsScrollLocked] = useState(false);

    useEffect(() => {
        const container = rightSectionRef.current;

        const handleScroll = () => {
            if (!container) return;
            const { scrollTop, scrollHeight, clientHeight } = container;

            // Dacă suntem jos de tot
            if (scrollTop + clientHeight >= scrollHeight - 1) {
                container.style.overflowY = 'hidden';
                setIsScrollLocked(true);
            }

            // Dacă dăm în sus
            if (isScrollLocked && scrollTop + clientHeight < scrollHeight - 10) {
                container.style.overflowY = 'auto';
                setIsScrollLocked(false);
            }
        };

        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isScrollLocked]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchPosts();
    }, [isAuthenticated, navigate, feedType]);

    const fetchPosts = async () => {
        try {
            let response;
            if (feedType === 'following') {
                response = await axios.get('/posts/following');
            } else {
                response = await axios.get('/posts');
            }
            setPosts(response.data);
            
            // Fetch liked state for the current user
            if (isAuthenticated && user) {
                try {
                    const likesResponse = await axios.get(`/posts/user/${user.id}/likes`);
                    const likedPostsSet = new Set(likesResponse.data.map(like => like.post_id));
                    setLikedPosts(likedPostsSet);
                } catch (error) {
                    console.error('Error fetching user likes:', error);
                }
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts');
            setLoading(false);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post('/posts', {
                ...newPost,
                user_id: user.id
            });
            setPosts([response.data, ...posts]);
            setNewPost({ content: '', media_url: '' });
            setError(null);
        } catch (error) {
            console.error('Error creating post:', error);
            setError('Failed to create post. Please try again.');
        }
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
            setError(null);
        } catch (error) {
            console.error('Error updating post:', error);
            setError('Failed to update post. Please try again.');
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post.post_id !== postId));
            setPostToDelete(null);
            setError(null);
        } catch (error) {
            console.error('Error deleting post:', error);
            setError('Failed to delete post. Please try again.');
        }
    };

    const startEditing = (post) => {
        setEditingPost({
            post_id: post.post_id,
            content: post.content,
            media_url: post.media_url
        });
    };

    const cancelEditing = () => {
        setEditingPost(null);
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
            } else {
                setNewPost({
                    ...newPost,
                    media_url: fullUrl
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload file. Please try again.');
        }
    };

    const handleLike = async (postId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(`/posts/${postId}/like`, {
                user_id: user.id
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
            setError('Failed to like post');
        }
    };

    const handleUserProfileClick = async (userId) => {
        try {
            const response = await axios.get(`/users/${userId}`);
            setSelectedUser(response.data);
            setShowUserProfile(true);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Failed to load user profile');
        }
    };

    const handleMenuClick = (postId) => {
        setActiveMenu(activeMenu === postId ? null : postId);
    };

    const handleMenuClose = () => {
        setActiveMenu(null);
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

    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults(null);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axios.get(`/search?q=${encodeURIComponent(query)}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching:', error);
            setError('Failed to perform search');
        }
        setIsSearching(false);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        handleSearch(query);
    };

    const handleUserClick = (userId) => {
        handleUserProfileClick(userId);
        setSearchResults(null);
        setSearchQuery('');
    };

    const handlePostClick = (postId) => {
        const post = posts.find(p => p.post_id === postId);
        if (post) {
            setSelectedPost(post);
            setIsCommentModalOpen(true);
        }
        setSearchResults(null);
        setSearchQuery('');
    };

    if (loading) {
        return <div className="loading">Loading posts...</div>;
    }

  return (
        <div className="twitter-layout">
            {/* Left Section */}
            <div className="left-section">
                <div className="logo">
                    <svg viewBox="0 0 24 24" width="40" height="40">
                        <path fill="#4a90e2" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/>
                        <path fill="#4a90e2" d="M12,6c-3.31,0-6,2.69-6,6s2.69,6,6,6s6-2.69,6-6S15.31,6,12,6z M12,16c-2.21,0-4-1.79-4-4s1.79-4,4-4s4,1.79,4,4S14.21,16,12,16z"/>
                    </svg>
                    <span>STRYM</span>
                </div>
                <nav className="main-nav">
                    <button 
                        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('home');
                            setShowUserProfile(false);
                            setShowSettings(false);
                            setSelectedUser(null);
                            fetchPosts();
                        }}
                    >
                        <FiHome className="nav-icon" /> {translations[language].home}
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('profile');
                            setShowUserProfile(true);
                            setShowSettings(false);
                            setSelectedUser(user);
                        }}
                    >
                        <FiUser className="nav-icon" /> {translations[language].profile}
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('settings');
                            setShowUserProfile(false);
                            setShowSettings(true);
                        }}
                    >
                        <FiSettings className="nav-icon" /> {translations[language].settings}
                    </button>
                    <button className="nav-item">
                        <FiBell className="nav-icon" /> {translations[language].notifications}
                    </button>
                    <button className="nav-item">
                        <FiMail className="nav-icon" /> {translations[language].messages}
                    </button>
                    <button className="nav-item">
                        <FiBookmark className="nav-icon" /> {translations[language].bookmarks}
                    </button>
                    <button className="nav-item">
                        <FiList className="nav-icon" /> {translations[language].lists}
                    </button>
                </nav>
                <button className="post-button" onClick={() => setIsModalOpen(true)}>
                    <RiQuillPenLine /> {translations[language].post}
                </button>
                <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    <img 
                        src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}`} 
                        alt="Profile" 
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <span className="profile-name">{user?.username || 'User'}</span>
                        <span className="profile-username">@{user?.username || 'user'}</span>
                    </div>
                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            {user?.role === 'admin' && (
                                <button 
                                    className="dropdown-item"
                                    onClick={() => {
                                        navigate('/admin');
                                        setShowProfileMenu(false);
                                    }}
                                >
                                    <FiSettings /> {translations[language].adminPanel}
                                </button>
                            )}
                            <button 
                                className="dropdown-item"
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                            >
                                <FiLogOut /> {translations[language].logout}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="right-section" ref={rightSectionRef}>

                <div className="content-wrapper">
                    {/* Main Content */}
                    <div className="main-content">
                        {error && <div className="error-message">{error}</div>}
                        
                        {showSettings ? (
                            <Settings onBack={() => {
                                setShowSettings(false);
                                setActiveTab('home');
                            }} />
                        ) : showUserProfile && selectedUser ? (
                            <UserProfile 
                                user={selectedUser} 
                                onBack={() => setShowUserProfile(false)}
                            />
                        ) : isSearching ? (
                            <div className="loading">Searching...</div>
                        ) : searchResults ? (
                            <SearchResults 
                                results={searchResults}
                                onUserClick={(userId) => {
                                    if (userId) {
                                        handleUserProfileClick(userId);
                                    }
                                }}
                                onPostClick={(postId) => {
                                    if (postId) {
                                        const post = posts.find(p => p.post_id === postId);
                                        if (post) {
                                            setSelectedPost(post);
                                            setIsCommentModalOpen(true);
                                        }
                                    }
                                }}
                                user={user}
                                handleLike={handleLike}
                                handleMenuClick={handleMenuClick}
                                activeMenu={activeMenu}
                                handleMenuClose={handleMenuClose}
                                startEditing={startEditing}
                                handleDeletePost={handleDeletePost}
                                likedPosts={likedPosts}
                                onBack={() => {
                                    setSearchResults(null);
                                    setSearchQuery('');
                                }}
                            />
                        ) : (
                            <>
                                <div className="feed-type-selector">
                                    <button 
                                        className={`feed-type-btn ${feedType === 'forYou' ? 'active' : ''}`}
                                        onClick={() => setFeedType('forYou')}
                                    >
                                        {translations[language].forYou}
                                    </button>
                                    <button 
                                        className={`feed-type-btn ${feedType === 'following' ? 'active' : ''}`}
                                        onClick={() => setFeedType('following')}
                                    >
                                        {translations[language].following}
                                    </button>
                                </div>

                                <div className="posts-feed">
                                    {posts.map((post) => (
                                        <div key={post.post_id} className="post-card">
                                            <div className="post-header">
                                                <div className="user-info">
                                                    <img
                                                        src={post.user?.profilePicture ? 
                                                            `http://localhost:5000/uploads/${post.user.profilePicture}` : 
                                                            `https://ui-avatars.com/api/?name=${post.user?.username || 'User'}`}
                                                        alt={post.user?.username || 'User'}
                                                        className="avatar"
                                                        onClick={() => handleUserProfileClick(post.user_id)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <div className="user-details">
                                                        <span 
                                                            className="username"
                                                            onClick={() => handleUserProfileClick(post.user_id)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {post.user?.username || 'User'}
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
                                                            onClick={cancelEditing}
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
                                                                    onError={(e) => {
                                                                        console.error('Error loading image:', post.media_url);
                                                                        e.target.style.display = 'none';
                                                                    }}
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
                                                            onClick={() => {
                                                                setSelectedPost(post);
                                                                setIsCommentModalOpen(true);
                                                            }}
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
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="sidebar right-sidebar">
                        <div className="search-box">
                            <input 
                                type="text" 
                                placeholder={translations[language].searchPlaceholder}
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        
                        <div className="trending-section">
                            <h3>{translations[language].trendingUsers}</h3>
                        </div>
                        <div className="following-section">
                            <h3>{translations[language].following}</h3>
                        </div>
                        <div className="about-section">
                            <h3>{translations[language].aboutUs}</h3>
                            <p>{translations[language].aboutUsDescription}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPost={handlePostSubmit}
                newPost={newPost}
                setNewPost={setNewPost}
            />

            {/* Comment Modal */}
            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => {
                    setIsCommentModalOpen(false);
                    setSelectedPost(null);
                }}
                post={selectedPost}
                user={user}
                onUserProfileClick={handleUserProfileClick}
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

export default Home;