from flask import jsonify

from backend.services.firebase_service import db
from backend.services.enums import DragonEvolutionEnum
from datetime import datetime


def get_dragon(uid: str):

    dragon = db.collection('dragons').document(uid).get()

    return jsonify(dragon.to_dict())


def create_dragon(uid: str, dragon_name: str):
    current_datetime = datetime.now()
    current_timestamp = current_datetime.timestamp()

    dragon_settings = {
        "name": dragon_name,
        "level": 0,
        "max_health": 50,
        "current_health": 50,
        "date_of_birth": current_timestamp,
        "evolution": DragonEvolutionEnum.EGG,
        "user_id": uid,
        "mood": {
            "happy": True,
            "sad": False,
            "dirty": False,
            "hungry": False,
            "lonely": False,
            "bored": True
        }
    }

    existing_dragon = get_dragon(uid)

    if existing_dragon:

        raise Exception("You already have a pet dragon")

    db.collection('dragons').collections(uid).set(dragon_settings)
    return dragon_settings


def level_up_dragon(uid: str):
    dragon = db.collection('dragons').document(uid).get().to_dict()

    dragon["level"] += 1

    if dragon["level"] % 4 == 0 and dragon["level"] <= 12:

        dragon["evolution"] = DragonEvolutionEnum.get_next_evolution(evolution_type=["evolution"])

        dragon["max_health"] = 200 + 50 / (dragon["level"] - 12)
        dragon["current_health"] = dragon["max_health"]

    else:

        dragon["max_health"] += 50
        dragon["current_health"] += 50

    db.collection('dragons').document(uid).set(dragon, merge=True)

    return dragon


def damage_dragon(uid: str, damage: int):

    dragon = db.collection('dragons').document(uid).get().to_dict()

    dragon["current_health"] = max(dragon["current_health"] - damage, 0)

    db.collection('dragons').document(uid).set(dragon, merge=True)

    return dragon


def update_dragon_mood(uid: str, mood: dict):

    dragon = db.collection('dragons').document(uid).get().to_dict()

    dragon["mood"]["happy"] = mood["happy"]

    if mood["sad"]:

        dragon["mood"]["sad"] = True
        dragon["mood"]["happy"] = False
        dragon["current_health"] = max(dragon["current_health"] - 50, 0)

    else:

        dragon["mood"]["sad"] = False

    if mood["hungry"]:

        dragon["mood"]["hungry"] = True
        dragon["mood"]["happy"] = False
        dragon["current_health"] = max(dragon["current_health"] - 25, 0)

    else:

        dragon["mood"]["hungry"] = False

    if mood["lonely"]:

        dragon["mood"]["lonely"] = True
        dragon["mood"]["happy"] = True
        dragon["current_health"] = max(dragon["current_health"] - 25, 0)

    else:

        dragon["mood"]["lonely"] = False

    if mood["bored"]:

        dragon["mood"]["bored"] = True
        dragon["mood"]["happy"] = False
        dragon["current_health"] = max(dragon["current_health"] - 25, 0)

    else:

        dragon["mood"]["bored"] = False

    db.collection('dragons').document(uid).set(dragon, merge=True)

    return dragon


# Removes the dragon from 'dragons' collection and adds it to the 'dead_dragons' collection
def bury_dragon(uid):

    dragon = db.collection('dragons').document(uid).get().to_dict()

    current_datetime = datetime.now()
    current_timestamp = current_datetime.timestamp()

    db.collection('dragons').document(uid).delete()

    dead_dragon = {
        "name": dragon["name"],
        "level": dragon["level"],
        "date_of_birth": dragon["date_of_birth"],
        "date_of_death": current_timestamp,
        "evolution": dragon["evolution"],
        "user_id": uid
    }

    db.collection('dragons').add(dead_dragon)

    return dead_dragon
