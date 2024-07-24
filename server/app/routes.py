from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import func
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from app.models import User, Buyer, Retailer, Manufacturer, Recycler, UserRoleRequest, Plastic, PlasticRetailer, PlasticBuyer, Transaction, Points
from datetime import datetime, timezone
from dateutil import parser
import qrcode
import qrcode
import io
import pytz


app.config['JWT_SECRET_KEY'] = 'your_secret_key'
jwt = JWTManager(app)

def get_ist_time():
    """
    Get the current time in IST.
    """
    utc_time = datetime.now(pytz.utc)
    ist = pytz.timezone('Asia/Kolkata')
    ist_time = utc_time.astimezone(ist)
    return ist_time

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
    user = User.query.filter_by(username=username).first()

    new_buyer = Buyer(user_id = user.id, user=user)
    db.session.add(new_buyer)
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

    token = create_access_token(identity=user.username)
    return jsonify({'message': 'Logged in successfully', 'access_token': token}), 200

@app.route('/api/user')
@jwt_required()
def get_user_data():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'points': user.points,
        'firstname': user.first_name,
        'lastname': user.last_name,
        'contact': user.contact_no,
        'gender': user.gender,
        'address': user.address,
        'dob': user.dob.strftime('%d-%m-%Y'),
        'points': user.points,
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
    current_user_username = get_jwt_identity()
    return jsonify({'is_authenticated': True, 'username': current_user_username}), 200

@app.route('/api/check_admin', methods=['GET'])
@jwt_required()
def check_admin():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    if user and user.role == 'admin':
        return jsonify({'is_admin': True}), 200
    else:
        return jsonify({'is_admin': False}), 403

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
                        'user_name': User.query.get(submission.user_id).first_name + ' ' + User.query.get(submission.user_id).last_name,
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
    submission_id = data.get('submission_id')

    user_id = data.get('user_id')
    user = User.query.filter_by(id=user_id).first()
    submission = UserRoleRequest.query.get(submission_id)
    if not submission:
        return jsonify({'message': 'Submission not found'}), 404

    if role not in ['buyer', 'retailer', 'manufacturer', 'recycler']:
        return jsonify({'message': 'Invalid role'}), 400

    submission_model = None
    if role == 'buyer':
        submission_model = Buyer
    elif role == 'retailer':
        submission_model = Retailer
    elif role == 'manufacturer':
        submission_model = Manufacturer
    elif role == 'recycler':
        submission_model = Recycler

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

@app.route('/api/rewards/redeem', methods=['POST'])
def redeem_reward():
    data = request.json
    user_id = data.get('user_id')
    reward_title = data.get('reward_title')
    reward_points = data.get('reward_points')
    reward_image = data.get('reward_image')

    user = User.query.get(user_id)
    
    if user and user.points >= reward_points:
        # Create a redeemed reward record
        redeemed_reward = RedeemedReward(
            user_id=user_id,
            reward_title=reward_title,
            reward_points=reward_points,
            img=reward_image
        )
        
        db.session.add(redeemed_reward)
        db.session.commit()

        return jsonify({"message": "Reward redeemed successfully!"}), 200
    else:
        return jsonify({"message": "Insufficient points or user not found!"}), 400


@app.route('/api/buyers', methods=['GET'])
@jwt_required()
def get_buyers():
    # Query and serialize buyer data
    buyers = Buyer.query.all()
    buyer_data = [{'id': buyer.id, 'username': buyer.user.username, 'email': buyer.user.email} for buyer in buyers]
    return jsonify(buyer_data), 200

@app.route('/api/retailers', methods=['GET'])
@jwt_required()
def get_retailers():
    # Query and serialize retailer data
    retailers = Retailer.query.all()
    retailer_data = [{'id': retailer.id, 'business_name': retailer.business_name, 'business_contact': retailer.business_contact, 'business_address': retailer.business_address} for retailer in retailers]
    return jsonify(retailer_data), 200

@app.route('/api/manufacturers', methods=['GET'])
@jwt_required()
def get_manufacturers():
    # Query and serialize manufacturer data
    manufacturers = Manufacturer.query.all()
    manufacturer_data = [{'id': manufacturer.id, 'business_name': manufacturer.business_name, 'business_contact': manufacturer.business_contact, 'business_address': manufacturer.business_address} for manufacturer in manufacturers]
    return jsonify(manufacturer_data), 200

