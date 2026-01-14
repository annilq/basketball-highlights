# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install uv package manager
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Copy the current directory contents into the container at /app
COPY . /app

# Install project dependencies using uv
RUN /root/.local/bin/uv install

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV MODEL_PATH=/app/best.pt

# Run app.py when the container launches
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
