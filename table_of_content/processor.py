import re
import os
import uuid
import timeit
import pdfplumber

from database import Database
from producer import Producer
from datetime import datetime
from dotenv import load_dotenv
from file_manager import get_file_from_bucket, remove_file_from_dir, write_to_bucket

load_dotenv()

def extract_chapter_titles(uploaded_file_location):
    chapter_titles = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        chapter_regex = re.compile("(?:(C(?:hapter|HAPTER)) ( )*(\d)+(\.)?[ \n]*([A-Z][a-z/A-Z&/\- ]*)|(R(?:eferences|EFERENCES))|(A(?:bstract|BSTRACT))|(A(?:ppendix|PPENDIX)))( )*(\n)+")
        starting_index = 0

        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            if (i == 0) and (text[-1].isdigit()) and (int(text[-1]) == 1):
                starting_index = 1
            elif (i == 1) and (text[-1].isdigit()):
                if int(text[-1]) == 2:
                    starting_index = 1

            chapter = re.findall(chapter_regex, text)
            
            if chapter:
                trimmed_title = []
                chapter_title = ""
                chapter[0] = list(filter(None, chapter[0]))

                for x in chapter[0]:
                    if x != "\n":
                        trimmed_title.append(x)
                
                page_num = int(i + starting_index)
                if len(trimmed_title) > 1:
                    chapter_title = " ".join(trimmed_title[:2]).strip()
                else:
                    chapter_title = trimmed_title[0].strip()

                element = {"title": chapter_title.upper(), "page": page_num}
                chapter_titles.append(element)

    return chapter_titles


def extract_table_chapter_titles(uploaded_file_location):
    table_chapter_titles = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        chapter_regex = re.compile("(?:(C(?:hapter|HAPTER)) (\d)+(\.)?[ \n]*([A-Z][a-z/A-Z&/\- ]*)?|(R(?:eferences|EFERENCES))|(A(?:bstract|BSTRACT))|(A(?:ppendix|PPENDIX)))( )*(\.| )+(.*?\d+)")

        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()
            
            chapter = re.findall(chapter_regex, text)
            
            if chapter and i < 10:
                for title in chapter:
                    trimmed_title = []
                    title = list(filter(None, title))

                    for x in title:
                        if (x != "\n") or (x != "."):
                            trimmed_title.append(x.strip())

                    chapter_title = " ".join(trimmed_title[:2]).strip()
                    page_num = int(trimmed_title[-1])
                    element = {"title": chapter_title.upper(), "page": page_num}
                    table_chapter_titles.append(element)
    
    return table_chapter_titles


def extract_section_titles(uploaded_file_location):
    section_titles = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        section_regex = re.compile("(?m)^(\d\.)+(\d)*( )*[a-zA-Z0-9 ]+[a-zA-Z0-9\.]{,2}[a-zA-Z0-9 /:()-]*( )*(\n)+")
        starting_index = 0
        
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            if (i == 0) and (text[-1].isdigit()) and (int(text[-1]) == 1):
                starting_index = 1
            elif (i == 1) and (text[-1].isdigit()):
                if int(text[-1]) == 2:
                    starting_index = 1

            section = re.finditer(section_regex, text)
            if section:
                for title in section:
                    title = title.group().strip("\n\t ")
                    section_title = title.split(" ")[0]
                    page_num = int(i + starting_index)
                    
                    element = {"title": section_title, "page": page_num}
                    section_titles.append(element)

    return section_titles           
            
            
def extract_table_section_titles(uploaded_file_location):
    table_section_titles = []

    with pdfplumber.open(uploaded_file_location) as pdf:
        section_regex = re.compile("(?m)^(\d\.)+(\d)*( \t)*[a-zA-Z0-9 ]+[a-zA-Z0-9\.]{,2}[a-zA-Z0-9 /:-]*[\. ]+(.*?\d+)(\n)+")

        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            section = re.finditer(section_regex, text)
            if section:
                for title in section:
                    title = title.group().strip("\n\t ")
                    section_title = title.split(" ")[0]
                    page_num = int(title.split(" ")[-1])

                    element = {"title": section_title, "page": page_num}
                    table_section_titles.append(element)

    return table_section_titles


