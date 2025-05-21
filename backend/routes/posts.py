from flask import Blueprint, request, jsonify
from models.post import Post
from models.like import Like
from models.comment import Comment
from database import db
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from config import Config
import urllib.parse
from flask import session
from models.follower import Follower

posts_bp = Blueprint('posts', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def delete_media_file(media_url):
    """Delete a media file from the uploads directory"""
    if not media_url:
        return
    
    try:
        # Extract filename from URL
        filename = os.path.basename(urllib.parse.urlparse(media_url).path)
        if filename:
            file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        print(f"Error deleting media file: {e}")

@posts_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to filename to make it unique
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        file.save(os.path.join(Config.UPLOAD_FOLDER, filename))
        return jsonify({
            'filename': filename
        }), 200
    
    return jsonify({'error': 'File type not allowed'}), 400

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([post.to_dict() for post in posts])

@posts_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict())

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    
    if not data or 'content' not in data or 'user_id' not in data:
        return jsonify({'error': 'Content and user_id are required'}), 400
    
    new_post = Post(
        user_id=data['user_id'],
        content=data['content'],
        media_url=data.get('media_url')
    )
    
    db.session.add(new_post)
    db.session.commit()
    
    return jsonify(new_post.to_dict()), 201

@posts_bp.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    data = request.get_json()
    
    # If media_url is being updated, delete the old media file
    if 'media_url' in data and data['media_url'] != post.media_url:
        delete_media_file(post.media_url)
        post.media_url = data['media_url']
    
    if 'content' in data:
        post.content = data['content']
    
    post.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(post.to_dict())

@posts_bp.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    # Delete associated comments first
    Comment.query.filter_by(post_id=post_id).delete()
    
    # Delete associated likes
    Like.query.filter_by(post_id=post_id).delete()
    
    # Delete the media file if it exists
    delete_media_file(post.media_url)
    
    # Delete the post
    db.session.delete(post)
    db.session.commit()
    return '', 204

@posts_bp.route('/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Check if like already exists
    existing_like = Like.query.filter_by(post_id=post_id, user_id=user_id).first()
    if existing_like:
        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({'message': 'Like removed', 'liked': False}), 200
    
    # Create new like
    new_like = Like(post_id=post_id, user_id=user_id)
    db.session.add(new_like)
    db.session.commit()
    
    return jsonify({'message': 'Post liked', 'liked': True}), 201

@posts_bp.route('/posts/<int:post_id>/likes', methods=['GET'])
def get_post_likes(post_id):
    likes = Like.query.filter_by(post_id=post_id).all()
    return jsonify([like.to_dict() for like in likes])

@posts_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.get_json()
    user_id = data.get('user_id')
    content = data.get('content')
    
    if not user_id or not content:
        return jsonify({'error': 'User ID and content are required'}), 400
    
    new_comment = Comment(
        post_id=post_id,
        user_id=user_id,
        content=content
    )
    
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify(new_comment.to_dict()), 201

@posts_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()
    return jsonify([comment.to_dict() for comment in comments])

@posts_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    db.session.delete(comment)
    db.session.commit()
    return '', 204

@posts_bp.route('/posts/following', methods=['GET'])
def get_following_posts():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    current_user_id = session['user_id']
    
    # Get posts from users that the current user follows
    following_posts = Post.query.join(
        Follower,
        Post.user_id == Follower.followed_id
    ).filter(
        Follower.follower_id == current_user_id
    ).order_by(Post.created_at.desc()).all()
    
    return jsonify([post.to_dict() for post in following_posts])

@posts_bp.route('/posts/user/<int:user_id>/likes', methods=['GET'])
def get_user_likes(user_id):
    likes = Like.query.filter_by(user_id=user_id).all()
    return jsonify([like.to_dict() for like in likes]) 