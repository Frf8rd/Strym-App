from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Database configuration
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', '127.127.126.26')
DB_NAME = os.getenv('DB_NAME', 'strym_db')

# Create SQLAlchemy instance
db = SQLAlchemy()

def test_connection():
    """Test the database connection and return True if successful"""
    try:
        engine = create_engine(f'mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}')
        # Try to connect to the database
        with engine.connect() as connection:
            print(" Conexiunea la baza de date a reușit!")
            return True
    except Exception as e:
        print(f" Eroare la conectarea la baza de date: {str(e)}")
        return False

def init_db(app):
    """Initialize the database connection"""
    # Configure MySQL connection
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize the database
    db.init_app(app)
    
    # Test connection before creating tables
    if not test_connection():
        raise Exception("Nu s-a putut conecta la baza de date!")
    
    # Create all tables
    with app.app_context():
        db.create_all()

def get_db_session():
    """Get a new database session"""
    engine = create_engine(f'mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}')
    Session = sessionmaker(bind=engine)
    return Session()
