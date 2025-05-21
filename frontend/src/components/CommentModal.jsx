import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiMessageCircle, FiHeart } from 'react-icons/fi';
import '../styles/CommentModal.css';

const CommentModal = ({ isOpen, onClose, post, user, onUserProfileClick }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentToDelete, setCommentToDelete] = useState(null);

    useEffect(() => {
        if (isOpen && post) {
            fetchComments();
        }
    }, [isOpen, post]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/posts/${post.post_id}/comments`);
            setComments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Failed to load comments');
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axios.post(`/posts/${post.post_id}/comments`, {
                user_id: user.id,
                content: newComment
            });
            setComments([response.data, ...comments]);
            setNewComment('');
            setError(null);
        } catch (error) {
            console.error('Error posting comment:', error);
            setError('Failed to post comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`/comments/${commentId}`);
            setComments(comments.filter(comment => comment.comment_id !== commentId));
            setCommentToDelete(null);
        } catch (error) {
            console.error('Error deleting comment:', error);
            setError('Failed to delete comment');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Comments</h2>
                    <button className="close-button" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="post-card">
                    <div className="post-header">
                        <div className="user-info">
                            <img
                                src={post.user?.profilePicture ? 
                                    `http://localhost:5000/uploads/${post.user.profilePicture}` : 
                                    `https://ui-avatars.com/api/?name=${post.user?.username || 'User'}`}
                                alt={post.user?.username || 'User'}
                                className="avatar"
                                onClick={() => onUserProfileClick && onUserProfileClick(post.user_id)}
                                style={{ cursor: 'pointer' }}
                            />
                            <div className="user-details">
                                <span 
                                    className="username"
                                    onClick={() => onUserProfileClick && onUserProfileClick(post.user_id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {post.user?.username || 'User'}
                                </span>
                                <span className="post-time">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </span>
                            </div>
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
                </div>

                <form onSubmit={handleSubmitComment} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        maxLength={280}
                    />
                    <button type="submit" disabled={!newComment.trim()}>
                        Comment
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                <div className="comments-list">
                    {loading ? (
                        <div className="loading">Loading comments...</div>
                    ) : comments.length === 0 ? (
                        <div className="no-comments">No comments yet</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.comment_id} className="comment">
                                <div className="comment-header">
                                    <img
                                        src={comment.user?.profilePicture ? 
                                            `http://localhost:5000/uploads/${comment.user.profilePicture}` : 
                                            `https://ui-avatars.com/api/?name=${comment.user?.username || 'User'}`}
                                        alt={comment.user?.username || 'User'}
                                        className="avatar"
                                        onClick={() => onUserProfileClick && onUserProfileClick(comment.user_id)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <div className="comment-details">
                                        <span 
                                            className="username"
                                            onClick={() => onUserProfileClick && onUserProfileClick(comment.user_id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {comment.user?.username || 'User'}
                                        </span>
                                        <span className="comment-time">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {user && (user.id === comment.user_id || user.role === 'admin') && (
                                        <button
                                            className="delete-comment"
                                            onClick={() => setCommentToDelete(comment.comment_id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <div className="comment-content">{comment.content}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {commentToDelete && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="delete-confirm-modal">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setCommentToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-delete-button"
                                onClick={() => handleDeleteComment(commentToDelete)}
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

export default CommentModal; 