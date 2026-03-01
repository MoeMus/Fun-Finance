from firebase_admin.auth import EmailAlreadyExistsError
from flask import Blueprint, request, jsonify
from firebase_admin import auth
from backend.services import user_service

auth_api_route = Blueprint('auth', __name__, url_prefix='/auth')


@auth_api_route.route('/register', methods=['POST'])
def register_user_controller():
    user = None
    try:
        data = request.get_json(silent=True) or {}

        username = (data.get('username') or '').strip()
        email = (data.get('email') or '').strip()
        password = data.get('password') or ''

        if not username or not email or not password:
            return jsonify({"error": "Missing username, email, or password"}), 400

        # Create Firebase Auth user first (email uniqueness handled here)
        user = auth.create_user(display_name=username, email=email, password=password)

        user_data = {
            "username": username,
            "user_id": user.uid,
            "email": email,
        }

        created_user_data = user_service.add_user(user.uid, user_data)

        custom_token_bytes = auth.create_custom_token(user.uid)
        custom_token = custom_token_bytes.decode("utf-8")

        return jsonify({"user": created_user_data, "temporary_auth_token": custom_token}), 201

    except EmailAlreadyExistsError:
        return jsonify({"error": "Email already registered"}), 409

    except ValueError as e:
        if user is not None:
            auth.delete_user(user.uid)
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        if user is not None:
            try:
                auth.delete_user(user.uid)
            except Exception:
                pass
        print("Registration error:", e)
        return jsonify({"error": "Registration failed"}), 500
