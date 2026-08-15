import streamlit as st

st.title("Car-Predict")

st.subheader("AI powered used car REsale Price Prediction")

st.write(
    """
    CarPredict is an end to end machine learning application that precicts the resale price of a used car based on it's specifications, usage, ownership and location
    """
)

st.divider()

st.subheader("Model Metric's")
col1, col2, col3 = st.columns(3)
with col1:
    st.metric(
        label="R² Score",
        value="88.59%"
    )

with col2:
    st.metric(
        label="MAE",
        value="₹2.59 L"
    )

with col3:
    st.metric(
        label="RMSE",
        value="₹7.22 L"
    )