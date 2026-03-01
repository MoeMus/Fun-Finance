from flask import jsonify
from backend.services.firebase_service import db
from datetime import datetime, timezone


def get_user_data(user_id: str):

    user_data = db.collection("users").document(user_id).get()
    return jsonify(user_data.to_dict())


def add_user(uid: str, user: dict):

    user_data = {
        "username": user["username"],
        "user_id": uid,
        "email": user["email"],
        "last_login_date": datetime.now(timezone.utc)
    }

    user_ref = db.collection("users").document(uid)

    user_ref.set(user_data, merge=True)

    return user_data
