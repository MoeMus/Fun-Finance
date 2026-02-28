from flask import jsonify


def get_user_data(user_id):

    return jsonify({'user_id': user_id, 'username': 'user'})
