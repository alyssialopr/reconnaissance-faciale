from fastapi import FastAPI
import subprocess
import platform

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

def lock_computer():
    os_type = platform.system()
    if os_type == "Windows":
        subprocess.run("rundll32.exe user32.dll,LockWorkStation")
    elif os_type == "Linux":
        subprocess.run(["gnome-screensaver-command", "-l"])
    elif os_type == "Darwin":
        subprocess.run(['/System/Library/CoreServices/Menu Extras/User.menu/Contents/Resources/CGSession', '-suspend'])
    else:
        raise Exception(f"Unsupported OS: {os_type}")

@app.post("/lock")

def lock_endpoint():
    try:
        lock_computer()
        return {"status": "success", "message": "Computer locked."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod, remplace "*" par l'URL de ton site
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)