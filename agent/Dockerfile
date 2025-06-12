FROM python:3.13-alpine

WORKDIR /app

# Install system dependencies required for WeasyPrint and fonts
RUN apk add --update weasyprint ttf-dejavu tzdata

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "$PORT"]