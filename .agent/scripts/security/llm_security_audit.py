#!/usr/bin/env python3
import os
import re
import sys

def scan_prompts(directory):
    print("--- LLM Security: Prompt Injection Scanning ---")
    # Identify prompt template files or strings
    prompt_patterns = [
        re.compile(r'PROMPT\s*='),
        re.compile(r'template\s*:\s*[`"]'),
        re.compile(r'SystemMessage\s*\(')
    ]
    
    # Dangerous instructions that shouldn't be user-controllable
    dangerous_instructions = [
        re.compile(r'Ignore\s+previous\s+instructions', re.I),
        re.compile(r'You\s+are\s+now\s+a', re.I),
        re.compile(r'Repeat\s+everything\s+above', re.I)
    ]

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.js', '.py')):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                    for p_pattern in prompt_patterns:
                        if p_pattern.search(content):
                            print(f"🔍 [PROMPT DETECTED] Found potential prompt definition in {os.path.basename(path)}")
                            for d_pattern in dangerous_instructions:
                                if d_pattern.search(content):
                                    print(f"🚩 [INSECURE PROMPT] Dangerous instruction pattern found in {os.path.basename(path)}")

def check_pii_filtering(directory):
    print("\n--- LLM Security: PII Leakage Checklist ---")
    # Look for calls to LLM services
    llm_call_pattern = re.compile(r'\.(generate|predict|invoke|chat)\s*\(')
    # Look for cleaning functions
    pii_filter_pattern = re.compile(r'(cleanPii|anonymize|maskSensitiveData)\s*\(')

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.js')):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                    if llm_call_pattern.search(content):
                        if not pii_filter_pattern.search(content):
                            print(f"⚠️  [PII EXPOSURE] {os.path.basename(path)} calls an LLM but doesn't seem to use PII filtering nearby.")

if __name__ == "__main__":
    src_dir = "apps" # Scan all apps for LLM usage
    if not os.path.exists(src_dir):
        print(f"Error: {src_dir} not found.")
        sys.exit(1)
    
    scan_prompts(src_dir)
    check_pii_filtering(src_dir)
