from flask import Blueprint, jsonify, session, request
from models.user import User
from database import db
from functools import wraps
import os
from config import Config

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.role != 'admin':
            return jsonify({'error': 'Forbidden'}), 403
            
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/api/admin/users', methods=['GET'])
@admin_required
def get_users():
    try:
        users = User.query.all()
        return jsonify([{
            'id': user.user_id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'profilePicture': user.profile_picture,
            'createdAt': user.created_at.isoformat() if user.created_at else None
        } for user in users])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['user', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Prevent admin from changing their own role
        if user.user_id == session['user_id']:
            return jsonify({'error': 'Cannot change your own role'}), 400
            
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': 'User role updated successfully',
            'user': {
                'id': user.user_id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Prevent admin from deleting themselves
        if user.user_id == session['user_id']:
            return jsonify({'error': 'Cannot delete your own account'}), 403
            
        # Delete user's profile picture if exists
        if user.profile_picture and user.profile_picture != 'default.jpg':
            try:
                os.remove(os.path.join(Config.UPLOAD_FOLDER, user.profile_picture))
            except:
                pass  # Ignore if file doesn't exist
                
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 