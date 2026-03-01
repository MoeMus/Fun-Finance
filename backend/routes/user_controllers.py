from flask import Blueprint
from backend.services import user_service
from backend.routes.authentication_decorator import authenticate_token

user_api_route = Blueprint('user', __name__, url_prefix='/users')


@user_api_route.route('/<string:user_id>', methods=['GET'])
@authenticate_token
def get_user_data_controller(user_id: str):
    return user_service.get_user_data(user_id)
