#!/usr/bin/env python3
import os
import re
import sys

def audit_dockerfiles(directory):
    print("--- Infra Security: Docker Hardening Audit ---")
    for root, _, files in os.walk(directory):
        for file in files:
            if file == "Dockerfile":
                path = os.path.join(root, file)
                print(f"Auditing {path}...")
                with open(path, 'r') as f:
                    content = f.read()
                    if "USER" not in content:
                        print(f"🚩 [ROOT USER] {path} is missing a non-root USER instruction.")
                    if "CMD" not in content and "ENTRYPOINT" not in content:
                        print(f"⚠️  [{path}] Missing executable entry point (CMD/ENTRYPOINT).")

def audit_workflow_secrets(directory):
    print("\n--- Infra Security: Workflow Secret Audit ---")
    # Search for hardcoded tokens in YAMLs
    secret_pattern = re.compile(r'(password|token|secret|key|api_key)\s*:\s*[\'"][a-zA-Z0-9_-]+[\'"]', re.I)
    
    for root, _, files in os.walk(directory):
        if ".github" in root:
            for file in files:
                if file.endswith((".yml", ".yaml")):
                    path = os.path.join(root, file)
                    with open(path, 'r') as f:
                        for i, line in enumerate(f, 1):
                            if secret_pattern.search(line):
                                print(f"🚩 [STATIC SECRET] Possible hardcoded secret in GitHub Action: {os.path.basename(path)}:L{i}")

if __name__ == "__main__":
    audit_dockerfiles(".")
    audit_workflow_secrets(".")
