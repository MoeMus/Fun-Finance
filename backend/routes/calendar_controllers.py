from flask import Blueprint, request, jsonify
from backend.services import ai_service, calendar_service

calendar_api_route = Blueprint('calendar', __name__, url_prefix='/calendar')

@calendar_api_route.route('/analyze', methods=['POST'])
def analyze_events():
    """
    Endpoint to receive calendar events and return financial predictions.
    """
    data = request.get_json()
    if not data or 'events' not in data:
        return jsonify({"error": "No events provided"}), 400

    events = data['events']
    analysis_results = ai_service.analyze_calendar_events(events)

    return jsonify(analysis_results)

@calendar_api_route.route('/import', methods=['POST'])
def import_calendar():
    """
    Endpoint to upload a .ics file.
    Expects: multipart/form-data with 'file' and 'source'
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    source = request.form.get('source', 'Personal')

    try:
        file_content = file.read()
        events = calendar_service.parse_ics_file(file_content, source)
        return jsonify({"events": events, "count": len(events)})
    except Exception as e:
        return jsonify({"error": f"Failed to parse calendar: {str(e)}"}), 500

