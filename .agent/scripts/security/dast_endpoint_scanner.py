#!/usr/bin/env python3
import os
import re
import sys

def scan_endpoints(directory):
    endpoints = []
    # Regex to catch common Express-like route definitions: router.get('/path', ...)
    route_pattern = re.compile(r'\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]')
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.js')):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                    matches = route_pattern.findall(content)
                    for method, endpoint in matches:
                        endpoints.append({
                            'method': method.upper(),
                            'path': endpoint,
                            'file': path
                        })
    return endpoints

def fuzz_test(endpoints):
    print(f"--- DAST Endpoint Scan: Discovered {len(endpoints)} routes ---")
    for ep in endpoints:
        print(f"[{ep['method']}] {ep['path']} (Found in: {os.path.basename(ep['file'])})")
    
    print("\n--- Safety Fuzzing Simulation ---")
    # In a real DAST, this would make HTTP requests. 
    # For local dev validation, we simulate finding vulnerabilities based on patterns.
    for ep in endpoints:
        if ":" in ep['path']:
            print(f"⚠️  [POTENTIAL IDOR] Dynamic parameter found in {ep['path']}. Ensure ownership checks are implemented.")
        
        if ep['method'] == 'POST' or ep['method'] == 'PUT':
            print(f"🔍 [MASS ASSIGNMENT] POST/PUT detected at {ep['path']}. Check for object spread from req.body.")

if __name__ == "__main__":
    backend_src = "apps/backend/src"
    if not os.path.exists(backend_src):
        print(f"Error: {backend_src} not found.")
        sys.exit(1)
        
    discovered = scan_endpoints(backend_src)
    fuzz_test(discovered)
