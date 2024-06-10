from flask import request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from app.models import User
import jwt
from datetime import datetime, timedelta

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'message': 'Username or email already exists'}), 400

    hashed_password = generate_password_hash(password, method='scrypt')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

    token = jwt.encode({'username': user.username, 'exp': datetime.utcnow() + timedelta(hours=1)}, app.config['SECRET_KEY'])
    print("Token: ",token)
    return jsonify({'message': 'Logged in successfully', 'access_token': token}), 200

@app.route('/api/user')
def get_user_data():
    token = request.headers.get('Authorization')
    print("Token:", token)
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    # Split the token by space and get the second part (the token itself)
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

@app.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200
