from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from models.user import User
from models.admin_approval import AdminApproval
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# Decorator pentru verificarea autentificării
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Neautorizat'}), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.user_id
        session['role'] = user.role
        
        return jsonify({
            'message': 'Autentificare reușită!',
            'user': {
                'id': user.user_id,
                'username': user.username,
                'email': user.email,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'role': user.role,
                'profilePicture': user.profile_picture
            }
        }), 200
    
    return jsonify({'error': 'Email sau parolă incorectă!'}), 401

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Verifică dacă toate câmpurile necesare sunt prezente
    required_fields = ['username', 'email', 'password', 'firstName', 'lastName']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Câmpul {field} este obligatoriu!'}), 400
    
    # Verifică dacă utilizatorul există deja
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Acest email este deja înregistrat!'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Acest nume de utilizator este deja luat!'}), 400
    
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
        first_name=data['firstName'],
        last_name=data['lastName'],
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
            'firstName': new_user.first_name,
            'lastName': new_user.last_name,
            'role': new_user.role
        }
    }), 201

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
            'firstName': user.first_name,
            'lastName': user.last_name,
            'role': user.role,
            'profilePicture': user.profile_picture
        }
    }), 200 