from icalendar import Calendar
from datetime import datetime, date
from dateutil import tz
import json

def parse_ics_file(file_content, source_name="Unknown"):
    """
    Parses .ics file content and returns a list of events.
    Only imports events starting on or after today (in PST).
    """
    try:
        gcal = Calendar.from_ical(file_content)
    except Exception as e:
        print(f"ICS Parsing Error: {e}")
        return []

    events = []
    
    # Enforce PST timezone
    pst_tz = tz.gettz('America/Los_Angeles')
    utc_tz = tz.UTC
    pst_now = datetime.now(tz=pst_tz)
    today = pst_now.date()
    
    for component in gcal.walk():
        if component.name == "VEVENT":
            summary = component.get('summary', 'Untitled Event')
            dtstart = component.get('dtstart')
            description = component.get('description', '')
            
            if not dtstart:
                continue
                
            try:
                dtstart_obj = dtstart.dt
                
                # Check if it behaves like a datetime (has time/timezone capability)
                if hasattr(dtstart_obj, 'astimezone'):
                    # If it's a naive datetime (missing timezone), assume UTC
                    if getattr(dtstart_obj, 'tzinfo', None) is None:
                        dtstart_obj = dtstart_obj.replace(tzinfo=utc_tz)
                    
                    # Convert explicitly to PST
                    dtstart_obj = dtstart_obj.astimezone(pst_tz)
                
                # Extract the raw year, month, and day to build a clean date.
                if hasattr(dtstart_obj, 'year') and hasattr(dtstart_obj, 'month') and hasattr(dtstart_obj, 'day'):
                    event_date = date(dtstart_obj.year, dtstart_obj.month, dtstart_obj.day)
                else:
                    continue # Not a recognizable date format

                # NOW compare safely
                if event_date >= today:
                    date_str = event_date.strftime('%Y-%m-%d')
                    events.append({
                        "title": str(summary),
                        "date": date_str,
                        "description": str(description),
                        "source": source_name,
                        "type": "imported" 
                    })
            except Exception as e:
                print(f"Skipping malformed event '{summary}': {e}")
                continue
            
    return events
