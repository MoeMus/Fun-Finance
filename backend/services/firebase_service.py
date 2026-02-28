import firebase_admin
from firebase_admin import credentials, firestore
import dotenv
import os

dotenv.load_dotenv()
cred = credentials.Certificate(os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON'))
firebase_admin.initialize_app(cred)

db = firestore.client()
