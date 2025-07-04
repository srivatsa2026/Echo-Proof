import psycopg2
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl

load_dotenv()
tmpPostgres = urlparse(os.getenv("DATABASE_URL"))

def get_pg_connection():
    return psycopg2.connect(
        dbname=tmpPostgres.path.replace('/', ''),
        user=tmpPostgres.username,
        password=tmpPostgres.password,
        host=tmpPostgres.hostname,
        port=5432,
        sslmode="require",
        
    ) 
