import os
import mysql.connector
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
from dotenv import load_dotenv

load_dotenv()


def load_reports():
    conn = mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
    )
    df = pd.read_sql(
        "SELECT report_id, location, latitude, longitude, severity, "
        "category, created_at FROM reports WHERE latitude IS NOT NULL",
        conn
    )
    conn.close()
    return df


def feature_engineer(df):
    df['created_at'] = pd.to_datetime(df['created_at'])
    df['hour'] = df['created_at'].dt.hour
    df['dow'] = df['created_at'].dt.dayofweek
    df['time_window'] = (df['hour'] // 2) * 2
    df['route_segment'] = (
        df['latitude'].round(1).astype(str) + '_' +
        df['longitude'].round(1).astype(str)
    )

    grouped = df.groupby(['route_segment', 'time_window', 'dow']).agg(
        incident_count=('report_id', 'count'),
        avg_severity=('severity', 'mean'),
    ).reset_index()

    def label(row):
        if row['incident_count'] >= 3 or row['avg_severity'] >= 2.5:
            return 'High'
        if row['incident_count'] >= 2:
            return 'Medium'
        return 'Low'

    grouped['risk'] = grouped.apply(label, axis=1)
    return grouped


def train():
    print("Loading reports from MySQL...")
    df = load_reports()
    print(f"Found {len(df)} reports")

    if len(df) < 3:
        print("Not enough data to train. Submit more reports first.")
        return

    feats = feature_engineer(df)
    print(f"Engineered {len(feats)} route/time windows")

    X = feats[['incident_count', 'avg_severity', 'time_window', 'dow']]
    y = feats['risk']

    if len(feats) >= 10:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
    else:
        X_train, X_test, y_train, y_test = X, X, y, y

    model = RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42
    )
    model.fit(X_train, y_train)

    acc = model.score(X_test, y_test)
    print(f"Model accuracy: {acc:.2f}")
    print("Feature importances:",
          dict(zip(X.columns, model.feature_importances_.round(2))))

    joblib.dump(model, 'models/risk_model.pkl')
    print("Model saved to models/risk_model.pkl")


if __name__ == '__main__':
    train()