
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, accuracy_score
import joblib
import io

def load_csv_fixed(filepath):
    """Load CSV files that have each row wrapped in outer double-quotes."""
    with open(filepath, encoding="utf-8-sig") as f:
        raw = f.read()

    lines = []
    for line in raw.splitlines():
        line = line.strip()
        if line.startswith('"') and line.endswith('"'):
            line = line[1:-1]          
            line = line.replace('""', '"')  
        lines.append(line)
    return pd.read_csv(io.StringIO("\n".join(lines)))

print("Loading datasets...")

df_2019 = load_csv_fixed("dengue_2019.csv")
df_2020 = load_csv_fixed("dengue_2020.csv")
df_2021 = load_csv_fixed("dengue_2021.csv")

df_2019["Year"] = 2019
df_2020["Year"] = 2020
df_2021["Year"] = 2021

df = pd.concat([df_2019, df_2020, df_2021], ignore_index=True)

print("Shape:", df.shape)
print("Columns:", df.columns)
print(df.head())

print("Combined dataset shape:", df.shape)



df = df[df["District"].notna()]
df = df[df["District"] != "Total"]

if "Total" in df.columns:
    df = df.drop(columns=["Total"])


df_long = df.melt(
    id_vars=["Province", "District", "Year"],
    var_name="Month",
    value_name="Cases"
)

df_long["Cases"] = pd.to_numeric(df_long["Cases"], errors="coerce")

df_long = df_long.dropna()

print("Long format shape:", df_long.shape)


df_long = df_long.sort_values(by=["District", "Year", "Month"])


df_long["Lag_1"] = df_long.groupby("District")["Cases"].shift(1)
df_long["Lag_2"] = df_long.groupby("District")["Cases"].shift(2)

df_long = df_long.dropna()



threshold = df_long["Cases"].quantile(0.75)

df_long["High_Risk"] = (df_long["Cases"] > threshold).astype(int)

print("High risk threshold:", threshold)



df_encoded = pd.get_dummies(
    df_long,
    columns=["District", "Month"],
    drop_first=True
)



X = df_encoded.drop(["Cases", "High_Risk", "Province", "Year"], axis=1)
y = df_encoded["High_Risk"]

print("Feature count:", X.shape[1])



X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)



print("Training model...")

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=42
)

model.fit(X_train, y_train)


y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\n=== MODEL EVALUATION ===")
print("Accuracy Score:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("ROC-AUC Score:", roc_auc_score(y_test, y_prob))


joblib.dump(model, "model.pkl")
joblib.dump(X.columns.tolist(), "feature_columns.pkl")

print("\nModel saved as model.pkl")
print("Feature columns saved as feature_columns.pkl")
