import setup
import utils
import os
from dotenv import load_dotenv

load_dotenv()

print("-- Funkyscout Setup Utility --")
print("(1) Setup Supabase Project")
print("(2) Setup Supabase DB")

def selectAction():
   match input("Perform an action (1-2)"):
      case 1:
         print("Creating Supabase Project")
         setup.create_project()
      case 2:
         print("Loading Supabase Tables")
         setup.create_database()