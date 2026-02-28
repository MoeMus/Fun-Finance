from flask import Blueprint, request, jsonify
from services import ai_service

calendar_api_route = Blueprint('calendar', __name__, url_prefix='/calendar')

@calendar_api_route.route('/analyze', methods=['POST'])
def analyze_events():
    """
    Endpoint to receive calendar events and return financial predictions.
    Expects JSON body: { "events": [...] }
    """
    data = request.get_json()
    if not data or 'events' not in data:
        return jsonify({"error": "No events provided"}), 400
    
    events = data['events']
    analysis_results = ai_service.analyze_calendar_events(events)
    
    return jsonify(analysis_results)
