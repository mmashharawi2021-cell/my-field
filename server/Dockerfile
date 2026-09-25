FROM python:3.13-slim

WORKDIR /app

COPY . .
RUN pip install --no-cache-dir . \
    && chmod +x /app/start.sh

CMD ["/app/start.sh"]
