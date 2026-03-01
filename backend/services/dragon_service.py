from backend.services.firebase_service import db
from backend.services.enums import DragonEvolutionEnum
from datetime import datetime


from datetime import datetime
from backend.services.firebase_service import db


def get_dragon(uid: str) -> dict | None:
    snap = db.collection("dragons").document(uid).get()
    if not snap.exists:
        return None
    return snap.to_dict()


def create_dragon(uid: str, dragon_name: str) -> dict:
    if not dragon_name or not dragon_name.strip():
        raise ValueError("Dragon name is required")

    existing = get_dragon(uid)
    if existing is not None:
        raise ValueError("You already have a pet dragon")

    current_timestamp = datetime.now().timestamp()

    dragon_settings = {
        "name": dragon_name.strip(),
        "level": 0,
        "max_health": 50,
        "current_health": 50,
        "date_of_birth": current_timestamp,
        "evolution": DragonEvolutionEnum.EGG.value,   # store string, not Enum
        "next_evolution": 4,
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

    db.collection("dragons").document(uid).set(dragon_settings)
    return dragon_settings


def level_up_dragon(uid: str):
    dragon = db.collection('dragons').document(uid).get().to_dict()

    dragon["level"] += 1

    # EVOLUTION LOGIC: Every 4 levels, up to level 12
    if dragon["level"] % 4 == 0 and dragon["level"] <= 12:
        current_evolution = DragonEvolutionEnum(dragon["evolution"])
        next_evo_info = DragonEvolutionEnum.get_next_evolution(current_evolution)
        
        if next_evo_info:
            dragon["evolution"] = next_evo_info[0].value
            dragon["next_evolution"] = next_evo_info[1]
            
            # Physical Evolution Boost: Increase Max HP and full heal
            dragon["max_health"] += 100
            dragon["current_health"] = dragon["max_health"]
    else:
        # STANDARD LEVEL UP: Only increase the numerical level.
        # No health changes here to keep evolutions meaningful.
        pass

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
