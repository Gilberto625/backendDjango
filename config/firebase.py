# config/firebase.py
import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("config/firebase_credentials.json")
firebase_admin.initialize_app(cred)