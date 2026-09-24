from flask import Flask, jsonify
import os
import socket

app = Flask(__name__)

@app.get("/")
def index():
    return jsonify(
        application="multicloud-platform-demo",
        status="running",
        hostname=socket.gethostname(),
        environment=os.getenv("APP_ENV", "lab"),
        platform=os.getenv("PLATFORM", "local")
    )

@app.get("/health")
def health():
    return jsonify(status="healthy"), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
