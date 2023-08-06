from consumer import Consumer
from dotenv import load_dotenv
import sys, os

def main():
    load_dotenv()

    print("in main " + os.environ["APP_NAME"], flush=True)

    consumer = Consumer()
    consumer.consume_message()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)