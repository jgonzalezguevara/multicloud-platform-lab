from flask import Flask, jsonify, render_template, request
import subprocess

app = Flask(__name__)


FLOCI_PROVIDERS = {
    "aws": {
        "container": "floci-aws",
        "endpoint": "http://127.0.0.1:4566",
    },
    "azure": {
        "container": "floci-azure",
        "endpoint": "http://127.0.0.1:4577",
    },
    "gcp": {
        "container": "floci-gcp",
        "endpoint": "http://127.0.0.1:4588",
    },
    "oci": {
        "container": "floci-oci",
        "endpoint": "http://127.0.0.1:4599",
    },
}


def docker_status(container):
    result = subprocess.run(
        [
            "docker",
            "inspect",
            "--format",
            "{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}",
            container,
        ],
        capture_output=True,
        text=True,
        timeout=3,
    )

    if result.returncode != 0:
        return {
            "running": False,
            "status": "missing",
            "health": "unknown",
        }

    status, health = result.stdout.strip().split("|", 1)

    return {
        "running": status == "running",
        "status": status,
        "health": health,
    }


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/health")
def health():
    return jsonify({
        "service": "multicloud-lab-console",
        "status": "ok",
    })


@app.get("/api/providers")
def providers():
    data = {}

    for name, config in FLOCI_PROVIDERS.items():
        state = docker_status(config["container"])

        data[name] = {
            "container": config["container"],
            "endpoint": config["endpoint"],
            **state,
        }

    return jsonify(data)



@app.get("/api/aws")
def aws_status():
    workdir = "/opt/multicloud-platform-lab/platforms/aws"

    def run(command, env=None):
        import os

        process_env = os.environ.copy()
        if env:
            process_env.update(env)

        result = subprocess.run(
            command,
            cwd=workdir,
            capture_output=True,
            text=True,
            timeout=10,
            env=process_env,
        )

        return {
            "ok": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
        }

    configuration = run([
        "grep", "-R", "^resource ",
        "--include=*.tf", "."
    ])

    state = run(["tofu", "state", "list"])

    reality = run(
        [
            "aws",
            "--endpoint-url", "http://127.0.0.1:4566",
            "s3api", "list-buckets",
            "--query", "Buckets[].Name",
            "--output", "text",
        ],
        env={
            "AWS_ACCESS_KEY_ID": "test",
            "AWS_SECRET_ACCESS_KEY": "test",
            "AWS_DEFAULT_REGION": "eu-west-1",
        },
    )

    config_resources = [
        line.split(":", 1)[1].strip()
        for line in configuration["stdout"].splitlines()
        if ":" in line
    ]

    state_resources = [
        line.strip()
        for line in state["stdout"].splitlines()
        if line.strip()
    ]

    buckets = [
        name
        for name in reality["stdout"].split()
        if name
    ]

    expected_bucket = "multicloud-platform-lab"

    synchronized = (
        'resource "aws_s3_bucket" "lab" {' in config_resources
        and "aws_s3_bucket.lab" in state_resources
        and expected_bucket in buckets
    )

    return jsonify({
        "provider": "aws",
        "configuration": config_resources,
        "state": state_resources,
        "reality": {
            "s3_buckets": buckets,
        },
        "synchronized": synchronized,
    })


PLAN_ROOT = "/opt/multicloud-platform-lab/runtime/plans"

AWS_S3_PROVIDER = r"""
terraform {
  required_version = ">= 1.12.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.65.0"
    }
  }
}

provider "aws" {
  region                      = "eu-west-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3 = "http://127.0.0.1:4566"
  }
}
"""


def run_tofu(command, workdir, timeout=120):
    import os

    process_env = os.environ.copy()
    process_env["TF_PLUGIN_CACHE_DIR"] = (
        "/opt/multicloud-platform-lab/runtime/plugin-cache"
    )

    result = subprocess.run(
        command,
        cwd=workdir,
        capture_output=True,
        text=True,
        timeout=timeout,
        env=process_env,
    )

    return {
        "ok": result.returncode == 0,
        "returncode": result.returncode,
        "stdout": result.stdout.strip(),
        "stderr": result.stderr.strip(),
    }


@app.post("/api/plan")
def tofu_plan():
    from pathlib import Path
    import re
    import shutil
    import uuid

    payload = request.get_json(silent=True) or {}

    provider = payload.get("provider")
    resource = payload.get("resource")
    configuration = payload.get("configuration", "")

    if provider != "aws" or resource != "S3":
        return jsonify({
            "ok": False,
            "error": "Planning is currently enabled only for AWS / S3.",
        }), 400

    if not isinstance(configuration, str) or not configuration.strip():
        return jsonify({
            "ok": False,
            "error": "OpenTofu configuration is empty.",
        }), 400

    if len(configuration) > 50000:
        return jsonify({
            "ok": False,
            "error": "OpenTofu configuration exceeds the allowed size.",
        }), 400

    allowed_resources = {
        "aws_s3_bucket",
        "aws_s3_bucket_versioning",
    }

    resource_types = set(
        re.findall(r'resource\s+"([^"]+)"\s+"[^"]+"\s*\{', configuration)
    )

    if not resource_types:
        return jsonify({
            "ok": False,
            "error": "No OpenTofu resource was detected.",
        }), 400

    unsupported = sorted(resource_types - allowed_resources)

    if unsupported:
        return jsonify({
            "ok": False,
            "error": "Unsupported resource types.",
            "unsupported": unsupported,
        }), 400

    run_id = uuid.uuid4().hex[:12]
    workdir = Path(PLAN_ROOT) / run_id
    workdir.mkdir(parents=True, mode=0o700)

    try:
        (workdir / "provider.tf").write_text(AWS_S3_PROVIDER)
        (workdir / "main.tf").write_text(configuration)

        fmt = run_tofu(
            ["tofu", "fmt", "-no-color", "."],
            str(workdir),
            30,
        )

        if not fmt["ok"]:
            return jsonify({
                "ok": False,
                "stage": "fmt",
                "run_id": run_id,
                **fmt,
            }), 400

        init = run_tofu(
            ["tofu", "init", "-backend=false", "-input=false", "-no-color"],
            str(workdir),
            120,
        )

        if not init["ok"]:
            return jsonify({
                "ok": False,
                "stage": "init",
                "run_id": run_id,
                **init,
            }), 400

        validate = run_tofu(
            ["tofu", "validate", "-no-color"],
            str(workdir),
            30,
        )

        if not validate["ok"]:
            return jsonify({
                "ok": False,
                "stage": "validate",
                "run_id": run_id,
                **validate,
            }), 400

        plan = run_tofu(
            [
                "tofu",
                "plan",
                "-refresh=false",
                "-input=false",
                "-lock=false",
                "-no-color",
                "-out=tfplan",
            ],
            str(workdir),
            120,
        )

        return jsonify({
            "ok": plan["ok"],
            "stage": "plan",
            "run_id": run_id,
            "fmt": fmt,
            "init": {
                "ok": init["ok"],
                "returncode": init["returncode"],
            },
            "validate": validate,
            "plan": plan,
        }), 200 if plan["ok"] else 400

    except subprocess.TimeoutExpired as exc:
        return jsonify({
            "ok": False,
            "stage": "timeout",
            "run_id": run_id,
            "error": f"Command timed out: {exc.cmd}",
        }), 504

    except Exception as exc:
        return jsonify({
            "ok": False,
            "stage": "internal",
            "run_id": run_id,
            "error": str(exc),
        }), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
