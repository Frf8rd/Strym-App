from flask import Flask, send_from_directory
from flask_session import Session
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from database import db, init_db
import os

app = Flask(__name__, 
           template_folder="../frontend/templates",
           static_folder="../frontend/static")

# Load configuration
app.config.from_object(Config)

# Create flask_session directory if it doesn't exist
if not os.path.exists(app.config['SESSION_FILE_DIR']):
    os.makedirs(app.config['SESSION_FILE_DIR'])

# Debug information
print(f"Session directory: {app.config['SESSION_FILE_DIR']}")
print(f"Session directory exists: {os.path.exists(app.config['SESSION_FILE_DIR'])}")

# Configure CORS based on environment
if app.debug:  # Development mode
    CORS(app, 
         resources={r"/*": {
             "origins": ["http://localhost:*", "http://127.0.0.1:*"],
             "supports_credentials": True,
             "allow_headers": ["Content-Type", "Authorization", "Accept"],
             "expose_headers": ["Content-Type", "Authorization", "Accept"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }})
else:  # Production mode
    CORS(app, 
         resources={r"/*": {
             "origins": app.config['CORS_ORIGINS'],
             "supports_credentials": True,
             "allow_headers": app.config['CORS_ALLOW_HEADERS'],
             "expose_headers": app.config['CORS_EXPOSE_HEADERS'],
             "methods": app.config['CORS_METHODS']
         }})

# Initialize database
init_db(app)

# Initialize session
Session(app)

# Create upload folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Route for serving uploaded files
@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Register blueprints
app.register_blueprint(auth_bp)

# Debug information
print(f"Current directory: {os.getcwd()}")
print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
print(f"Upload folder exists: {os.path.exists(app.config['UPLOAD_FOLDER'])}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
