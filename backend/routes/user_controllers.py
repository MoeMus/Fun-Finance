from flask import Blueprint
from backend.services import user_service
user_api_route = Blueprint('user', __name__, url_prefix='/users')


@user_api_route.route('/<int:user_id>', methods=['GET'])
def get_user_data_controller(user_id):
    return user_service.get_user_data(user_id)
