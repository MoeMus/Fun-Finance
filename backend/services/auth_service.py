from firebase_admin import auth
from flask import request


def get_uid_from_token():

    token = request.headers.get('Authorization')
    id_token = token.split(" ")[1]

    decoded_token = auth.verify_id_token(id_token)
    uid = decoded_token["uid"]

    return uid
