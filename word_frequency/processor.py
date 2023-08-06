import os
import re
import uuid
import timeit
import pdfplumber

from database import Database
from producer import Producer
from datetime import datetime
from dotenv import load_dotenv
from collections import Counter
from file_manager import get_file_from_bucket, remove_file_from_dir, write_to_bucket, get_text_from_bucket

load_dotenv()


def get_template():
    word_list = get_text_from_bucket("requirements/" + os.environ.get("APP_NAME") + "/requirements.txt").splitlines()

    return word_list


def get_most_common_words(uploaded_file_location):
    word_list = []
    with pdfplumber.open(uploaded_file_location) as pdf:
        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text().splitlines()

            for line in text:
                words = line.split(" ")
                for word in words:
                    if word.isalpha():
                        word_list.append(word)

    return word_list


def eliminate_template_words(word_list):
    template_words = get_template()
    word_list = [word.lower() for word in word_list]
    most_common_words = []

    for word in word_list:
        if word not in template_words:
            most_common_words.append(word)

    most_common_words = Counter(most_common_words)
    return most_common_words.most_common(20)


def get_abstract(uploaded_file_location):
    abstract_content = ""

    with pdfplumber.open(uploaded_file_location) as pdf:
        abstract_regex = re.compile("(?m)^(A(?:bstract|BSTRACT))( )*(\n)+")
        chapter_regex = re.compile("(?m)^(?:(C(?:hapter|HAPTER)) ( )*(\d)+(\.)?[ \n]*([A-Z][a-z/A-Z&/\- ]*))( )*(\n)+")

        abstract_page = 100
        first_chapter_page = 0

        for i in range(len(pdf.pages)):
            page = pdf.pages[i]
            text = page.extract_text()

            abstract = re.search(abstract_regex, text)
            chapter = re.search(chapter_regex, text)

            if abstract:
                abstract_page = i

            if chapter:
                first_chapter_page = i
                break
        
        if first_chapter_page > abstract_page:
            for i in range(abstract_page, first_chapter_page):
                page = pdf.pages[i]
                text = page.extract_text()

                abstract_content += text

    return abstract_content


def get_abstract_keywords(abstract_content):
    text = abstract_content.splitlines()
    word_list = []

    for line in text:
        words = line.split(" ")
        for word in words:
            if word.isalpha():
                word_list.append(word)

    keywords = eliminate_template_words(word_list)
    keywords = list(filter(lambda word: word[1] > 1, keywords))
    
    return keywords


def get_similar_keywords(abstract_keywords, most_common_words):
    abstract_keywords = [word[0] for word in abstract_keywords]
    similar_keywords = []

    for word in most_common_words:
        if word[0] in abstract_keywords:
            similar_keywords.append(word[0])

    return similar_keywords


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
        word_list = get_most_common_words(uploaded_file_location)
        most_common_words = eliminate_template_words(word_list)
        abstract_content = get_abstract(uploaded_file_location)

        if abstract_content:
            abstract_keywords = get_abstract_keywords(abstract_content)
            similar_keywords = get_similar_keywords(abstract_keywords, most_common_words)

        output = "Keywords extracted from entire report: \n"
        
        for word in most_common_words:
            output += word[0] + ": " + str(word[1])
            output += "\n"

        if abstract_keywords:
            output += "\nKeywords extracted from Abstract: \n"
            for word in abstract_keywords:
                output += word[0] + ": " + str(word[1])
                output += "\n"

            output += "\nOverlapping keywords: "
            for index, word in enumerate(similar_keywords):
                output += word
                if index != (len(similar_keywords) - 1):
                    output += ", "

        result = "None"
        
        output_file_location = write_to_bucket(file_name, output)
        print("\nTime for " + os.environ.get("APP_NAME") + " to process file " + file_name + " is " + str(timeit.default_timer() - start_time) + "\n", flush=True)

        print("finished uploading to bucket for " + os.environ.get("APP_NAME"), flush=True)

        remove_file_from_dir(uploaded_file_location)
        
        insert_database(event_id, thesis_id, output_file_location, result)

        producer.publish_message(event_id, thesis_id, service_type, output_file_location, result)

        print("Processing complete in " + os.environ.get("APP_NAME"), flush=True)
    except:
        producer.publish_status(event_id, thesis_id, service_type, "Service error")
