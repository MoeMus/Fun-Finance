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
    try:
        uid = auth_service.get_uid_from_token()
        dragon = dragon_service.get_dragon(uid)
        return jsonify(dragon), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/levelup', methods=['POST'])
@authenticate_token
def update_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()
        result = dragon_service.level_up_dragon(uid)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/update-mood', methods=['POST'])
@authenticate_token
def update_dragon_mood_controller():
    try:
        uid = auth_service.get_uid_from_token()
        data = request.get_json()
        if not data or "mood" not in data:
            return jsonify({"error": "Mood data required"}), 400
            
        mood = data["mood"]

        if mood.get("happy"):
            dragon_service.level_up_dragon(uid)
            
        result = dragon_service.update_dragon_mood(uid, mood)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/update-mood/stack', methods=['POST'])
@authenticate_token
def update_dragon_mood_controller():

    uid = auth_service.get_uid_from_token()

    mood = request.get_json()["mood"]
    times = request.get_json()["times"]
    return dragon_service.update_dragon_mood(uid, mood, times), 200


@dragon_api_route.route('/bury', methods=['POST'])
@authenticate_token
def bury_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()
        return jsonify(dragon_service.bury_dragon(uid)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/feed', methods=['POST'])
@authenticate_token
def feed_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()
        return jsonify(dragon_service.perform_dragon_action(uid, "feed")), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/play', methods=['POST'])
@authenticate_token
def play_with_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()
        return jsonify(dragon_service.perform_dragon_action(uid, "play")), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/pet', methods=['POST'])
@authenticate_token
def pet_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()
        return jsonify(dragon_service.perform_dragon_action(uid, "pet")), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/wash', methods=['POST'])
@authenticate_token
def wash_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()
        return jsonify(dragon_service.perform_dragon_action(uid, "wash")), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@dragon_api_route.route('/change', methods=['POST'])
@authenticate_token
def change_dragon_controller():
    try:
        uid = auth_service.get_uid_from_token()
        data = request.get_json()
        if not data or "action" not in data:
            return jsonify({"error": "Action required"}), 400
        action = data["action"]
        return jsonify(dragon_service.make_dragon(uid, action)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

