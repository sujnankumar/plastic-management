from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime,timezone
import pytz
from app import db, login_manager


def get_ist_time():
    """
    Get the current time in IST.
    """
    utc_time = datetime.now(pytz.utc)
    ist = pytz.timezone('Asia/Kolkata')
    ist_time = utc_time.astimezone(ist)
    return ist_time


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
    date_joined = db.Column(db.DateTime, default=get_ist_time)
    role = db.Column(db.String(50), default='user')

    def __repr__(self):
        return f'<User {self.username}>'

class UserRoleRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(50), nullable=False)
    business_contact = db.Column(db.String(15), nullable=False)
    business_address = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    date_requested = db.Column(db.DateTime, default=get_ist_time)

class Buyer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('buyers', lazy=True))

class Retailer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(50), nullable=False)
    business_contact = db.Column(db.String(15), nullable=False)
    business_address = db.Column(db.String(150), nullable=False)
    user = db.relationship('User', backref=db.backref('retailers', lazy=True))

class Manufacturer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(50), nullable=False)
    business_contact = db.Column(db.String(15), nullable=False)
    business_address = db.Column(db.String(150), nullable=False)
    user = db.relationship('User', backref=db.backref('manufacturers', lazy=True))

class Recycler(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(50), nullable=False)
    business_contact = db.Column(db.String(15), nullable=False)
    business_address = db.Column(db.String(150), nullable=False)
    user = db.relationship('User', backref=db.backref('recyclers', lazy=True))

class Plastic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    manufacturer_id = db.Column(db.Integer, db.ForeignKey('manufacturer.id'), nullable=False)
    recycler_id = db.Column(db.Integer, db.ForeignKey('recycler.id'), nullable=True)
    manufactured_date = db.Column(db.DateTime, default=get_ist_time, nullable=False)
    recycled_date = db.Column(db.DateTime, nullable=True)
    retailers = db.relationship('PlasticRetailer', backref='plastic', lazy='dynamic')
    status = db.Column(db.String(20), default="manufacturer", nullable=False)
    buyers = db.relationship('PlasticBuyer', backref='plastic', lazy='dynamic')
    type = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Integer, nullable=False)
    
class PlasticRetailer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plastic_id = db.Column(db.Integer, db.ForeignKey('plastic.id'), nullable=False)
    retailer_id = db.Column(db.Integer, db.ForeignKey('retailer.id'), nullable=False)

class PlasticBuyer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plastic_id = db.Column(db.Integer, db.ForeignKey('plastic.id'), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('buyer.id'), nullable=False)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    plastic_id = db.Column(db.Integer, db.ForeignKey('plastic.id'), nullable=True)
    manufacturer_id = db.Column(db.Integer, db.ForeignKey('manufacturer.id'), nullable=True)
    retailer_id = db.Column(db.Integer, db.ForeignKey('retailer.id'), nullable=True)
    recycler_id = db.Column(db.Integer, db.ForeignKey('recycler.id'), nullable=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('buyer.id'), nullable=True)
    log = db.Column(db.String(200), nullable=False)
    points = db.Column(db.Integer, default=0)
    date = db.Column(db.DateTime, default=get_ist_time, nullable=False)

class Points(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(50), unique=True, nullable=False)
    points_value = db.Column(db.Integer, nullable=False)

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(5000), nullable=False)
    date = db.Column(db.DateTime, default=get_ist_time)

class Rewards(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(5000), nullable=False)
    date = db.Column(db.DateTime, default=get_ist_time)
    image_url = db.Column(db.String(100), nullable=True)
    type = db.Column(db.Integer)

class RedeemedReward(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reward_title = db.Column(db.String(255), nullable=False)
    reward_points = db.Column(db.Integer, nullable=False)
    img = db.Column(db.String(500), default='https://c8.alamy.com/comp/2A012NB/reward-label-reward-red-band-sign-reward-2A012NB.jpg',nullable=False)
    redeemed_at = db.Column(db.DateTime, default=get_ist_time)
    

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