@app.route('/api/recyclers', methods=['GET'])
@jwt_required()
def get_recyclers():
    # Query and serialize recycler data
    recyclers = Recycler.query.all()
    recycler_data = [{'id': recycler.id, 'business_name': recycler.business_name, 'business_contact': recycler.business_contact, 'business_address': recycler.business_address} for recycler in recyclers]
    return jsonify(recycler_data), 200

@app.route('/api/get_manufacturer/<int:user_id>', methods=['GET'])
@jwt_required()
def get_manufacturer(user_id):
    try:
        manufacturer = Manufacturer.query.filter_by(user_id=user_id).first()
        if not manufacturer:
            return jsonify({'error': 'Manufacturer not found'}), 404

        return jsonify({
            'id': manufacturer.id,
            'user_id': manufacturer.user_id,
            'business_name': manufacturer.business_name,
            'business_contact': manufacturer.business_contact,
            'business_address': manufacturer.business_address
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/create_plastic', methods=['POST'])
@jwt_required()
def create_plastic():
    try:
        # Get JSON data from the request
        data = request.get_json()
        
        # Get the current user's identity
        current_user_username = get_jwt_identity()
        
        # Retrieve the user and their associated manufacturer
        user = User.query.filter_by(username=current_user_username).first()
        manufacturer = Manufacturer.query.filter_by(user_id=user.id).first()

        # Ensure the manufacturer exists
        if not manufacturer:
            return jsonify({'error': 'Manufacturer not found'}), 404

        manufacturer_id = manufacturer.id

        # Get plastic details from the request data
        plastic_type = data.get('type')
        cost = data.get('cost')
        quantity = data.get('quantity', 1)

        # Ensure valid manufacturer ID is provided
        if not manufacturer_id:
            return jsonify({'error': 'Manufacturer ID is required'}), 400

        # Retrieve the points awarded for creating a plastic
        points_action = Points.query.filter_by(transaction_type='create').first()
        points_awarded = points_action.points_value if points_action else 0

        # Double points for plastic type 2
        if str(plastic_type) == '2':
            points_awarded *= 2

        # List to keep track of new plastics created
        new_plastics = []

        # Create the specified quantity of plastics
        for _ in range(quantity):
            new_plastic = Plastic(
                manufacturer_id=manufacturer_id,
                type=plastic_type,
                cost=cost
            )
            db.session.add(new_plastic)
            new_plastics.append(new_plastic)

        # Commit the session after adding all new plastics
        db.session.commit()

        # Update the user's points
        user.points += points_awarded * quantity
        db.session.commit()

        # Create transaction logs for each new plastic
        for plastic in new_plastics:
            new_transaction = Transaction(
                user_id=user.id,
                plastic_id=plastic.id,
                manufacturer_id=manufacturer_id,
                log=f'Created new Plastic (ID: {plastic.id}) - Type: {plastic_type}',
                points=points_awarded
            )
            db.session.add(new_transaction)

        # Commit the session after adding all transactions
        db.session.commit()

        # Return success message
        return jsonify({'message': f'Successfully added {quantity} plastic(s).'}), 201

    except Exception as e:
        # Rollback the session in case of error
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/manufacturer_plastics/<int:manufacturer_id>', methods=['GET'])
@jwt_required()
def manufacturer_plastics(manufacturer_id):
    try:
        # Fetch manufacturer and ensure it exists
        manufacturer = Manufacturer.query.get(manufacturer_id)
        if not manufacturer:
            return jsonify({'error': 'Manufacturer not found'}), 404
        
        # Query for plastics produced by the manufacturer
        query = Plastic.query.filter_by(manufacturer_id=manufacturer.id, status="manufacturer")
        plastics = query.order_by(Plastic.id).all()
        
        # Prepare plastics data
        plastics_data = [
            {
                'id': plastic.id,
                'manufactured_date': plastic.manufactured_date.isoformat(),
                'type': plastic.type,
                'cost': plastic.cost
            }
            for plastic in plastics
        ]

        # Count the number of each type of plastic
        count_type1 = sum(1 for plastic in plastics if plastic.type == 1)
        count_type2 = sum(1 for plastic in plastics if plastic.type == 2)

        # Prepare JSON response
        plastics_json = {
            'count_data': [
                {'id': 1, 'name': 'Type 1', 'count': count_type1},
                {'id': 2, 'name': 'Type 2', 'count': count_type2}
            ],
            'plastics_data': plastics_data
        }

        print(plastics_json)  # Consider using logging instead of print for production code
        return jsonify(plastics_json), 200

    except Exception as e:
        # Provide a more descriptive error message in case of failure
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/get_plastic_details', methods=['GET'])
@jwt_required()
def get_plastic_details():
    data = request.get_json()
    plastic_id = data.get('plasticId')
    try:
        plastic = Plastic.query.get(plastic_id)
        plastic_data = {'id': plastic.id, 'manufactured_date': plastic.manufactured_date.strftime('%d-%m-%Y'), 'manufacturer_name': Manufacturer.query.get(plastic.manufacturer_id), "retailers": [retailer.retailer_id for retailer in plastic.retailers], "buyers": [buyer.buyer_id for buyer in plastic.buyers]}
        return jsonify(plastic_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_retailer_id', methods=['GET'])
@jwt_required()
def get_retailer_id():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    retailer = Retailer.query.filter_by(user_id=user.id).first()
    if not retailer:
        return jsonify({"message": "Retailer not found"}), 404
    return jsonify({"retailer_id": retailer.id}), 200

@app.route('/api/get_plastic_inventory', methods=['GET'])
@jwt_required()
def get_plastic_inventory():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    retailer = Retailer.query.filter_by(user_id=user.id).first()
    retailer_id = retailer.id
    if not retailer_id:
        return jsonify({"message": "Retailer ID is required"}), 400

    try:
        # Retrieve all plastics from the retailer
        inventory = PlasticRetailer.query.filter_by(retailer_id=retailer_id).all()

        # Extract plastic IDs
        plastic_ids = [item.plastic_id for item in inventory]

        # Query plastics with statuses 'used' or 'retailer'
        plastics = Plastic.query.filter(
            Plastic.id.in_(plastic_ids),
            Plastic.status.in_(['used', 'retailer'])
        ).all()

        # Build response
        response = [
            {
                'id': plastic.id,
                'plastic_id': plastic.id,
                'status': plastic.status
            }
            for plastic in plastics
        ]

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/sell_plastic', methods=['POST'])
@jwt_required()
def sell_plastic():
    data = request.get_json()

    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    user_id = user.id

    plastic_id = data.get('plastic_id')
    retailer_id = data.get('retailer_id')
   
    if not plastic_id or not retailer_id:
        return jsonify({"message": "Plastic ID and User ID are required"}), 400

    try:
        plastic = Plastic.query.get(plastic_id)
        
        if not plastic:
            return jsonify({"message": "Plastic not found"}), 404
        
        db.session.commit()

        points_action = Points.query.filter_by(transaction_type='buyer_to_retailer').first()
        points_awarded = points_action.points_value if points_action else 0

        print(user, plastic_id, points_awarded)

        buy_transaction_records = Transaction(
                user_id=user_id,
                plastic_id=plastic_id,
                retailer_id=retailer_id,
                buyer_id=user_id,
                log='Plastic with ID ' + str(plastic_id) + ' - Type: ' + str(1) + ' transferred to retailer (ID: ' +str(retailer_id)+')',
                points=points_awarded
            )
            
        ret_transaction_records = Transaction(
            user_id=retailer_id,
            plastic_id=plastic_id,
            retailer_id=retailer_id,
            buyer_id=user_id,
            log='Plastic with ID ' + str(plastic_id) + ' - Type: ' + str(1) + ' received from buyer (ID: ' +str(user.id)+')',
            points=points_awarded
        )

        plastic_retailer = PlasticRetailer(plastic_id=plastic_id, retailer_id=retailer_id)

        user.points += points_awarded
        
        # Add to plastic buyer table
        plastic.status = "used"
        db.session.add(plastic_retailer)
        db.session.commit()
        db.session.add(buy_transaction_records)
        db.session.commit()
        db.session.add(ret_transaction_records)
        db.session.commit()

        return jsonify({"message": "Plastic sold successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

# @app.route('/api/transfer_plastic/<int:plastic_id>/to_retailer/<int:retailer_id>', methods=['POST'])
# @jwt_required()
# def transfer_plastic_to_retailer(plastic_id, retailer_id):
#     try:
#         plastic = Plastic.query.get_or_404(plastic_id)
#         retailer = Retailer.query.get_or_404(retailer_id)
#         current_user_username = get_jwt_identity()
#         user = User.query.filter_by(username=current_user_username).first()

#         # Update plastic status
#         plastic.status = 'retailer'
#         db.session.commit()

#         # Add to PlasticRetailer table
#         plastic_retailer = PlasticRetailer(
#             plastic_id=plastic.id,
#             retailer_id=retailer.id
#         )
#         db.session.add(plastic_retailer)
#         db.session.commit()

#         # Points for manufacturer to retailer
#         points_action = Points.query.filter_by(transaction_type='manufacturer_to_retailer').first()
#         points_awarded = points_action.points_value if points_action else 0

#         # Create a transaction record
#         new_transaction = Transaction(
#             user_id=user.id,
#             plastic_id=plastic.id,
#             retailer_id=retailer.id,
#             log='Plastic transferred to retailer',
#             points=points_awarded
#         )
#         db.session.add(new_transaction)
#         db.session.commit()

#         return jsonify({
#             'message': 'Plastic transferred successfully',
#             'points_awarded': points_awarded
#         }), 200

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': str(e)}), 500


@app.route('/api/transfer_plastic/to_retailer', methods=['POST'])
@jwt_required()
def transfer_plastic_to_retailer():
    data = request.get_json()
    type1_quantity = data.get('type1_quantity', 0)
    type2_quantity = data.get('type2_quantity', 0)
    retailer_id = data.get('retailer_id')

    if not retailer_id:
        return jsonify({'error': 'Retailer ID is required.'}), 400

    try:
        # Fetch necessary objects
        retailer = Retailer.query.get_or_404(retailer_id)
        ret_user = User.query.get_or_404(retailer.user_id)
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()
        manufacturer = Manufacturer.query.filter_by(user_id=user.id).first()

        # Fetch point values
        ret_points_action = Points.query.filter_by(transaction_type='manufacturer_to_retailer').first()
        ret_points_action = Points.query.filter_by(transaction_type='retailer_from_manufacturer').first()
        man_points_awarded = ret_points_action.points_value if ret_points_action else 0
        ret_points_awarded = ret_points_action.points_value if ret_points_action else 0

        man_total_points_awarded = 0
        ret_total_points_awarded = 0
        transaction_records = []
        man_transaction_records = []
        plastic_retailer_records = []

        # Handle Type 1 plastics
        if type1_quantity > 0:
            type1_plastics = Plastic.query.filter_by(manufacturer_id=manufacturer.id, type=1, status='manufacturer').limit(type1_quantity).all()
            if len(type1_plastics) < type1_quantity:
                return jsonify({'error': f'Not enough Type 1 plastics available. Requested: {type1_quantity}, Available: {len(type1_plastics)}'}), 400

            for plastic in type1_plastics:
                plastic.status = 'retailer'
                plastic_retailer_records.append(PlasticRetailer(plastic_id=plastic.id, retailer_id=retailer.id))
                man_transaction_records.append(Transaction(
                    user_id=user.id,
                    plastic_id=plastic.id,
                    retailer_id=retailer.id,
                    log=f'Plastic with ID {plastic.id} - Type: 1 transferred to retailer (ID: {retailer_id})',
                    points=man_points_awarded
                ))
                transaction_records.append(Transaction(
                    user_id=ret_user.id,
                    plastic_id=plastic.id,
                    retailer_id=retailer_id,
                    log=f'Plastic with ID {plastic.id} - Type: 1 received from manufacturer (ID: {user.id})',
                    points=ret_points_awarded
                ))
                man_total_points_awarded += man_points_awarded
                ret_total_points_awarded += ret_points_awarded

        # Handle Type 2 plastics
        if type2_quantity > 0:
            type2_plastics = Plastic.query.filter_by(manufacturer_id=manufacturer.id, type=2, status='manufacturer').limit(type2_quantity).all()
            if len(type2_plastics) < type2_quantity:
                return jsonify({'error': f'Not enough Type 2 plastics available. Requested: {type2_quantity}, Available: {len(type2_plastics)}'}), 400

            for plastic in type2_plastics:
                plastic.status = 'retailer'
                plastic_retailer_records.append(PlasticRetailer(plastic_id=plastic.id, retailer_id=retailer.id))
                man_transaction_records.append(Transaction(
                    user_id=user.id,
                    plastic_id=plastic.id,
                    retailer_id=retailer.id,
                    log=f'Plastic with ID {plastic.id} - Type: 2 transferred to retailer (ID: {retailer_id})',
                    points=man_points_awarded
                ))
                transaction_records.append(Transaction(
                    user_id=ret_user.id,
                    plastic_id=plastic.id,
                    retailer_id=retailer_id,
                    log=f'Plastic with ID {plastic.id} - Type: 2 received from manufacturer (ID: {user.id})',
                    points=ret_points_awarded
                ))
                man_total_points_awarded += man_points_awarded
                ret_total_points_awarded += ret_points_awarded

        # Award points to users
        user.points += man_total_points_awarded
        ret_user.points += ret_total_points_awarded

        # Commit all changes in a single transaction
        db.session.add_all(plastic_retailer_records)
        db.session.add_all(man_transaction_records)
        db.session.add_all(transaction_records)
        db.session.commit()

        return jsonify({
            'message': f'Plastics transferred successfully. Total points awarded: {man_total_points_awarded}',
            'points_awarded': man_total_points_awarded
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/transfer_plastic/<int:plastic_id>/to_buyer/<int:buyer_id>', methods=['POST'])
@jwt_required()
def transfer_plastic_to_buyer(plastic_id, buyer_id):
    try:
        plastic = Plastic.query.get_or_404(plastic_id)
        buyer = Buyer.query.get_or_404(buyer_id)
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()

        # Update plastic status
        plastic.status = 'buyer'
        db.session.commit()

        # Points for retailer to buyer
        points_action = Points.query.filter_by(transaction_type='retailer_to_buyer').first()
        points_awarded = points_action.points_value if points_action else 0

        # Create a transaction record
        new_transaction = Transaction(
            user_id=user.id,
            plastic_id=plastic.id,
            retailer_id=Retailer.query.filter_by(user_id=user.id).first().id,
            log='Plastic sold to buyer',
            points=points_awarded
        )
        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            'message': 'Plastic sold successfully',
            'points_awarded': points_awarded
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/return_plastic/<int:plastic_id>/from_buyer/<int:buyer_id>', methods=['POST'])
@jwt_required()
def return_plastic_from_buyer(plastic_id, buyer_id):
    try:
        plastic = Plastic.query.get_or_404(plastic_id)
        buyer = Buyer.query.get_or_404(buyer_id)
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()

        # Update plastic status
        plastic.status = 'retailer'
        db.session.commit()

        # Points for buyer to retailer
        points_action = Points.query.filter_by(transaction_type='buyer_to_retailer').first()
        points_awarded = points_action.points_value if points_action else 0

        # Create a transaction record
        new_transaction = Transaction(
            user_id=user.id,
            plastic_id=plastic.id,
            retailer_id=Retailer.query.filter_by(user_id=user.id).first().id,
            log='Plastic returned from buyer',
            points=points_awarded
        )
        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            'message': 'Plastic returned successfully',
            'points_awarded': points_awarded
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_manufacturer_id', methods=['GET'])
@jwt_required()
def get_manufacturer_id():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    manufacturer = Manufacturer.query.filter_by(user_id=user.id).first()
    return jsonify({'manufacturer_id': manufacturer.id})

@app.route('/api/retailer_inventory/<int:retailer_id>', methods=['GET'])
@jwt_required()
def retailer_inventory(retailer_id):
    try:
        retailer = Retailer.query.get_or_404(retailer_id)

        inventory = PlasticRetailer.query.filter_by(retailer_id=retailer.id).all()

        inventory_data = [{
            'id': item.id,
            'plastic_id': item.plastic_id,
            'manufactured_date': item.plastic.manufactured_date.isoformat(),
            'status': item.plastic.status
        } for item in inventory]
        
        return jsonify(inventory_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    transactions = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.date.desc()).all()
    return jsonify([{
        'log': tx.log,
        'points': tx.points,
        'date': tx.date.strftime('%Y-%m-%d %H:%M:%S')
    } for tx in transactions])

@app.route('/api/redeemed_rewards', methods=['GET'])
@jwt_required()
def get_redeemed_rewards():
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    redeemed_rewards = RedeemedReward.query.filter_by(user_id=user.id).order_by(RedeemedReward.redeemed_at.desc()).all()
    return jsonify([{
        'reward_title': rr.reward_title,
        'reward_points': rr.reward_points,
        'redeemed_at': rr.redeemed_at.strftime('%Y-%m-%d %H:%M:%S'),
        'reward_image': rr.img
    } for rr in redeemed_rewards])

@app.route('/api/plastics/for_retailer/<int:retailer_id>', methods=['GET'])
@jwt_required()
def get_plastics_for_retailer(retailer_id):
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    # Retrieve optional query parameter for plastic type
    plastic_type = request.args.get('plastic_type', type=int)
    
    query = Plastic.query.join(PlasticRetailer).filter(
        PlasticRetailer.retailer_id == retailer_id,
        Plastic.status == 'retailer'
    )
    
    # Apply plastic type filter if provided
    if plastic_type is not None:
        query = query.filter(Plastic.type == plastic_type)
    
    plastics = query.all()
    
    return jsonify([{
        'id': p.id,
        'manufactured_date': p.manufactured_date.strftime('%Y-%m-%d %H:%M:%S'),
        'type': p.type,  # Include type in the response
        'cost': p.cost   # Include cost in the response
    } for p in plastics])

@app.route('/api/buy_plastic', methods=['POST'])
@jwt_required()
def buy_plastic():
    data = request.get_json()
    retailer_id = data.get('retailer_id')
    quantities = data.get('quantities', {})  # Expect quantities to be a dictionary with type as keys
    
    print(retailer_id, quantities)
    if not retailer_id or not isinstance(quantities, dict):
        return jsonify({'error': 'Invalid data provided.'}), 400

    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    total_points_awarded = 0

    for plastic_type, quantity in quantities.items():
        if quantity <= 0:
            continue
        
        plastics = Plastic.query.filter_by(type=plastic_type, status='retailer').limit(quantity).all()

        if len(plastics) < quantity:
            return jsonify({'error': f'Not enough type {plastic_type} plastics available.'}), 400

        for plastic in plastics:
            plastic.status = 'buyer'
            points = Points.query.filter_by(transaction_type='retailer_to_buyer').first()
            points_awarded = points.points_value if points else 0

            buy_new_transaction = Transaction(
                user_id=user.id,
                plastic_id=plastic.id,
                retailer_id=retailer_id,
                log=f'Plastic (ID: {plastic.id}) bought from Retailer (ID: {retailer_id})',
                points=points_awarded
            )
            ret_new_transaction = Transaction(
                user_id=retailer_id,
                plastic_id=plastic.id,
                retailer_id=retailer_id,
                log=f'Plastic (ID: {plastic.id}) sold to Buyer (ID: {user.id})',
                points=points_awarded
            )
            db.session.add(buy_new_transaction)
            db.session.add(ret_new_transaction)
            db.session.add(PlasticBuyer(plastic_id=plastic.id, buyer_id=user.id))
            total_points_awarded += points_awarded

            user.points += total_points_awarded

    db.session.commit()

    return jsonify({
        'message': 'Plastics purchased successfully.',
        'points_awarded': total_points_awarded
    }), 200

@app.route('/api/generate_qr/<int:retailer_id>', methods=['GET'])
@jwt_required()
def generate_qr_code(retailer_id):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(f'retailer:{retailer_id}')
    qr.make(fit=True)
    
    img = qr.make_image(fill='black', back_color='white')

    img_bytes = io.BytesIO()
    img.save(img_bytes)
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype='image/png', as_attachment=False, download_name='retailer_qr_code.png')

@app.route('/api/get_user_plastics', methods=['GET'])
@jwt_required()
def get_user_plastics():
    # Subquery to get the latest PlasticBuyer record for each plastic
    subquery = db.session.query(
        PlasticBuyer.plastic_id,
        func.max(PlasticBuyer.id).label('max_id')
    ).group_by(PlasticBuyer.plastic_id).subquery()

    # Join Plastic with the latest PlasticBuyer record
    query = db.session.query(
        Plastic,
        PlasticBuyer
    ).outerjoin(
        subquery,
        Plastic.id == subquery.c.plastic_id
    ).outerjoin(
        PlasticBuyer,
        (PlasticBuyer.plastic_id == subquery.c.plastic_id) & (PlasticBuyer.id == subquery.c.max_id)
    ).filter(
        Plastic.status == 'buyer'
    ).all()

    results = []
    for plastic, plastic_buyer in query:
        results.append({
            'id': plastic.id,
            'manufacturer_id': plastic.manufacturer_id,
            'recycler_id': plastic.recycler_id,
            'manufactured_date': plastic.manufactured_date.isoformat(),
            'status': plastic.status,
            'type': plastic.type,
            'cost': plastic.cost,
            'latest_buyer_id': plastic_buyer.buyer_id if plastic_buyer else None
        })

    return jsonify(results)

@app.route('/api/points/<int:user_id>', methods=['PUT'])
def update_user_points(user_id):
    data = request.json
    points = data.get('points')

    if points < 0:
        return jsonify({'message': 'Points value is required'}), 400

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    try:
        user.points = points
        db.session.commit()
        return jsonify({'message': f'User points updated successfully to {points}'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update points: {str(e)}'}), 500
    
@app.route('/api/get_recycler/<int:user_id>', methods=['GET'])
@jwt_required()
def recycler_inventory(user_id):
    try:
        recycler = Recycler.query.filter_by(user_id=user_id).first()
        if not recycler:
            return jsonify({'error': 'recycler not found'}), 404

        print(recycler.business_name)
        return jsonify({
            'id': recycler.id,
            'recycler_id': recycler.id,
            'business_name': recycler.business_name,
            'business_contact': recycler.business_contact,
            'business_address': recycler.business_address
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/recycle_plastic', methods=['POST'])
@jwt_required()
def recycle_plastic():
    try:
        data = request.get_json()        
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()
        recycler = Recycler.query.filter_by(user_id=user.id).first()

        if not recycler:
            return jsonify({'error': 'Recycler not found'}), 404

        recycler_id = recycler.id

        plastic_type = data.get('type')
        quantity = data.get('quantity', 1)

        if not recycler_id:
            return jsonify({'error': 'Recycler ID is required'}), 400

        points_action = Points.query.filter_by(transaction_type='recycle').first()
        points_awarded = points_action.points_value if points_action else 10

        if str(plastic_type) == '2':
            points_awarded *= 2

        recycle_plastic = Plastic.query.filter_by(recycler_id=recycler_id, type=plastic_type, status='recycler').limit(quantity).all()

        for plastic in recycle_plastic:
            plastic.recycler_id=recycler_id,
            plastic.status='recycled'
            db.session.commit()

        

        user.points += points_awarded * quantity
        db.session.commit()

        for plastic in recycle_plastic:
            new_transaction = Transaction(
                user_id=user.id,
                plastic_id=plastic.id,
                recycler_id=recycler_id,
                log=f'Recycled Plastic (ID: {plastic.id}) - Type: {plastic_type}',
                points=points_awarded
            )
            db.session.add(new_transaction)

        db.session.commit()
        return jsonify({'message': f'Successfully recycled {quantity} plastic(s).'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/recycler_plastics/<int:recycler_id>', methods=['GET'])
@jwt_required()
def recycler_plastics(recycler_id):
    try:
        recycler = Recycler.query.get(recycler_id)
        if not recycler:
            return jsonify({'error': 'Manufacturer not found'}), 404
        
        query = Plastic.query.filter_by(recycler_id=recycler.id, status="recycler")
        
        plastics = query.order_by(Plastic.recycled_date.desc()).all()
        
        print(plastics)
        plastics_data = [
            {
                'id': plastic.id,
                'recycled_date': plastic.recycled_date.isoformat(),
                'type': plastic.type,
                'cost': plastic.cost
            }
            for plastic in plastics
        ]

        count_type1 = sum(1 for plastic in plastics if plastic.type == 1)
        count_type2 = sum(1 for plastic in plastics if plastic.type == 2)

        plastics_json = {
            'count_data': [
                {'id': 1, 'name': 'Type 1', 'count': count_type1},
                {'id': 2, 'name': 'Type 2', 'count': count_type2}
            ],
            'plastics_data': plastics_data
        }

        print(plastics_json)
        return jsonify(plastics_json), 200

    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/transfer_plastic/to_recycler', methods=['POST'])
@jwt_required()
def transfer_plastic_to_recycler():
    data = request.get_json()
    type1_quantity = data.get('type1_quantity', 0)
    type2_quantity = data.get('type2_quantity', 0)
    retailer_id = data.get('retailer_id')

    
    if not retailer_id:
        return jsonify({'error': 'Retailer ID is required.'}), 400

    try:
        retailer = Retailer.query.get_or_404(retailer_id)
        ret_user = User.query.get_or_404(retailer.user_id)
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()
        recycler = Recycler.query.filter_by(user_id=user.id).first()
        
        ret_points_action = Points.query.filter_by(transaction_type='retailer_to_recycler').first()
        rec_points_action = Points.query.filter_by(transaction_type='recycler_from_retailer').first()
        ret_points_awarded = ret_points_action.points_value if ret_points_action else 0
        rec_points_awarded = rec_points_action.points_value if rec_points_action else 0

        

        ret_total_points_awarded = 0
        rec_total_points_awarded = 0
        rec_transaction_records = []
        ret_transaction_records = []

        if type1_quantity > 0:            
            type1_plastics = Plastic.query.join(PlasticRetailer).filter(PlasticRetailer.retailer_id == retailer_id, Plastic.type == 1, Plastic.status == 'used').limit(type1_quantity).all()
            
            if len(type1_plastics) < type1_quantity:
                print("Not enough Type 1 plastics available.")
                return jsonify({'error': f'Not enough Type 1 plastics available. Requested: {type1_quantity}, Available: {len(type1_plastics)}'}), 400

            for plastic in type1_plastics:
                plastic.recycler_id = recycler.id
                plastic.recycled_date = get_ist_time()
                
                plastic.status = 'recycler'
                db.session.commit()

                ret_transaction_records.append(Transaction(
                    user_id=user.id,
                    plastic_id=plastic.id,
                    recycler_id=recycler.id,
                    retailer_id=retailer.id,
                    log=f'Plastic with ID {plastic.id} - Type: 1 transferred to recycler (Name: {recycler.business_name} ID: {recycler.id})',
                    points=ret_points_awarded
                ))
                rec_transaction_records.append(Transaction(
                    user_id=ret_user.id,
                    plastic_id=plastic.id,
                    recycler_id=recycler.id,
                    retailer_id=retailer.id,
                    log=f'Plastic with ID {plastic.id} - Type: 1 received from retailer (Name: {retailer.business_name} ID: {retailer_id})',
                    points=rec_points_awarded
                ))
                ret_total_points_awarded += ret_points_awarded
                rec_total_points_awarded += rec_points_awarded
        

        if type2_quantity > 0:
            print("ponts", ret_total_points_awarded)
            type2_plastics = Plastic.query.join(PlasticRetailer).filter(PlasticRetailer.retailer_id == retailer_id, Plastic.type == 2, Plastic.status == 'used').limit(type2_quantity).all()
            if len(type2_plastics) < type2_quantity:
                return jsonify({'error': f'Not enough Type 2 plastics available. Requested: {type2_quantity}, Available: {len(type2_plastics)}'}), 400

            
            for plastic in type2_plastics:
                plastic.recycler_id = recycler.id
                plastic.recycled_date = get_ist_time()
                plastic.status = 'recycler'
                db.session.commit()

                ret_transaction_records.append(Transaction(
                    user_id=user.id,
                    plastic_id=plastic.id,
                    recycler_id=recycler.id,
                    retailer_id=retailer.id,
                    log=f'Plastic with ID {plastic.id} - Type: 2 transferred to recycler (Name: {recycler.business_name} ID: {recycler.id})',
                    points=ret_points_awarded
                ))
                rec_transaction_records.append(Transaction(
                    user_id=ret_user.id,
                    plastic_id=plastic.id,
                    recycler_id=recycler.id,
                    retailer_id=retailer.id,
                    log=f'Plastic with ID {plastic.id} - Type: 2 received from retailer (Name: {retailer.business_name} ID: {retailer_id})',
                    points=rec_points_awarded
                ))

                ret_total_points_awarded += ret_points_awarded
                rec_total_points_awarded += rec_points_awarded

        user.points += ret_total_points_awarded
        ret_user.points += rec_total_points_awarded

        db.session.add_all(ret_transaction_records)
        db.session.add_all(rec_transaction_records)
        db.session.commit()

        return jsonify({
            'message': f'Plastics transferred successfully. Total points awarded: {ret_total_points_awarded}',
            'points_awarded': ret_total_points_awarded
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
