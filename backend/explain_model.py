import shap
import joblib
import pandas as pd
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

# Load model and data
model = joblib.load("model.pkl")

# Load dataset again (same preprocessing as training)
df_2019 = load_csv_fixed("dengue_2019.csv")
df_2020 = load_csv_fixed("dengue_2020.csv")
df_2021 = load_csv_fixed("dengue_2021.csv")

df_2019["Year"] = 2019
df_2020["Year"] = 2020
df_2021["Year"] = 2021

df = pd.concat([df_2019, df_2020, df_2021], ignore_index=True)

df_long = df.melt(
    id_vars=["District", "Year"],
    var_name="Month",
    value_name="Cases"
)

df_long["Cases"] = pd.to_numeric(df_long["Cases"], errors="coerce")
df_long = df_long.dropna()
df_long = df_long.sort_values(by=["District", "Year", "Month"])

df_long["Lag_1"] = df_long.groupby("District")["Cases"].shift(1)
df_long["Lag_2"] = df_long.groupby("District")["Cases"].shift(2)
df_long = df_long.dropna()

threshold = df_long["Cases"].quantile(0.75)
df_long["High_Risk"] = (df_long["Cases"] > threshold).astype(int)

df_model = pd.get_dummies(
    df_long,
    columns=["District", "Month"],
    drop_first=True
)

X = df_model.drop(["Cases", "High_Risk", "Year"], axis=1)

# SHAP
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)

# Newer SHAP returns 3D array for tree ensembles: (samples, features, classes)
if isinstance(shap_values, list):
    shap.summary_plot(shap_values[1], X)   # older API
else:
    shap.summary_plot(shap_values[:, :, 1], X)  # newer API
