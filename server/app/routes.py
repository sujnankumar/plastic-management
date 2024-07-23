from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import func
from werkzeug.security import generate_password_hash, check_password_hash
from app import app, db
from app.models import User, Buyer, Retailer, Manufacturer, Recycler, UserRoleRequest, Plastic, PlasticRetailer, PlasticBuyer, Transaction, Points
from datetime import datetime, timedelta, timezone
from dateutil import parser
import qrcode
import qrcode
import io

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
    print("Role" + user.role)
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
    data = request.get_json()
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    manufacturer_id = data.get('manufacturerId')
    plastic_type = data.get('type')
    cost = data.get('cost')
    quantity = data.get('quantity', 1)

    if not manufacturer_id:
        return jsonify({'error': 'Manufacturer ID is required'}), 400

    try:
        points_action = Points.query.filter_by(transaction_type='create').first()
        points_awarded = points_action.points_value if points_action else 0
        print(str(plastic_type))

        if str(plastic_type) == '2': points_awarded = points_awarded * 2

        new_plastics = []
        for _ in range(quantity):
            new_plastic = Plastic(
                manufacturer_id=manufacturer_id,
                type=plastic_type,
                cost=cost
            )
            db.session.add(new_plastic)
            new_plastics.append(new_plastic)

        db.session.commit()

        user.points += points_awarded
        db.session.commit()

        for plastic in new_plastics:
            new_transaction = Transaction(
                user_id=user.id,
                plastic_id=plastic.id,
                manufacturer_id=manufacturer_id,
                log=f'Created new Plastic (ID: {plastic.id}) - Type: '+str(plastic_type),
                points=points_awarded
            )
            db.session.add(new_transaction)

        db.session.commit()

        plastics_data = [
            {
                'id': plastic.id,
                'manufactured_date': plastic.manufactured_date.isoformat(),
                'points_awarded': points_awarded
            }
            for plastic in new_plastics
        ]

        return jsonify(plastics_data), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/manufacturer_plastics/<int:manufacturer_id>', methods=['GET'])
