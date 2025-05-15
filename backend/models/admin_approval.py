from database import db
from datetime import datetime

class AdminApproval(db.Model):
    __tablename__ = 'admin_approvals'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    approved_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<AdminApproval {self.email}>' 