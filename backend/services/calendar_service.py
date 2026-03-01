from icalendar import Calendar
from datetime import datetime
import json

def parse_ics_file(file_content, source_name="Unknown"):
    """
    Parses .ics file content and returns a list of events.
    """
    gcal = Calendar.from_ical(file_content)
    events = []
    
    for component in gcal.walk():
        if component.name == "VEVENT":
            summary = component.get('summary')
            dtstart = component.get('dtstart').dt
            description = component.get('description', '')
            
            # Ensure we have a string for the date
            if isinstance(dtstart, datetime):
                date_str = dtstart.strftime('%Y-%m-%d')
            else:
                date_str = str(dtstart)
                
            events.append({
                "title": str(summary),
                "date": date_str,
                "description": str(description),
                "source": source_name,
                "type": "imported" # AI will refine this later
            })
            
    return events
