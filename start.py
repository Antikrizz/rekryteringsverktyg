import subprocess
import sys
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')

print("=== Bygger frontend ===")
result = subprocess.run(
    ['npm', 'run', 'build'],
    cwd=FRONTEND_DIR,
    shell=True
)

if result.returncode != 0:
    print("Fel vid bygge av frontend!")
    sys.exit(1)

print("\n=== Startar server ===")
print("Appen körs på http://localhost:5000")
print("Dela via ngrok: ngrok http 5000\n")

subprocess.run(
    [sys.executable, 'app.py'],
    cwd=BACKEND_DIR
)
