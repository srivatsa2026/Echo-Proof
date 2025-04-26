from dotenv import load_dotenv
from supabase import create_client, Client
import os


load_dotenv()

# Fetch the environment variables
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)


print(f"URL: {url}")
print(f"Key: {key}")

def get_supabase_client() -> Client:
    """ Returns the Supabase client."""
    return supabase