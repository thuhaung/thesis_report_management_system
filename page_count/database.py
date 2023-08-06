import psycopg2
import os
from dotenv import load_dotenv

class Database:
    def __init__(self):
        load_dotenv()

        self.connection = psycopg2.connect(
                            database=os.environ.get("DATABASE_NAME"),
                            user=os.environ.get("DATABASE_USER"),
                            password=os.environ.get("DATABASE_PASSWORD"),
                            host=os.environ.get("DATABASE_HOST"),
                            port=os.environ.get("DATABASE_PORT")
                        )
        self.cursor = self.connection.cursor()
        print("connected to database " + os.environ.get("APP_NAME"), flush=True)
    
    def insert(self, query, values):
        print("query = " + query, flush=True)
        self.cursor.execute(query, values)
        self.connection.commit()
        print("query executed", flush=True)

    def select(self, query, values):
        print("query = " + query, flush=True)
        self.cursor.execute(query, values)
        return self.cursor.fetchall()

    def update(self, query, values):
        print("query = " + query, flush=True)
        self.cursor.execute(query, values)
        self.connection.commit()
        print("query executed", flush=True)

    def close(self):
        self.cursor.close()
        self.connection.close()
