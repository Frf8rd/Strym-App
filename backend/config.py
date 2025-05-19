import os
from dotenv import load_dotenv
import socket

load_dotenv()

def get_local_ips():
    """Get all local network IPs"""
    hostname = socket.gethostname()
    local_ips = []
    
    # Add localhost
    local_ips.extend([
        "http://localhost:*",
        "http://127.0.0.1:*"
    ])
    
    # Get all network interfaces
    try:
        # Get all IPs associated with the hostname
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith("127."):  # Exclude localhost
                local_ips.append(f"http://{ip}:*")
    except:
        pass
    
    return local_ips

class Config:
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # Session configuration
    SESSION_TYPE = 'filesystem'
    SESSION_FILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flask_session')
    PERMANENT_SESSION_LIFETIME = 1800  # 30 minute
    SESSION_COOKIE_SECURE = False  # Set to False for development
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # CORS configuration
    CORS_ORIGINS = get_local_ips() + [
        # Production URLs (adaptează acestea pentru producție)
        # "https://your-production-domain.com"
    ]
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_ALLOW_HEADERS = ["Content-Type", "Authorization", "Accept"]
    CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization", "Accept"]
    CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    
    # Upload folder configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size 