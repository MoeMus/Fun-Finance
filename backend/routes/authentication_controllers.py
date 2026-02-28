from flask import Blueprint, request, jsonify
from firebase_admin import auth
from backend.services.user_service import add_user

auth_api_route = Blueprint('auth', __name__, url_prefix='/auth')


@auth_api_route.route('/register', methods=['POST'])
def register_user_controller():

    try:

        data = request.get_json()

        username = data['username']
        email = data['email']
        password = data['password']

        if not all([username, email, password]):
            return jsonify({"error": "Missing name, email, or password"}), 400

        user = auth.create_user(display_name=username, email=email, password=password)

        user_data = {
            "username": username,
            "user_id": user.uid,
            "email": email,
        }

        user_data = add_user(user.uid, user_data)

        return user_data, 201

    except Exception as e:

        return jsonify({"error": str(e)}), 400