@jwt_required()
def manufacturer_plastics(manufacturer_id):
    try:
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()
        manufacturer = Manufacturer.query.filter_by(user_id=user.id).first()

        if not manufacturer or manufacturer.id != manufacturer_id:
            return jsonify({'error': 'Unauthorized or Manufacturer ID mismatch'}), 403

        plastics = Plastic.query.filter_by(manufacturer_id=manufacturer.id, status='manufacturer').order_by(Plastic.manufactured_date.desc()).all()
        plastics_data = [
            {
                'id': plastic.id,
                'manufactured_date': plastic.manufactured_date.isoformat(),
                'type': plastic.type,
                'cost': plastic.cost
            }
            for plastic in plastics
        ]

        return jsonify(plastics_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    print(user)
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
        inventory = PlasticRetailer.query.filter_by(retailer_id=retailer_id).all()
        print(inventory)
        response = [
            {
                'id': item.id,
                'plastic_id': item.plastic_id,
            }
            for item in inventory
        ]
        print(response)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/sell_plastic', methods=['POST'])
@jwt_required()
def sell_plastic():
    data = request.get_json()

    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    retailer = Retailer.query.filter_by(user_id=user.id).first()
    retailer_id = retailer.id

    plastic_id = data.get('plastic_id')
    user_id = data.get('user_id')  # Assuming user_id corresponds to the buyer_id

    if not plastic_id or not user_id:
        return jsonify({"message": "Plastic ID and User ID are required"}), 400

    try:
        # Check if plastic exists
        plastic = Plastic.query.get(plastic_id)
        if not plastic:
            return jsonify({"message": "Plastic not found"}), 404

        # Check if there is enough quantity in retailer's inventory
        plastic_retailer = PlasticRetailer.query.filter_by(plastic_id=plastic_id, retailer_id=retailer_id).first()
        if not plastic_retailer:
            return jsonify({"message": "Plastic not available in inventory"}), 404

        # Deduct the quantity from retailer's inventory
        db.session.commit()

        # Add to plastic buyer table
        plastic_buyer = PlasticBuyer(plastic_id=plastic_id, buyer_id=user_id)  # Assuming quantity is 1 per sale
        db.session.add(plastic_buyer)
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
    plastic_ids = data.get('plastic_ids')
    retailer_id = data.get('retailer_id')

    try:

        if not plastic_ids or not retailer_id:
            return jsonify({'error': 'Plastic IDs and retailer ID are required.'}), 400

        retailer = Retailer.query.get_or_404(retailer_id)
        ret_user = User.query.get_or_404(retailer.user_id)
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()

        man_points_action = Points.query.filter_by(transaction_type='manufacturer_to_retailer').first()
        ret_points_action = Points.query.filter_by(transaction_type='retailer_from_manufacturer').first()
        man_points_awarded = man_points_action.points_value if man_points_action else 0
        ret_points_awarded = ret_points_action.points_value if ret_points_action else 0

        man_total_points_awarded = 0
        ret_total_points_awarded = 0
        transaction_records = []
        man_transaction_records = []
        plastic_retailer_records = []

        for plastic_id in plastic_ids:
            plastic = Plastic.query.get_or_404(plastic_id)

            if plastic.status == 'retailer':
                continue

            plastic.status = 'retailer'
            plastic_retailer_records.append(PlasticRetailer(plastic_id=plastic.id, retailer_id=retailer.id))

            man_transaction_records.append(Transaction(
                user_id=user.id,
                plastic_id=plastic.id,
                retailer_id=retailer.id,
                log='Plastic with ID ' + str(plastic.id) + ' transferred to retailer (ID: ' +str(retailer_id)+')',
                points=man_points_awarded
            ))
            

            transaction_records.append(Transaction(
                user_id=ret_user.id,
                plastic_id=plastic.id,
                retailer_id=retailer_id,
                log='Plastic with ID ' + str(plastic.id) + ' received from manufacturer (ID: ' +str(user.id)+')',
                points=ret_points_awarded
            ))
            
            man_total_points_awarded += man_points_awarded
            ret_total_points_awarded += ret_points_awarded
            

        # Commit all at once
        user.points += man_total_points_awarded
        ret_user.points += ret_total_points_awarded
        
        db.session.commit()
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

@app.route('/api/transfer_plastic/<int:plastic_id>/to_recycler/<int:recycler_id>', methods=['POST'])
@jwt_required()
def transfer_plastic_to_recycler(plastic_id, recycler_id):
    try:
        plastic = Plastic.query.get_or_404(plastic_id)
        recycler = Recycler.query.get_or_404(recycler_id)
        current_user_username = get_jwt_identity()
        user = User.query.filter_by(username=current_user_username).first()

        plastic.status = 'recycler'
        db.session.commit()

        points_action = Points.query.filter_by(transaction_type='retailer_to_recycler').first()
        points_awarded = points_action.points_value if points_action else 0

        new_transaction = Transaction(
            user_id=user.id,
            plastic_id=plastic.id,
            recycler_id=recycler.id,
            log='Plastic transferred to recycler',
            points=points_awarded
        )
        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            'message': 'Plastic transferred successfully',
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
        print(retailer)
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

@app.route('/api/plastics/for_retailer/<int:retailer_id>', methods=['GET'])
@jwt_required()
def get_plastics_for_retailer(retailer_id):
    print("Retailer",retailer_id)
    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    plastics = Plastic.query.join(PlasticRetailer).filter(PlasticRetailer.retailer_id == retailer_id, Plastic.status == 'retailer').all()
    print(plastics)
    return jsonify([{
        'id': p.id,
        'manufactured_date': p.manufactured_date.strftime('%Y-%m-%d %H:%M:%S')
    } for p in plastics])

@app.route('/api/buy_plastic', methods=['POST'])
@jwt_required()
def buy_plastic():
    data = request.get_json()
    plastic_id = data.get('plastic_id')
    retailer_id = data.get('retailer_id')
    if not plastic_id:
        return jsonify({'error': 'Plastic ID is required.'}), 400

    current_user_username = get_jwt_identity()
    user = User.query.filter_by(username=current_user_username).first()
    
    plastic = Plastic.query.get_or_404(plastic_id)
    
    if plastic.status != 'retailer':
        return jsonify({'error': 'Plastic is not available for purchase.'}), 400

    plastic.status = 'buyer'
    points = Points.query.filter_by(transaction_type='retailer_to_buyer').first()
    points_awarded = points.points_value
    
    buy_new_transaction = Transaction(
        user_id=user.id,
        plastic_id=plastic.id,
        retailer_id=retailer_id,
        log='Plastic (ID: '+str(plastic.id)+') bought from Retailer (ID: ' +str(retailer_id)+')',
        points=points_awarded
    )
    ret_new_transaction = Transaction(
        user_id=retailer_id,
        plastic_id=plastic.id,
        retailer_id=retailer_id,
        log='Plastic (ID: '+str(plastic.id)+') sold to Buyer (ID: ' +str(user.id)+')',
        points=points_awarded
    )
    db.session.add(buy_new_transaction)
    db.session.add(ret_new_transaction)
    db.session.commit()

    db.session.add(PlasticBuyer(plastic_id=plastic.id, buyer_id=user.id))
    
    user.points += points_awarded

    db.session.commit()

    return jsonify({
        'message': 'Plastic purchased successfully.',
        'points_awarded': points_awarded
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