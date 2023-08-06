import pika
import os

from dotenv import load_dotenv
from processor import output_file

class Consumer:
    def __init__(self):
        load_dotenv()

        self.file_location_exchange = os.environ.get("RABBITMQ_FILE_LOCATION_EXCHANGE")
        self.file_location_queue = os.environ.get("APP_NAME")
        self.host = os.environ.get("RABBITMQ_HOST")
        self.port = os.environ.get("RABBITMQ_PORT")
        self.user = os.environ.get("RABBITMQ_USER")
        self.password = os.environ.get("RABBITMQ_PASSWORD")
        self.connection = self.connect()

    def connect(self):
        parameters = pika.ConnectionParameters(self.host, self.port, "/", pika.PlainCredentials(self.user, self.password))
        return pika.BlockingConnection(parameters)
    
    def consume_message(self):
        channel = self.connection.channel()
        
        channel.exchange_declare(exchange=self.file_location_exchange, exchange_type="fanout", durable=True)

        channel.queue_declare(queue=self.file_location_queue, durable=True)

        channel.queue_bind(exchange=self.file_location_exchange, queue=self.file_location_queue)

        def callback(ch, method, properties, body):
            uploaded_file_location = str(body.decode("utf-8"))
            print("Received " + uploaded_file_location, flush=True)

            output_file(uploaded_file_location)

        channel.basic_consume(queue=self.file_location_queue,
                                auto_ack=True,
                                on_message_callback=callback)
        channel.start_consuming()

