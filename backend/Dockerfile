FROM python:3.11-slim

WORKDIR /app

COPY ./app /app/app
COPY requirements.txt /app/requirements.txt
COPY create_superuser.py /app/create_superuser.py

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 