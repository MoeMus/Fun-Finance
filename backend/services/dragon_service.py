from __future__ import annotations
from backend.services.enums import DragonEvolutionEnum
from backend.services.firebase_service import db
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from google.cloud import firestore

from datetime import datetime


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
            "bored": False
        }
    }

    db.collection("dragons").document(uid).set(dragon_settings)
    return dragon_settings


def _dragon_ref(uid: str) -> firestore.DocumentReference:
    if not uid or not isinstance(uid, str):
        raise ValueError("uid must be a non-empty string")
    return db.collection("dragons").document(uid)


def _dead_dragon_ref(uid: str) -> firestore.DocumentReference:
    if not uid or not isinstance(uid, str):
        raise ValueError("uid must be a non-empty string")
    return db.collection("dead_dragons").document(uid)


def _require_dragon(snapshot: firestore.DocumentSnapshot) -> Dict[str, Any]:
    if not snapshot.exists:
        raise KeyError("Dragon not found")
    dragon = snapshot.to_dict() or {}
    # Basic shape sanity checks / defaults
    dragon.setdefault("level", 1)
    dragon.setdefault("evolution", None)
    dragon.setdefault("next_evolution", None)
    dragon.setdefault("max_health", 100)
    dragon.setdefault("current_health", dragon["max_health"])
    dragon.setdefault(
        "mood",
        {"happy": True, "sad": False, "hungry": False, "lonely": False, "bored": False, "dirty": False},
    )
    # Ensure mood has all keys
    for k in ["happy", "sad", "hungry", "lonely", "bored", "dirty"]:
        dragon["mood"].setdefault(k, False)
    return dragon


def _compute_happy(mood: Dict[str, bool]) -> bool:
    return not (mood.get("sad") or mood.get("hungry") or mood.get("lonely") or mood.get("bored") or mood.get("dirty"))


def _clamp_int(x: Any, lo: int, hi: int) -> int:
    try:
        v = int(x)
    except Exception:
        v = lo
    return max(lo, min(hi, v))


# -----------------------------
# Core functions (transactional)
# -----------------------------

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


def damage_dragon(uid: str, damage: int) -> Dict[str, Any]:
    """
    - Transactional
    - Validates damage
    - Clamps current_health at 0
    """
    ref = _dragon_ref(uid)
    tx = db.transaction()

    dmg = _clamp_int(damage, 0, 10_000)

    @firestore.transactional
    def _run(transaction: firestore.Transaction) -> Dict[str, Any]:
        snap = ref.get(transaction=transaction)
        dragon = _require_dragon(snap)

        cur = int(dragon.get("current_health", 0))
        dragon["current_health"] = max(cur - dmg, 0)

        transaction.set(ref, {"current_health": dragon["current_health"]}, merge=True)
        # Return the updated in-memory dragon view
        return dragon

    return _run(tx)


def update_dragon_mood(uid: str, mood: Dict[str, Any]) -> Dict[str, Any]:
    """
    - Transactional
    - Only accepts mood flags from client (sad/hungry/lonely/bored/dirty)
    - Computes happy server-side
    - Applies health penalties once per update based on active negatives
    """
    if not isinstance(mood, dict):
        raise ValueError("mood must be a dict")

    ref = _dragon_ref(uid)
    tx = db.transaction()

    # Accept only these from client
    allowed_keys = ["sad", "hungry", "lonely", "bored", "dirty"]
    incoming = {k: bool(mood.get(k, False)) for k in allowed_keys}

    @firestore.transactional
    def _run(transaction: firestore.Transaction) -> Dict[str, Any]:
        snap = ref.get(transaction=transaction)
        dragon = _require_dragon(snap)

        # Update mood flags
        for k, v in incoming.items():
            dragon["mood"][k] = v

        # Compute happy (FIX: don’t accept "happy" from client, and lonely should not force happy True)
        dragon["mood"]["happy"] = _compute_happy(dragon["mood"])

        # Health penalty model (example):
        # sad: -50, hungry/lonely/bored/dirty: -25 each (only if that flag is True)
        penalty = 0
        if dragon["mood"].get("sad"):
            penalty += 50
        for k in ["hungry", "lonely", "bored", "dirty"]:
            if dragon["mood"].get(k):
                penalty += 25

        cur = int(dragon.get("current_health", 0))
        dragon["current_health"] = max(cur - penalty, 0)

        transaction.set(
            ref,
            {"mood": dragon["mood"], "current_health": dragon["current_health"]},
            merge=True,
        )
        return dragon

    return _run(tx)


def bury_dragon(uid: str) -> Dict[str, Any]:
    """
    - Transactional: ensures we read the dragon and move it consistently
    - FIX: writes to dead_dragons collection, not dragons
    - Stores under same uid (easy lookup)
    """
    dragon_doc = _dragon_ref(uid)
    dead_doc = _dead_dragon_ref(uid)
    tx = db.transaction()

    @firestore.transactional
    def _run(transaction: firestore.Transaction) -> Dict[str, Any]:
        snap = dragon_doc.get(transaction=transaction)
        dragon = _require_dragon(snap)

        now_ts = datetime.now(timezone.utc).timestamp()

        dead_dragon = {
            "name": dragon.get("name"),
            "level": dragon.get("level"),
            "date_of_birth": dragon.get("date_of_birth"),
            "date_of_death": now_ts,
            "evolution": dragon.get("evolution"),
            "user_id": uid,
        }

        # Write dead dragon, then delete living dragon in the same transaction
        transaction.set(dead_doc, dead_dragon, merge=True)
        transaction.delete(dragon_doc)

        return dead_dragon

    return _run(tx)


def perform_dragon_action(uid: str, action: str) -> Dict[str, Any]:
    ref = _dragon_ref(uid)
    tx = db.transaction()

    @firestore.transactional
    def _run(transaction: firestore.Transaction) -> Dict[str, Any]:
        snap = ref.get(transaction=transaction)
        dragon = _require_dragon(snap)

        if action == "feed":
            dragon["mood"]["hungry"] = False

        if action == "play":
            dragon["mood"]["bored"] = False

        if action == "pet":
            dragon["mood"]["lonely"] = False

        if action == "wash":
            dragon["mood"]["dirty"] = False

        dragon["mood"]["happy"] = _compute_happy(dragon["mood"])

        transaction.set(
            ref,
            {"mood": dragon["mood"]},
            merge=True,
        )
        return dragon

    return _run(tx)


def make_dragon(uid: str, action: str):

    ref = _dragon_ref(uid)
    tx = db.transaction()

    @firestore.transactional
    def _run(transaction: firestore.Transaction) -> Dict[str, Any]:
        snap = ref.get(transaction=transaction)
        dragon = _require_dragon(snap)
        if action == "hungry":
            dragon["mood"]["hungry"] = True

        if action == "bored":
            dragon["mood"]["bored"] = True

        if action == "lonely":
            dragon["mood"]["lonely"] = True

        if action == "dirty":
            dragon["mood"]["dirty"] = True

        dragon["mood"]["happy"] = _compute_happy(dragon["mood"])

        transaction.set(
            ref,
            {"mood": dragon["mood"]},
            merge=True,
        )
        return dragon

    return _run(tx)
