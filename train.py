import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Load dataset
data = pd.read_csv("data/student_scores.csv")

# Features and target
X = data[["Hours"]]
y = data["Marks"]

# Train model
model = LinearRegression()
model.fit(X, y)

# Save model
joblib.dump(model, "model/model.pkl")

print("Model trained and saved!")