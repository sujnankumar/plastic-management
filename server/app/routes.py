from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from app.models import User, UserRoleRequest, RoleToken, PlasticItem
import jwt
from datetime import datetime, timedelta, timezone
import secrets

bp = Blueprint('api', __name__, url_prefix='/api')

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    contact_no = data.get('contact_no')
    gender = data.get('gender')
    address = data.get('address')
    dob = data.get('dob')

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'message': 'Username or email already exists'}), 400
    
    hashed_password = generate_password_hash(password, method='scrypt')
    
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        contact_no=contact_no,
        gender=gender,
        address=address,
        dob=dob
    )
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

    token = jwt.encode({'username': user.username, 'exp': datetime.now(timezone.utc) + timedelta(hours=1)}, app.config['SECRET_KEY'])
    print("Token: ",token)
    return jsonify({'message': 'Logged in successfully', 'access_token': token}), 200

@app.route('/user')
def get_user_data():
    token = request.headers.get('Authorization')
    print("Token:", token)
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    token_parts = token.split()
    if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
        return jsonify({'message': 'Invalid token format'}), 401

    token = token_parts[1]

    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        username = decoded_token['username']

        user = User.query.filter_by(username=username).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        return jsonify({'username': user.username, 'email': user.email}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

@app.route('/request_role', methods=['POST'])
@login_required
def request_role():
    data = request.get_json()
    role = data.get('role').lower()

    if role not in ['manufacturer', 'recycler', 'buyer', 'retailer']:
        return jsonify({'message': 'Invalid role'}), 400

    new_request = UserRoleRequest(user_id=current_user.id, role=role)
    db.session.add(new_request)
    db.session.commit()
    return jsonify({'message': 'Role request submitted successfully'}), 201

@app.route('/generate_role_token', methods=['POST'])
@login_required
def generate_role_token():
    if not current_user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    user_id = data.get('user_id')
    role = data.get('role').lower()

    if role not in ['manufacturer', 'recycler', 'buyer', 'retailer']:
        return jsonify({'message': 'Invalid role'}), 400

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=2)
    role_token = RoleToken(token=token, user_id=user_id, role=role, expires_at=expires_at)
    db.session.add(role_token)
    db.session.commit()

    return jsonify({'token': token, 'expires_at': expires_at}), 201

@app.route('/validate_role_token', methods=['POST'])
@login_required
def validate_role_token():
    data = request.get_json()
    token = data.get('token')

    role_token = RoleToken.query.filter_by(token=token, user_id=current_user.id, is_used=False).first()
    if not role_token or role_token.expires_at < datetime.now(timezone.utc):
        return jsonify({'message': 'Invalid or expired token'}), 400

    current_user.role = role_token.role
    role_token.is_used = True
    db.session.commit()

    return jsonify({'message': f'User role updated to {role_token.role}'}), 200

@bp.route('/plastic_items', methods=['POST'])
@jwt_required()
def create_plastic_item():
    data = request.get_json()
    new_item = PlasticItem(name=data['name'], description=data['description'], collected_by=data['collected_by'])
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'message': 'Plastic item created'}), 201

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200
