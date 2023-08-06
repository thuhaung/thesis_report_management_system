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

def get_template():
    template = get_text_from_bucket("requirements/" + os.environ.get("APP_NAME") + "/requirements.txt").splitlines()

    return template


def extract_chapter_titles(uploaded_file_location):
    chapter_titles = []
    chapter_regex = re.compile("(?:(C(?:hapter|HAPTER)) (\d)+(\.)?[ \n]*([A-Z][a-z/A-Z&/\- ]*)|(R(?:eferences|EFERENCES))|(A(?:bstract|BSTRACT))|(A(?:ppendix|PPENDIX)))( )*(\n)+")
    
    with pdfplumber.open(uploaded_file_location) as pdf:
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            chapter_title = re.search(chapter_regex, text)
            if chapter_title:
                chapter_title = chapter_title.group().replace("\n", " ").upper().strip()
                chapter_titles.append(chapter_title)

    return chapter_titles


def extract_section_titles(uploaded_file_location):
    section_titles = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        section_regex = re.compile("(?m)^(\d\.)(\d)?( )*[a-zA-Z0-9 ]+[a-zA-Z0-9\.]{,2}[a-zA-Z0-9 /:-]*( )*(\n)+")
        starting_index = 0
        
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            if i == 0:
                if (text[-1].isdigit()) and (int(text[-1]) == 1):
                    starting_index = 1

            section = re.finditer(section_regex, text)
            if section:
                for title in section:
                    title = title.group().strip("\n\t: ")

                    section_titles.append(title)

    return section_titles    


def get_bold_large_words(uploaded_file_location):
    bold_large_words = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]

            words = page.extract_words(extra_attrs=["fontname", "size"])
            
            bold_words = []

            for word in words:
                if "Bold" in word["fontname"] and round(word["size"]) == 14:
                    bold_words.append(word["text"].strip())
            
            if len(bold_words) > 0:
                bold_large_words.append(bold_words)

    return bold_large_words


def get_bold_medium_words(uploaded_file_location):
    bold_medium_words = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]

            words = page.extract_words(extra_attrs=["fontname", "size"])
            
            bold_words = []

            for word in words:
                if "Bold" in word["fontname"] and round(word["size"]) == 13:
                    bold_words.append(word["text"].strip())
            
            if len(bold_words) > 0:
                bold_medium_words.append(bold_words)

    return bold_medium_words


def check_chapter_titles(chapter_titles, bold_large_words):
    formatted_chapter_titles = []
    unformatted_chapter_titles = []

    for page in bold_large_words:
        title = " ".join([word for word in page])
        
        if title in chapter_titles:
            formatted_chapter_titles.append(title)

    for title in chapter_titles:
        if title not in formatted_chapter_titles:
            unformatted_chapter_titles.append(title)

    return (formatted_chapter_titles, unformatted_chapter_titles)


def check_section_titles(section_titles, bold_medium_words):
    formatted_section_titles = []
    unformatted_section_titles = []

    for page in bold_medium_words:
        for i in range(len(page)):
            title = page[i]
            for j in range(i + 1, len(page)):
                title += " " + page[j]
                
                if title in section_titles:
                    formatted_section_titles.append(title)
                    i = j + 1
                    break

    for title in section_titles:
        if title not in formatted_section_titles:
            unformatted_section_titles.append(title)

    return (formatted_section_titles, unformatted_section_titles)


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
        template = get_template()

        chapter_titles = extract_chapter_titles(uploaded_file_location)
        section_titles = extract_section_titles(uploaded_file_location)

        bold_large_words = get_bold_large_words(uploaded_file_location)
        bold_medium_words = get_bold_medium_words(uploaded_file_location)

        (formatted_chapter_titles, unformatted_chapter_titles) = check_chapter_titles(chapter_titles, bold_large_words)
        (formatted_section_titles, unformatted_section_titles) = check_section_titles(section_titles, bold_medium_words)

        output = "According to the guidelines, chapter and main section titles should have the following format: \n"

        for text in template:
            output += text + "\n"
        output += "\n"

        count = len(chapter_titles) + len(section_titles)

        output += "Chapter titles detected: \n"
        for title in chapter_titles:
            output += title
            if title in unformatted_chapter_titles:
                count -= 1
                output += ": Incorrect"
            else: 
                output += ": Correct"
            output += "\n"
        output +=" \n"

        output += "Main section titles detected: \n"
        for title in section_titles:
            output += title
            if title in unformatted_section_titles:
                count -= 1
                output += ": Incorrect"
            else:
                output += ": Correct"
            output += "\n"
        output +=" \n"

        grade = int(round(count * 100 / (len(chapter_titles) + len(section_titles)), 0))
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
