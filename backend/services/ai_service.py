import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def analyze_calendar_events(events):
    """
    Sends calendar events to Gemini to predict costs and risks.
    Uses the latest google-genai SDK and Gemini 2.0 Flash.
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
        # Using Gemini 3 Flash Preview as per latest docs
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
