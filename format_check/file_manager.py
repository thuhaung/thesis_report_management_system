from google.cloud import storage
from dotenv import load_dotenv
import os
import time

load_dotenv()

client = storage.Client()
bucket = client.bucket(os.environ.get("GOOGLE_CLOUD_STORAGE_BUCKET"))

def get_file_from_bucket(file_name):
    blob = bucket.blob(file_name)

    if blob.exists():
        content = blob.download_as_bytes()

        save_location = os.path.join("temp", os.path.basename(file_name))

        with open(save_location, "wb") as file:
            file.write(content)
        
        return save_location
    else:
        print("PDF file does not exist in the bucket.", flush=True)


def upload_file_to_bucket(file_path):
    file_name = os.environ.get("APP_NAME") + "/" + os.path.basename(file_path)
    blob = bucket.blob(file_name)

    blob.upload_from_filename(file_path)

    print("File uploaded to " + file_name + " in GCP bucket", flush=True)

    return file_name


def write_to_bucket(file_name, content):
    file_path = os.environ.get("APP_NAME") + "/" + file_name + ".txt"

    blob = bucket.blob(file_path)

    with blob.open(mode="w") as file:
        for line in content:
            file.write(line)

    print("File upload to " + file_path, flush=True)
    return file_path


def get_text_from_bucket(file_name):
    blob = bucket.blob(file_name)

    if blob.exists():
        content = blob.download_as_string()
        content = content.decode("utf-8")

        return content
    else:
        print("Requirement file does not exist in the bucket.", flush=True)


def remove_file_from_dir(file_path):
    if (os.path.isfile(file_path)):
        for i in range(10):
            try:
                os.remove(file_path)
            except WindowsError:
                time.sleep(0.1)
            else:
                print("removed file at " + file_path, flush=True) 
                break
    else:
        print("error file not found", flush=True)