import os
import pika
import json
from dotenv import load_dotenv

class Producer:
    def __init__(self):
        load_dotenv()

        self.output_location_exchange = os.environ.get("RABBITMQ_OUTPUT_LOCATION_EXCHANGE")
        self.output_location_queue = os.environ.get("RABBITMQ_OUTPUT_LOCATION_EXCHANGE")
        self.host = os.environ.get("RABBITMQ_HOST")
        self.port = os.environ.get("RABBITMQ_PORT")
        self.user = os.environ.get("RABBITMQ_USER")
        self.password = os.environ.get("RABBITMQ_PASSWORD")
        self.connection = self.connect()

    def connect(self):
        parameters = pika.ConnectionParameters(self.host, self.port, "/", pika.PlainCredentials(self.user, self.password))
        return pika.BlockingConnection(parameters)
    
    def publish_status(self, event_id, thesis_id, service_type, status):
        channel = self.connection.channel()

        message = {
            "id": event_id,
            "thesis_id": thesis_id,
            "service_type": service_type,
            "service_status": status
        }

        channel.queue_declare(queue=self.output_location_queue, durable=True)
        channel.basic_publish(exchange=self.output_location_exchange, routing_key=self.output_location_queue, body=json.dumps(message))

        print("\nStatus of event " + str(event_id) + " in " + service_type + ": " + status, flush=True)

    def publish_message(self, event_id, thesis_id, service_type, output_location, result):
        channel = self.connection.channel()

        message = {
            "id": event_id,
            "thesis_id": thesis_id,
            "service_type": service_type,
            "output_location": output_location,
            "service_status": "Finished",
            "result": result
        }

        channel.queue_declare(queue=self.output_location_queue, durable=True)
        channel.basic_publish(exchange=self.output_location_exchange, routing_key=self.output_location_queue, body=json.dumps(message))

        print("\nFile uploaded to bucket for " + event_id + ", result = " + result, flush=True)
        