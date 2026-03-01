from icalendar import Calendar
from datetime import datetime, date
import json

def parse_ics_file(file_content, source_name="Unknown"):
    """
    Parses .ics file content and returns a list of events.
    Only imports events starting on or after today.
    """
    gcal = Calendar.from_ical(file_content)
    events = []
    today = date.today()
    
    for component in gcal.walk():
        if component.name == "VEVENT":
            summary = component.get('summary')
            dtstart_obj = component.get('dtstart').dt
            description = component.get('description', '')
            
            # Convert dtstart to a date object for comparison
            event_date = dtstart_obj if isinstance(dtstart_obj, date) else dtstart_obj.date()
            
            # FILTER: Only include events starting today or in the future
            if event_date >= today:
                date_str = event_date.strftime('%Y-%m-%d')
                
                events.append({
                    "title": str(summary),
                    "date": date_str,
                    "description": str(description),
                    "source": source_name,
                    "type": "imported" 
                })
            
    return events
