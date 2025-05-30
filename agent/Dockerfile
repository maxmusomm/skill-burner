FROM python:3.13-alpine

WORKDIR /app

# Install system dependencies required for WeasyPrint
RUN apk add weasyprint

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD adk api_server