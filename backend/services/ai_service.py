import os
import json
import hashlib
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

# SIMPLE IN-MEMORY CACHE
# Prevents redundant API calls if the events haven't changed
ai_cache = {}

def analyze_calendar_events(events):
    """
    Analyzes weekly calendar events for financial impact and causal patterns.
    """
    if not api_key:
        return {"events": events, "summary": {"totalPredicted": 0, "status": "under"}}

    # Create a unique hash of the events list to check the cache
    event_hash = hashlib.md5(json.dumps(events, sort_keys=True).encode()).hexdigest()
    if event_hash in ai_cache:
        print("DEBUG: Using cached AI analysis...")
        return ai_cache[event_hash]

    prompt = f"""
    Analyze these calendar events for the week. 
    1. For each event, predict: predictedCost, risk (high/medium/low), and a savingTip.
    2. Identify 'Causal Patterns'.
    3. Based on a weekly budget of $150, determine if the user is 'over' or 'under'.
    
    RULES FOR THE FINANCE-DRAGON:
    - Over budget for 1 week: Dragon becomes 'sad' or 'hungry'.
    - Over budget for 2 weeks: Dragon 'shrinks'.
    - Under budget for 1 week: Dragon becomes 'happy'.
    - Under budget for 2 weeks: Dragon 'grows'.
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
        # Keeping Gemini 2.5 Flash as requested
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a behavioral financial AI. You analyze calendar events to predict spending and simulate the growth/mood of a digital dragon pet.",
                response_mime_type="application/json",
            ),
        )
        
        analysis = json.loads(response.text)
        
        # Store in cache
        ai_cache[event_hash] = analysis
        return analysis
        
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return {"events": events, "summary": {"totalPredicted": 0, "status": "under"}}

def apply_dragon_evolution(hp_delta: int, new_mood: str, insight: str) -> dict:
    """
    Applies changes to the dragon's state based on financial performance.
    """
    return {
        "hp_delta": hp_delta,
        "new_mood": new_mood,
        "insight": insight,
        "action_taken": True
    }

def resolve_day_agent(actual_spending, predicted_spending, events_today, current_stats):
    """
    The Agentic Loop: FORCES the AI to act via function calling.
    """
    if not api_key:
        return {"error": "API key missing"}

    sys_instruct = (
        "You are the Dragon's Guardian. Your ONLY way to respond is by calling the 'apply_dragon_evolution' tool.\n\n"
        "1. Compare Actual Spending vs Predicted Spending.\n"
        "2. If Actual > Predicted: Call tool with negative hp_delta and mood 'sad'.\n"
        "3. If Actual <= Predicted: Call tool with positive hp_delta and mood 'happy'.\n"
        "4. Your 'insight' should be a punchy message about today's spending habits."
    )
    
    prompt = (
        f"Actual Spending: ${actual_spending}\n"
        f"Predicted Spending: ${predicted_spending}\n"
        f"Today's Events: {json.dumps(events_today)}\n"
        f"Current Dragon Stats: {json.dumps(current_stats)}"
    )
    
    try:
        # Use Gemini 2.5 Flash with FORCED tool calling 
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=sys_instruct,
                tools=[apply_dragon_evolution],
                tool_config=types.ToolConfig(
                    function_calling_config=types.FunctionCallingConfig(
                        mode="ANY",
                        allowed_function_names=["apply_dragon_evolution"]
                    )
                ),
                temperature=0.1
            )
        )
        
        # Check for function call
        if response.function_calls:
            fc = response.function_calls[0]
            if fc.name == "apply_dragon_evolution":
                args = fc.args
                return {
                    "status": "success",
                    "battle_result": "defeat" if args.get("hp_delta", 0) < 0 else "victory",
                    "hp_delta": args.get("hp_delta", 0),
                    "new_mood": args.get("new_mood", "happy"),
                    "insight": args.get("insight", "The battle has ended.")
                }
        
        return {"error": "Agent refused to act."}
        
    except Exception as e:
        print(f"Agent Error: {e}")
        return {"error": str(e)}
