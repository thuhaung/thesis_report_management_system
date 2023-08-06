import re
import os
import uuid
import timeit
import pdfplumber
import Levenshtein

from dotenv import load_dotenv
from datetime import datetime
from database import Database
from producer import Producer
from file_manager import get_file_from_bucket, remove_file_from_dir, write_to_bucket, get_text_from_bucket

load_dotenv()

def extract_chapter_titles(uploaded_file_location):
    chapter_titles = []
    chapter_regex = re.compile("(?:(C(?:hapter|HAPTER)) (\d)+(\.)?[ \n]*([A-Z][a-z/A-Z&/\- ]*)|(R(?:eferences|EFERENCES))|(A(?:bstract|BSTRACT))|(A(?:ppendix|PPENDIX)))( )*(\n)+")
    
    with pdfplumber.open(uploaded_file_location) as pdf:
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            chapter_title = re.search(chapter_regex, text)
            if chapter_title:
                chapter_title = chapter_title.group()
                chapter_title = re.sub("[\n\t\.:]", " ", chapter_title).upper().strip()
                chapter_title = " ".join(chapter_title.split())

                chapter_titles.append(chapter_title)

    return chapter_titles


def get_template():
    template_titles = get_text_from_bucket("requirements/" + os.environ.get("APP_NAME") + "/requirements.txt").splitlines()
    template_titles = [line.rstrip("\n").upper() for line in template_titles]

    return template_titles


def get_missing_titles(template_titles, chapter_titles):
    missing_titles = template_titles[:]

    for template_chapter in template_titles:
        template_title = " ".join(template_chapter.split(" ")[:2])
        
        for chapter_title in chapter_titles:
            if template_title in chapter_title:
                if template_chapter in missing_titles:
                    missing_titles.remove(template_chapter)

    return missing_titles


def check_with_template(template_titles, chapter_titles):
    different_titles = []
    title_comparison = {}
    missing_titles = get_missing_titles(template_titles, chapter_titles)
    count = 9 - len(missing_titles)

    for template_title in template_titles:
        if (template_title not in chapter_titles) and (template_title not in missing_titles):
            different_titles.append(template_title)

    if len(different_titles) > 0:
        title_comparison = dict.fromkeys(different_titles)

        for different_title in different_titles:
            different_title_truncate = " ".join(different_title.split(" ")[:2])
            for chapter_title in chapter_titles:
                chapter_title_truncate = " ".join(chapter_title.split(" ")[:2])
                if different_title_truncate == chapter_title_truncate:
                    title_comparison[different_title] = chapter_title
                    count -= (1 - Levenshtein.ratio(different_title, chapter_title))

    grade = int(round(count * 100 / len(template_titles), 0))

    return (title_comparison, missing_titles, grade)


def insert_database(event_id, thesis_id, file_location, result):
    file_name = os.path.basename(file_location)
    uploaded_time = datetime.utcnow()

    db = Database()
    db.insert("INSERT INTO output (id, thesis_id, file_name, file_location, result, uploaded_time) VALUES (%s, %s, %s, %s, %s, %s)", (event_id, thesis_id, file_name, file_location, result, uploaded_time))

    print("inserted in db", flush=True)


def output_file(cloud_file_location):
    start_time = timeit.default_timer()

    event_id = str(uuid.uuid4())
    file_name = os.path.basename(cloud_file_location).split(".")[0]
    service_type = os.environ.get("APP_NAME")
    thesis_id = file_name

    producer = Producer()

    uploaded_file_location = get_file_from_bucket(cloud_file_location)
    producer.publish_status(event_id, thesis_id, service_type, "Processing")    

    try:
        chapter_titles = extract_chapter_titles(uploaded_file_location)
        template_titles = get_template()
        (different_titles, missing_titles, grade) = check_with_template(template_titles, chapter_titles)

        output = "Chapter titles according to template: \n"
        
        for title in template_titles:
            output += str(title) + "\n"
        output += "\n"

        output += "Chapter titles detected in document: \n"
        for title in chapter_titles:
            output += str(title) + "\n"
        output += "\n"

        if len(missing_titles) > 0:
            output += "Missing chapters: \n"
            for title in missing_titles:
                output += str(title) + "\n"
            output += "\n"

        if len(different_titles) > 0:
            output += "Chapter titles that are different from template:\n"
            for title in different_titles:
                output += str(different_titles[title]) + " vs. " + str(title) + "\n"
            output += "\n"
        
            result = "Pass" if grade > 50 else "Fail"
            output += "Similarity percentage: " + str(grade) + "%\n"
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
    
