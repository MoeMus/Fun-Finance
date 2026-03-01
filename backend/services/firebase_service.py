import firebase_admin
from firebase_admin import credentials, firestore
import dotenv
import os

# Define the path to the secrets folder
current_dir = os.path.dirname(os.path.abspath(__file__))
secrets_env_path = os.path.join(os.path.dirname(current_dir), 'secrets', '.env')

# Load the .env from the secrets folder
if os.path.exists(secrets_env_path):
    dotenv.load_dotenv(secrets_env_path)
else:
    # Fallback to standard .env if secrets/.env is missing
    dotenv.load_dotenv()

# Get the path to the service account JSON
service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')

if service_account_path:
    # If a path is provided, make it absolute to be safe
    if not os.path.isabs(service_account_path):
        # Path should be relative to the 'backend' folder
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        service_account_path = os.path.join(backend_dir, service_account_path)
    
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
    else:
        db = None
else:
    db = None
