from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Simple Rockfall API", "status": "running"}

@app.get("/api/mines")
def get_mines():
    return [
        {"mine_id": "TN_001", "name": "Test Mine 1", "risk": "Low"},
        {"mine_id": "TN_002", "name": "Test Mine 2", "risk": "High"}
    ]

if __name__ == "__main__":
    print("Starting simple API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)