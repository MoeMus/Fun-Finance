from flask import Blueprint, request
from backend.services import user_service
from backend.routes.authentication_decorator import authenticate_token
from firebase_admin import auth

user_api_route = Blueprint('user', __name__, url_prefix='/users')


@user_api_route.route('/data', methods=['GET'])
@authenticate_token
def get_user_data_controller(user_id: str):

    token = request.headers.get('Authorization')
    id_token = token.split(" ")[1]

    decoded_token = auth.verify_id_token(id_token)
    uid = decoded_token["uid"]

    return user_service.get_user_data(uid)
