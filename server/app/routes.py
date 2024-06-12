from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from app.models import User, Buyer, Retailer, Manufacturer, Recycler, UserRoleRequest
import secrets
from datetime import datetime, timedelta, timezone
from dateutil import parser

app.config['JWT_SECRET_KEY'] = 'your_secret_key'
jwt = JWTManager(app)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstname')
    last_name = data.get('lastname')
    contact_no = data.get('contact')
    gender = data.get('gender')
    address = data.get('address')
    dob_str = data.get('dob')


    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'message': 'Username or email already exists'}), 400
    
    try:
        dob = parser.parse(dob_str).date()
    except (ValueError, TypeError):
        return jsonify({'message': 'Invalid date of birth format'}), 400

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

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    print(generate_password_hash(password, method='scrypt'), user.username)
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid username or password'}), 401

    token = create_access_token(identity=user.username)
    return jsonify({'message': 'Logged in successfully', 'access_token': token}), 200

@app.route('/api/user')
@jwt_required()
def get_user_data():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    print(user)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_data = {
        'username': user.username,
        'email': user.email,
        'points': user.points,
        'firstname': user.first_name,
        'lastname': user.last_name,
        'contact': user.contact_no,
        'gender': user.gender,
        'address': user.address,
        'dob': user.dob.strftime('%d-%m-%Y'),
        'date_joined': user.date_joined.strftime('%d-%m-%Y'),
        'role': user.role
    }

    return jsonify(user_data), 200

@app.route('/api/submit_business_info', methods=['POST'])
@jwt_required()
def request_role():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()

    print(data)
    try:
        new_request = UserRoleRequest(user_id=user.id, role=data.get('role'), business_name=data.get('business_name'), business_contact=data.get('contact_number'), business_address=data.get('address'))
        db.session.add(new_request)
        db.session.commit()
    except:
        return jsonify({'message: Data could not be submitted try again'}), 401
    
    return jsonify({'message': 'Role request submitted successfully'}), 201

from flask import jsonify

@app.route('/api/check_authentication', methods=['GET'])
@jwt_required()
def check_authentication():
    # Get the current user's identity from the JWT token
    current_user_username = get_jwt_identity()
    
    # If the JWT token is present and valid, the user is authenticated
    return jsonify({'is_authenticated': True, 'username': current_user_username}), 200

@app.route('/api/check_admin', methods=['GET'])
@jwt_required()
def check_admin():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    # Check if the user exists and if their role is 'admin'
    if user and user.role == 'admin':
        return jsonify({'is_admin': True}), 200
    else:
        return jsonify({'is_admin': False}), 403  # Forbidden

@app.route('/api/get_business_submissions', methods=['GET'])
@jwt_required()
def get_business_submissions():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if (user.role != 'admin'):
        return jsonify({'message': 'Unauthorized'}), 403

    submissions = UserRoleRequest.query.all()
    submission_data = [{'id': submission.id,
                        'user_id': submission.user_id,
                        'business_name': submission.business_name,
                        'business_contact': submission.business_contact,
                        'business_address': submission.business_address,
                        'role': submission.role} for submission in submissions]

    return jsonify(submission_data), 200

@app.route('/api/assign_role', methods=['POST'])
def assign_role():
    data = request.json
    role = data.get('role').lower()
    print(data)
    submission_id = data.get('submission_id')

    user_id = data.get('user_id')
    user = User.query.filter_by(id=user_id).first()
    submission = UserRoleRequest.query.get(submission_id)
    if not submission:
        return jsonify({'message': 'Submission not found'}), 404

    print(user)
    if role not in ['buyer', 'retailer', 'manufacturer', 'recycler']:
        return jsonify({'message': 'Invalid role'}), 400
    print(role)
    submission_model = None
    if role == 'buyer':
        submission_model = Buyer
    elif role == 'retailer':
        submission_model = Retailer
    elif role == 'manufacturer':
        submission_model = Manufacturer
    elif role == 'recycler':
        submission_model = Recycler
    print(submission, submission_model)

    user.role = role
    new_request = submission_model(     user_id = user_id,
                                        business_name = submission.business_name,
                                        business_contact = submission.business_contact,
                                        business_address = submission.business_address,
                                    )
    db.session.add(new_request)
    


    db.session.delete(submission)
    db.session.commit()

    return jsonify({'message': f'Role assigned successfully to {user.username}'}), 200

# @app.route('/api/plastic_items', methods=['POST'])
# def create_plastic_item():
#     data = request.get_json()
#     new_item = PlasticItem(name=data['name'], description=data['description'], collected_by=data['collected_by'])
#     db.session.add(new_item)
#     db.session.commit()
#     return jsonify({'message': 'Plastic item created'}), 201

@app.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200
