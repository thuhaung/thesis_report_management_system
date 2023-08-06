import os
import re
import uuid
import timeit
import pdfplumber

from dotenv import load_dotenv
from datetime import datetime
from database import Database
from producer import Producer
from file_manager import get_file_from_bucket, remove_file_from_dir, write_to_bucket, get_text_from_bucket

load_dotenv()

def get_requirements():
    requirements = {}

    text_list = get_text_from_bucket("requirements/" + os.environ.get("APP_NAME") + "/requirements.txt").splitlines()
    text_list = [line.rstrip("\n") for line in text_list]

    for element in text_list:
        chapter_title = element.split(":")[0].strip()
        page_count = element.split(":")[1].strip()

        requirements[chapter_title] = int(page_count)

    return requirements


def extract_chapter_pages(uploaded_file_location):
    chapter_pages = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        chapter_regex = re.compile("(?:(C(?:hapter|HAPTER)) (\d)+(\.)?[ \n]*([A-Z][a-z/A-Z&/\- ]*)|(R(?:eferences|EFERENCES))|(A(?:bstract|BSTRACT))|(A(?:ppendix|PPENDIX)))( )*(\n)+")

        chapter_pages.append({"title": "TOTAL", "page": len(pdf.pages)})

        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            chapter_title = re.search(chapter_regex, text)

            if chapter_title:
                chapter_title = chapter_title.group()
                chapter_title = re.sub("[\n\t\.:]", " ", chapter_title).upper().strip()
                chapter_title = " ".join(chapter_title.split()[:2])

                chapter_pages.append({"title": chapter_title, "page": i})

    return chapter_pages


def extract_chapter_length(chapter_pages):
    chapter_length = []

    for i in range(len(chapter_pages)):
        if i > 0:
            current_chapter = {"title": chapter_pages[i]["title"]}

            if i != len(chapter_pages) - 1:
                length = chapter_pages[i + 1]["page"] - chapter_pages[i]["page"]
            else:
                length = chapter_pages[0]["page"] - chapter_pages[i]["page"]
            
            current_chapter["length"] = length
            chapter_length.append(current_chapter)
        else:
            chapter_length.append({"title": chapter_pages[i]["title"], "length": chapter_pages[i]["page"]})
    
    return chapter_length


def check_with_requirements(requirements, chapter_length):
    count = len(requirements.keys())

    for chapter in chapter_length:
        if chapter["title"] in requirements:
            title = chapter["title"]
            
            if (chapter["length"] >= requirements[title]):
                chapter["status"] = "Exceeded"
            else:
                chapter["status"] = "Not enough"
                count -= 1

    grade = int(round(count * 100/len(requirements.keys()), 0))
    
    return (chapter_length, grade)


def insert_database(event_id, thesis_id, file_location, result):
    file_name = os.path.basename(file_location)
    uploaded_time = datetime.utcnow()

    db = Database()
    db.insert("INSERT INTO output (id, thesis_id, file_name, file_location, result, uploaded_time) VALUES (%s, %s, %s, %s, %s, %s)", (event_id, thesis_id, file_name, file_location, result, uploaded_time))

    print("inserted in db", flush=True)


def output_file(cloud_file_location):
    start_time = timeit.default_timer()

    file_name = os.path.basename(cloud_file_location).split(".")[0]
    service_type = os.environ.get("APP_NAME")
    thesis_id = file_name
    event_id = str(uuid.uuid4())

    producer = Producer()

    uploaded_file_location = get_file_from_bucket(cloud_file_location)
    producer.publish_status(event_id, thesis_id, service_type, "Processing")

    try:
        requirements = get_requirements()
        chapter_pages = extract_chapter_pages(uploaded_file_location)
        chapter_length = extract_chapter_length(chapter_pages)
        (chapter_length, grade) = check_with_requirements(requirements, chapter_length)

        output = "Page count required for each chapter: \n"
        for chapter in requirements:
            output += chapter + ": " + str(requirements[chapter]) + "\n"
        output += "\n"

        output += "Page count detected in document: \n"
        for chapter in chapter_length:
            if "status" in chapter:
                output += chapter["title"] + ": " + str(chapter["length"]) + "\n"
        output += "\n"

        output += "Comparison: \n"
        for chapter in chapter_length:
            if "status" in chapter:
                output += chapter["title"] + ": " + chapter["status"] + "\n"
        output += "\n"

        result = "Pass" if grade > 50 else "Fail"
        output += "Percentage: " + str(grade) + "%\n"
        output += "Service result: " + result + "\n"

        output_file_location = write_to_bucket(file_name, output)
        print("\nTime for " + os.environ.get("APP_NAME") + " to process file " + file_name + " is " + str(timeit.default_timer() - start_time) + "\n", flush=True)

        print("finished uploading to bucket for " + os.environ.get("APP_NAME"), flush=True)

        remove_file_from_dir(uploaded_file_location)
        
        insert_database(event_id, thesis_id, output_file_location, result)

        producer.publish_message(event_id, thesis_id, service_type, output_file_location, result)

        print("Processing complete in " + os.environ.get("APP_NAME"), flush=True)
    except:
        producer.publish_status(event_id, thesis_id, service_type, "Service error")  

