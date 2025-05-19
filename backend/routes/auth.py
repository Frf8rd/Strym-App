from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from models.user import User
from models.admin_approval import AdminApproval
from functools import wraps
from sqlalchemy.exc import IntegrityError
import os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

def cleanup_expired_sessions():
    """Curăță sesiunile expirate din directorul flask_session"""
    session_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'flask_session')
    if not os.path.exists(session_dir):
        os.makedirs(session_dir)
        return
    
    current_time = datetime.now()
    for filename in os.listdir(session_dir):
        if filename.startswith('session_'):
            file_path = os.path.join(session_dir, filename)
            file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
            if current_time - file_time > timedelta(hours=1):
                try:
                    os.remove(file_path)
                except:
                    pass

# Decorator pentru verificarea autentificării și reînnoirea sesiunii
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Neautorizat'}), 401
        
        # Reînnoiește sesiunea la fiecare cerere
        session.permanent = True
        session.modified = True
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password, password):
        # Setează sesiunea ca permanentă la autentificare
        session.permanent = True
        session['user_id'] = user.user_id
        session['role'] = user.role
        
        # Curăță sesiunile expirate
        cleanup_expired_sessions()
        
        return jsonify({
            'message': 'Autentificare reușită!',
            'user': {
                'id': user.user_id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'profilePicture': user.profile_picture
            }
        }), 200
    
    return jsonify({'error': 'Email sau parolă incorectă!'}), 401

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Verifică dacă toate câmpurile necesare sunt prezente
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Câmpul {field} este obligatoriu!'}), 400
        
        # Verifică dacă emailul există deja
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Un utilizator cu acest email există deja!'}), 400
        
        # Verifică dacă emailul este aprobat pentru admin
        is_admin = False
        admin_approval = AdminApproval.query.filter_by(email=data['email']).first()
        if admin_approval:
            is_admin = True
        
        # Creează utilizatorul nou
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=generate_password_hash(data['password']),
            role='admin' if is_admin else 'user'
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Cont creat cu succes!',
            'user': {
                'id': new_user.user_id,
                'username': new_user.username,
                'email': new_user.email,
                'role': new_user.role
            }
        }), 201
        
    except IntegrityError as e:
        db.session.rollback()
        error_message = str(e)
        if "Duplicate entry" in error_message and "username" in error_message:
            return jsonify({'error': 'Acest nume de utilizator este deja folosit!'}), 400
        elif "Duplicate entry" in error_message and "email" in error_message:
            return jsonify({'error': 'Acest email este deja înregistrat!'}), 400
        else:
            return jsonify({'error': 'A apărut o eroare la înregistrare!'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'A apărut o eroare la înregistrare!'}), 500

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Deconectat cu succes!'}), 200

@auth_bp.route('/api/me', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'Utilizatorul nu a fost găsit!'}), 404
        
    return jsonify({
        'user': {
            'id': user.user_id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'profilePicture': user.profile_picture
        }
    }), 200 