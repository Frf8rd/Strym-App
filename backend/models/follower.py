from database import db
from datetime import datetime

class Follower(db.Model):
    __tablename__ = 'followers'
    
    follower_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    follower = db.relationship('User', foreign_keys=[follower_id], backref='following')
    followed = db.relationship('User', foreign_keys=[followed_id], backref='followers')
    
    def __repr__(self):
        return f'<Follower {self.follower_id} -> {self.followed_id}>' 