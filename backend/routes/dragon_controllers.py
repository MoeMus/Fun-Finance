from firebase_admin import auth
from flask import Blueprint, jsonify, request
from backend.routes.authentication_decorator import authenticate_token
from backend.services import dragon_service, auth_service
dragon_api_route = Blueprint('dragon_api_route', __name__, url_prefix='/dragon')


@dragon_api_route.route('/create', methods=['POST'])
@authenticate_token
def create_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()

        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON body"}), 400

        dragon_name = data.get("dragon_name")
        if not dragon_name:
            return jsonify({"error": "No dragon name provided"}), 400

        created_dragon = dragon_service.create_dragon(uid, dragon_name)

        return jsonify(created_dragon), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/get', methods=['GET'])
@authenticate_token
def get_dragon_controller():

    uid = auth_service.get_uid_from_token()

    return jsonify(dragon_service.get_dragon(uid)), 200


@dragon_api_route.route('/levelup', methods=['POST'])
@authenticate_token
def update_dragon_controller():

    uid = auth_service.get_uid_from_token()

    return dragon_service.level_up_dragon(uid), 200


@dragon_api_route.route('/damage', methods=['POST'])
@authenticate_token
def damage_dragon_controller():

    uid = auth_service.get_uid_from_token()

    damage = request.get_json()["damage"]

    return dragon_service.damage_dragon(uid, damage), 200


@dragon_api_route.route('/update-mood', methods=['POST'])
@authenticate_token
def update_dragon_mood_controller():

    uid = auth_service.get_uid_from_token()

    mood = request.get_json()["mood"]

    return dragon_service.update_dragon_mood(uid, mood), 200


@dragon_api_route.route('/bury', methods=['POST'])
@authenticate_token
def bury_dragon_controller():
    uid = auth_service.get_uid_from_token()

    return dragon_service.bury_dragon(uid), 200

