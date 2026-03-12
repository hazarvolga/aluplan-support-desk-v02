#!/usr/bin/env python3
import os
import re
import sys

def check_middleware(directory):
    print("--- Semantic SAST: Middleware Validation ---")
    # Identify files that likely contain routes
    route_file_pattern = re.compile(r'routes|api')
    # Look for route definitions that MIGHT miss auth middleware
    # Example: router.get('/', controller.handle) vs router.get('/', auth, controller.handle)
    missing_auth_pattern = re.compile(r'\.(get|post|put|delete|patch)\s*\(\s*[\'"][^\'"]+[\'"]\s*,\s*([a-zA-Z0-9_\.]+)\s*\)')

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.js')) and route_file_pattern.search(file):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                    matches = missing_auth_pattern.findall(content)
                    for method, handler in matches:
                        print(f"⚠️  [MISSING MIDDLEWARE] {method.upper()} route in {os.path.basename(path)} might be missing auth/validation middleware. Handler: {handler}")

def check_mass_assignment(directory):
    print("\n--- Semantic SAST: Mass Assignment Detection ---")
    # Patterns like: new User(req.body) or { ...req.body }
    mass_assign_patterns = [
        re.compile(r'new\s+[A-Z][a-zA-Z0-9_]+\s*\(\s*req\.body\s*\)'),
        re.compile(r'\.\.\.req\.body'),
        re.compile(r'Object\.assign\s*\(\s*[^,]+,\s*req\.body\s*\)')
    ]

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.js')):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    for i, line in enumerate(f, 1):
                        for pattern in mass_assign_patterns:
                            if pattern.search(line):
                                print(f"❌ [MASS ASSIGNMENT] Potential vulnerability in {os.path.basename(path)}:L{i}")
                                print(f"   Line: {line.strip()}")

if __name__ == "__main__":
    backend_src = "apps/backend/src"
    if not os.path.exists(backend_src):
        print(f"Error: {backend_src} not found.")
        sys.exit(1)
    
    check_middleware(backend_src)
    check_mass_assignment(backend_src)
