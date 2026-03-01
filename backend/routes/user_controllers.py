from flask import Blueprint, request
from backend.services import user_service, auth_service
from backend.routes.authentication_decorator import authenticate_token
from firebase_admin import auth

user_api_route = Blueprint('user', __name__, url_prefix='/users')


@user_api_route.route('/data', methods=['GET'])
@authenticate_token
def get_user_data_controller(user_id: str):

    uid = auth_service.get_uid_from_token()

    return user_service.get_user_data(uid)
