import streamlit as st
import pandas as pd
from pathlib import Path
import json



Base_dir = Path(__file__).resolve().parent.parent
Data_path = Base_dir / "data" /"raw"/"cardata.csv"
Metric_path = Base_dir / "models" / "metrics.json" 


@st.cache_data
def load_metrics():
    with open(Metric_path,'r') as file:
        return json.load(file)
    

metrics =load_metrics()
test_metrics=metrics["test_metrics"]
model=metrics["model"]
params=model["hyperparameters"]



st.title("WorthMy-Car")

st.subheader("AI powered used car Resale Price Prediction")

st.write(
    """
    WorthMy-Car is an end to end machine learning application that predicts the resale price of a used car based on it's specifications, usage, ownership and location
    """
)

st.divider()

st.header("Model Metric's")
col1, col2, col3 = st.columns(3)
with col1:
    st.metric(
        label="R² Score",
        value=f"{test_metrics['R2']:4f}"
    )

with col2:
    st.metric(
        label="MAE",
        value=f"₹{test_metrics['MAE']:,.0f}"
    )

with col3:
    st.metric(
        label="RMSE",
        value=f"₹{test_metrics['RMSE']:,.0f}"
    )




df=pd.read_csv(Data_path)

st.space()
st.info("Dataset used to train the model")

c1,c2,c3= st.columns([1,1,3])

@st.dialog("Dataset Preview")
def show_dataset():
    st.write("Sample of the dataset used in the application")
    st.dataframe(df.sample(n=10),use_container_width=True)


with c1:
    if st.button(
        "View Dataset", 
        icon=":material/table_view:",
        use_container_width=True
        ):
        show_dataset()


with c2:
    if st.button(
        "Make Prediction",
        icon=":material/analytics:",
        use_container_width=True
        ):
        st.switch_page("pages/3predict_price.py")