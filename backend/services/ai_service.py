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
    Sends calendar events to Gemini to predict costs and risks.
    """
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment.")
        return [
            {**event, "predictedCost": 0.0, "risk": "low", "savingTip": "API key missing."} 
            for event in events
        ]

    prompt = f"""
    Analyze these calendar events and predict the financial impact.
    For each event, provide:
    1. predictedCost (numeric value, estimate based on the title and type)
    2. risk (one of: 'high', 'medium', 'low')
    3. savingTip (a concise, helpful tip)

    Events:
    {json.dumps(events)}
    """

    try:
        # Using Gemini 3 Flash Preview
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a financial AI agent. Analyze calendar events and return ONLY a JSON object with a key 'events' containing the array of analyzed events.",
                response_mime_type="application/json",
            ),
        )
        
        analysis = json.loads(response.text)
        
        if isinstance(analysis, dict) and "events" in analysis:
            return analysis["events"]
        return analysis
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return [
            {**event, "predictedCost": 15.0, "risk": "medium", "savingTip": "Gemini analysis error. Check logs."} 
            for event in events
        ]
