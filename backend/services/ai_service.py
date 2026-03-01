import os
import json
from google import genai
from google.genai import types
import dotenv

# Define the path to the secrets folder
current_dir = os.path.dirname(os.path.abspath(__file__))
secrets_env_path = os.path.join(os.path.dirname(current_dir), 'secrets', '.env')

# Load the .env from the secrets folder
if os.path.exists(secrets_env_path):
    dotenv.load_dotenv(secrets_env_path)
else:
    dotenv.load_dotenv()

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = None

if api_key:
    client = genai.Client(api_key=api_key)

def analyze_calendar_events(events):
    """
    Analyzes weekly calendar events for financial impact and causal patterns.
    Simulates the evolution of a Finance Dragon pet.
    """
    if not api_key:
        return {"events": events, "summary": {"totalPredicted": 0, "status": "under"}}

    prompt = f"""
    Analyze these calendar events for the week. 
    1. For each event, predict: predictedCost, risk (high/medium/low), and a savingTip.
    2. Identify 'Causal Patterns' (e.g., 'Late night events leading to expensive convenience spending').
    3. Based on a weekly budget of $150, determine if the user is 'over' or 'under'.
    
    RULES FOR THE FINANCE-DRAGON:
    - Over budget for 1 week: Dragon becomes 'sad' or 'hungry'.
    - Over budget for 2 weeks: Dragon 'shrinks' (e.g., Large -> Medium -> Small -> Baby -> Egg).
    - Under budget for 1 week: Dragon becomes 'happy'.
    - Under budget for 2 weeks: Dragon 'grows' (e.g., Egg -> Baby -> Small -> Medium -> Large).
    - If no activity: Dragon becomes 'bored' or 'lonely'.
    - If lots of 'dirty' risk spending: Dragon becomes 'stinky'.

    Events:
    {json.dumps(events)}

    Return a JSON object with:
    - 'events': array of analyzed events with predictedCost, risk, and savingTip.
    - 'summary': {{
        'totalPredicted': number,
        'status': 'over' or 'under',
        'causalInsight': 'string explaining a habit',
        'dragonMood': 'happy' | 'sad' | 'hungry' | 'bored' | 'lonely' | 'stinky',
        'dragonSize': 'egg' | 'baby' | 'small' | 'medium' | 'large'
    }}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a behavioral financial AI. You analyze calendar events to predict spending and simulate the growth/mood of a digital dragon pet.",
                response_mime_type="application/json",
            ),
        )
        
        analysis = json.loads(response.text)
        return analysis
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {"events": events, "summary": {"totalPredicted": 0, "status": "under"}}
