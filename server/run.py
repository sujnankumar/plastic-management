from app import app, db
from app.models import User
from werkzeug.security import generate_password_hash
from datetime import datetime


def create_admin_user():
    admin = User.query.filter_by(username='admin').first()
    hashed_pass = generate_password_hash('pass', method='scrypt')
    print(hashed_pass)
    if not admin:
        admin = User(
            username='admin',
            email='admin@example.com',
            password= hashed_pass,
            first_name='Admin',
            last_name='User',
            contact_no='1111111111',
            gender='M',
            address='Admin Address',
            dob=datetime(1990, 1, 1),  # Update with admin's date of birth
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        create_admin_user()
    app.run(debug=True)