def check_chapter_titles(chapter_titles, table_chapter_titles):
    incorrect_titles = []
    missing_titles = {}

    for chapter in chapter_titles:
        for table_chapter in table_chapter_titles:
            if (chapter["title"] == table_chapter["title"]) and (chapter["page"] != table_chapter["page"]):
                missing_titles[chapter["title"]] = False
                
                if chapter["title"] not in incorrect_titles:
                    incorrect_titles.append(chapter["title"])

            elif (chapter["title"] != table_chapter["title"]):
                if chapter["title"] not in missing_titles:
                    missing_titles[chapter["title"]] = True

            elif (chapter["title"] == table_chapter["title"]) and (chapter["page"] == table_chapter["page"]):
                missing_titles[chapter["title"]] = False

    return (incorrect_titles, missing_titles)


def check_section_titles(section_titles, table_section_titles):
    incorrect_titles = []
    missing_titles = {}

    for section in section_titles:
        for table_section in table_section_titles:
            if (section["title"] == table_section["title"]) and (section["page"] != table_section["page"]):
                missing_titles[section["title"]] = False
                
                if section["title"] not in incorrect_titles:
                    incorrect_titles.append(section["title"])

            elif (section["title"] != table_section["title"]):
                if section["title"] not in missing_titles:
                    missing_titles[section["title"]] = True

            elif (section["title"] == table_section["title"]) and (section["page"] == table_section["page"]):
                missing_titles[section["title"]] = False
    
    return (incorrect_titles, missing_titles)


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
        table_chapter_titles = extract_table_chapter_titles(uploaded_file_location)

        section_titles = extract_section_titles(uploaded_file_location)
        table_section_titles = extract_table_section_titles(uploaded_file_location)
        
        (incorrect_chapter_titles, missing_chapter_titles) = check_chapter_titles(chapter_titles, table_chapter_titles)
        (incorrect_section_titles, missing_section_titles) = check_section_titles(section_titles, table_section_titles)
        
        output = "Table of content page number check.\nThis service detects if chapter and section titles are at the correct pages according to the table of content.\n"
        
        output += "\nChapter titles from table of content:\n"
        for chapter in table_chapter_titles:
            output += chapter["title"] + "....................." + str(chapter["page"]) + "\n"

        output += "\nSection titles from table of content:\n"
        for section in table_section_titles:
            output += section["title"] + "....................." + str(section["page"]) + "\n"

        count = len(chapter_titles) + len(section_titles)

        output += "\nResults:\n"
        if len(incorrect_chapter_titles) > 0:
            output += "Chapter titles with incorrect page numbers:\n"
            for title in incorrect_chapter_titles:
                count -= 0.3
                output += title + "\n"
            output += "\n"
        else:
            output += "All chapter titles have correct page numbers.\n"

        if True in list(missing_chapter_titles.values()):
            output += "Chapter titles that are not available in the table of content:\n"
            for title in missing_chapter_titles:
                if missing_chapter_titles[title]:
                    count -= 1
                    output += title + "\n"
            output += "\n"

        if len(incorrect_section_titles) > 0:
            output += "Section titles with incorrect page numbers:\n"
            for title in incorrect_section_titles:
                count -= 0.3
                output += title + "\n"
            output += "\n"
        else:
            output += "All section titles have correct page numbers.\n\n"

        if True in list(missing_section_titles.values()):
            output += "Section titles that are not available in the table of content:\n"
            for title in missing_section_titles:
                if missing_section_titles[title]:
                    count -= 1
                    output += title + "\n"
            output += "\n"

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
