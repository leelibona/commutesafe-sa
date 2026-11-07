import os
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CommuteSafe ML API")

MODEL_PATH = 'models/risk_model.pkl'


class RiskInput(BaseModel):
    incident_count: int
    avg_severity: float
    time_window: int
    dow: int


@app.get('/health')
def health():
    return {'status': 'ok', 'model_trained': os.path.exists(MODEL_PATH)}


@app.post('/predict')
def predict(inp: RiskInput):
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(
            status_code=503,
            detail='Model not trained yet. Run train.py first.'
        )
    model = joblib.load(MODEL_PATH)
    pred = model.predict([[
        inp.incident_count,
        inp.avg_severity,
        inp.time_window,
        inp.dow,
    ]])[0]
    return {'risk': pred}