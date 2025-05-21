from flask import Blueprint, jsonify, session, request
from models.user import User
from models.follower import Follower
from models.post import Post
from database import db
from functools import wraps
import os
from werkzeug.utils import secure_filename
from config import Config
import urllib.parse
from sqlalchemy import func, or_

users_bp = Blueprint('users', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

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

@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's posts count
        posts_count = len(user.posts)
        
        # Get followers and following counts
        followers_count = len(user.followers)
        following_count = len(user.following)
        
        # Check if current user is following this user
        is_following = False
        if 'user_id' in session:
            current_user_id = session['user_id']
            is_following = Follower.query.filter_by(
                follower_id=current_user_id,
                followed_id=user_id
            ).first() is not None
        
        user_data = {
            'id': user.user_id,
            'username': user.username,
            'email': user.email,
            'profilePicture': user.profile_picture,
            'bio': user.bio,
            'postsCount': posts_count,
            'followersCount': followers_count,
            'followingCount': following_count,
            'isFollowing': is_following,
            'createdAt': user.created_at.isoformat() if user.created_at else None
        }
        
        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    try:
        # Check if user exists and is the current user
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.user_id != session['user_id']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update username if provided
        if 'username' in data:
            # Check if username is already taken
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.user_id != user_id:
                return jsonify({'error': 'Username already taken'}), 400
            user.username = data['username']
        
        # Update bio if provided
        if 'bio' in data:
            user.bio = data['bio']
        
        # Update profile picture if provided
        if 'profilePicture' in data and data['profilePicture'] != user.profile_picture:
            # Delete old profile picture if it exists and is not default.jpg
            if user.profile_picture and user.profile_picture != 'default.jpg':
                delete_media_file(user.profile_picture)
            user.profile_picture = data['profilePicture']
        
        db.session.commit()
        
        # Get updated user data
        user_data = {
            'id': user.user_id,
            'username': user.username,
            'email': user.email,
            'profilePicture': user.profile_picture,
            'bio': user.bio,
            'postsCount': len(user.posts),
            'followersCount': len(user.followers),
            'followingCount': len(user.following),
            'isFollowing': False,  # Not relevant for own profile
            'createdAt': user.created_at.isoformat() if user.created_at else None
        }
        
        return jsonify(user_data), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>/follow', methods=['POST'])
@login_required
def follow_user(user_id):
    try:
        current_user_id = session['user_id']
        
        # Can't follow yourself
        if current_user_id == user_id:
            return jsonify({'error': 'You cannot follow yourself'}), 400
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if already following
        existing_follow = Follower.query.filter_by(
            follower_id=current_user_id,
            followed_id=user_id
        ).first()
        
        if existing_follow:
            return jsonify({'error': 'Already following this user'}), 400
        
        # Create new follow relationship
        new_follow = Follower(follower_id=current_user_id, followed_id=user_id)
        db.session.add(new_follow)
        db.session.commit()
        
        return jsonify({
            'message': 'Successfully followed user',
            'followersCount': len(user.followers)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>/unfollow', methods=['POST'])
@login_required
def unfollow_user(user_id):
    try:
        current_user_id = session['user_id']
        
        # Check if follow relationship exists
        follow = Follower.query.filter_by(
            follower_id=current_user_id,
            followed_id=user_id
        ).first()
        
        if not follow:
            return jsonify({'error': 'Not following this user'}), 400
        
        # Remove follow relationship
        db.session.delete(follow)
        db.session.commit()
        
        # Get updated user data
        user = User.query.get(user_id)
        
        return jsonify({
            'message': 'Successfully unfollowed user',
            'followersCount': len(user.followers)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@users_bp.route('/trending', methods=['GET'])
def get_trending_users():
    try:
        # Get users ordered by number of followers using the followers relationship
        trending_users = User.query.outerjoin(Follower, User.user_id == Follower.followed_id)\
            .group_by(User.user_id)\
            .order_by(db.func.count(Follower.follower_id).desc())\
            .limit(5).all()
        
        users_data = []
        for user in trending_users:
            user_data = user.to_dict()
            user_data['followers_count'] = len(user.followers)
            users_data.append(user_data)
            
        return jsonify(users_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/following', methods=['GET'])
@login_required
def get_following_users():
    try:
        current_user_id = session['user_id']
        
        # Get the current user
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        # Get users that the current user is following
        following_users = User.query.join(
            Follower, 
            User.user_id == Follower.followed_id
        ).filter(
            Follower.follower_id == current_user_id
        ).all()

        users_data = []
        for user in following_users:
            user_data = user.to_dict()
            user_data['followers_count'] = len(user.followers)
            users_data.append(user_data)

        return jsonify(users_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@users_bp.route('/users/<int:user_id>/posts', methods=['GET'])
def get_user_posts(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get all posts for the user, ordered by creation date (newest first)
        posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).all()
        
        posts_data = []
        for post in posts:
            post_data = post.to_dict()
            posts_data.append(post_data)

        return jsonify(posts_data)
    except Exception as e:
        print(f"Error in get_user_posts: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 500

@users_bp.route('/search', methods=['GET'])
def search():
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'users': [], 'posts': []})

        # Search users
        users = User.query.filter(
            or_(
                User.username.ilike(f'%{query}%'),
                User.email.ilike(f'%{query}%')
            )
        ).limit(5).all()

        # Search posts
        posts = Post.query.join(User).filter(
            or_(
                Post.content.ilike(f'%{query}%'),
                User.username.ilike(f'%{query}%')
            )
        ).limit(5).all()

        return jsonify({
            'users': [{
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'profilePicture': user.profile_picture
            } for user in users],
            'posts': [{
                'post_id': post.post_id,
                'content': post.content,
                'media_url': post.media_url,
                'created_at': post.created_at.isoformat() if post.created_at else None,
                'user_id': post.user_id,
                'user': {
                    'user_id': post.user.user_id,
                    'username': post.user.username,
                    'profilePicture': post.user.profile_picture
                }
            } for post in posts]
        })
    except Exception as e:
        print(f"Search error: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 500 