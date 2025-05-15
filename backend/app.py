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

# Configure CORS
CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:5173"],  
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

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
    app.run(debug=True)
