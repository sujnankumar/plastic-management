from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime, timezone
from app import db, login_manager

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(10), nullable=False, unique=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    points = db.Column(db.Integer, default=0)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)
    contact_no = db.Column(db.String(15), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    address = db.Column(db.String(300), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    date_joined = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    role = db.Column(db.String(50), default='user')

    def __repr__(self):
        return f'<User {self.username}>'

class UserRoleRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    date_requested = db.Column(db.DateTime, default=datetime.now(timezone.utc))

class RoleToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(64), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False, nullable=False)

class Buyer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    buy_id = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', backref=db.backref('buyers', lazy=True))

class Retailer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sell_id = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', backref=db.backref('retailers', lazy=True))

class Manufacturer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    buy_id = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', backref=db.backref('manufacturers', lazy=True))

class Recycler(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sell_id = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', backref=db.backref('recyclers', lazy=True))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
