# ---- Build the Spring Boot backend ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn -B dependency:go-offline
COPY backend/src ./src
RUN mvn -B -DskipTests package && mv target/*.jar target/app.jar

# ---- Runtime: JRE + the Python/YOLO side the backend shells out to ----
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Shared libs opencv-python needs to import in a headless container, plus
# libgomp for torch. Nothing GUI-related is ever actually opened.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip \
      libgl1 libglib2.0-0 libsm6 libxext6 libxrender1 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# CPU-only torch first, so ultralytics' install doesn't pull the multi-GB CUDA build.
RUN pip3 install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip3 install --no-cache-dir ultralytics

# Only what object_detection_YOLO.py needs at inference time — not the
# training/eval datasets or venv that live alongside it in the repo.
COPY python/object_detection_YOLO.py python/data.yaml python/trained_YOLO8.pt ./python/

COPY --from=build /app/target/app.jar ./app.jar

ENV PYTHON_DIR=/app/python
ENV PYTHON_EXECUTABLE=python3
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
