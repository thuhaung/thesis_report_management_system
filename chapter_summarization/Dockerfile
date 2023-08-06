FROM python:latest
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
RUN python -m nltk.downloader punkt
COPY . .
CMD ["python", "main.py"]