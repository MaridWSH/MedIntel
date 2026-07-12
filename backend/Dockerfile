# Dockerfile for the MedIntel FastAPI backend
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies required for psycopg2 and sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy production requirements first to leverage Docker layer caching
COPY requirements.txt .

# Install Python dependencies. The requirements.txt uses PyTorch's CPU-only
# extra index so CUDA packages are not downloaded.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY . /app/backend

# Set environment defaults
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/backend

EXPOSE 8000

# Run uvicorn from the backend package directory
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
