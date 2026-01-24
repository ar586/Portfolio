# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (needed for some python packages like sentence-transformers/numpy)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Make port 2509 available to the world outside this container
EXPOSE 2509

# Run app.main:app when the container launches
# Host 0.0.0.0 is required for Docker containers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "2509"]
