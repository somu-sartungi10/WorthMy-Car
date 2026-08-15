from pathlib import Path
import os
import pandas as pd
import requests
import streamlit as st


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "raw" / "cardata.csv"
API_URL = os.getenv(
    "API_URL",
    "http://127.0.0.1:8000/predict",
)
st.set_page_config(
    page_title="CarPredict",
    page_icon="🚗",
    layout="wide",
)


@st.cache_data
def load_data():
    return pd.read_csv(DATA_PATH)


def get_options(dataframe, column_name):
    return sorted(dataframe[column_name].dropna().astype(str).unique())


df = load_data()



#UI Elements start's from here


st.header("Car Detail")
st.caption("Input the detail of your car to predict the resale price")

with st.form("car_prediction_form"):

    st.subheader("1. Vehicle identity")

    col1, col2 = st.columns(2)

    with col1:
        make = st.selectbox(
            label="Car make / brand",
            options=get_options(df, "Make"),
        )

    with col2:
        available_models = sorted(
            df.loc[df["Make"] == make, "Model"].dropna().astype(str).unique()
        )
        model = st.selectbox(
            label="Car model",
            options=available_models,
        )

    st.subheader("2. Usage and ownership")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        year = st.number_input(
            label="Manufacturing year",
            min_value=1987,
            max_value=2026,
            value=2019,
            step=1,
        )

    with col2:
        kilometer = st.number_input(
            label="Kilometres driven",
            min_value=0,
            max_value=1_000_000,
            value=50_000,
            step=1_000,
        )

    with col3:
        owner = st.selectbox(
            label="Owner type",
            options=get_options(df, "Owner"),
        )

    with col4:
        seller_type = st.selectbox(
            label="Seller type",
            options=get_options(df, "Seller Type"),
        )

    st.subheader("3. Vehicle configuration")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        fuel_type = st.selectbox(
            label="Fuel type",
            options=get_options(df, "Fuel Type"),
        )

    with col2:
        transmission = st.selectbox(
            label="Transmission type",
            options=get_options(df, "Transmission"),
        )

    with col3:
        drivetrain = st.selectbox(
            label="Drivetrain",
            options=get_options(df, "Drivetrain"),
        )

    with col4:
        seating_capacity = st.number_input(
            label="Seating capacity",
            min_value=1.0,
            max_value=12.0,
            value=5.0,
            step=1.0,
        )

    st.subheader("4. Location and appearance")

    col1, col2 = st.columns(2)

    with col1:
        location = st.selectbox(
            label="Car location",
            options=get_options(df, "Location"),
        )

    with col2:
        color = st.selectbox(
            label="Car colour",
            options=get_options(df, "Color"),
        )

    st.subheader("5. Engine specifications")

    col1, col2, col3 = st.columns(3)

    with col1:
        engine = st.text_input(
            label="Engine capacity",
            value="1493 cc",
            help="Example: 1493 cc",
        )

    with col2:
        max_power = st.text_input(
            label="Maximum power",
            value="70 bhp",
            help="Example: 70 bhp",
        )

    with col3:
        max_torque = st.text_input(
            label="Maximum torque",
            value="195 Nm",
            help="Example: 195 Nm",
        )

    st.subheader("6. Vehicle dimensions")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        length = st.number_input(
            label="Length (mm)",
            min_value=0.0,
            value=3995.0,
        )

    with col2:
        width = st.number_input(
            label="Width (mm)",
            min_value=0.0,
            value=1745.0,
        )

    with col3:
        height = st.number_input(
            label="Height (mm)",
            min_value=0.0,
            value=1880.0,
        )

    with col4:
        fuel_tank_capacity = st.number_input(
            label="Fuel tank capacity (litres)",
            min_value=0.0,
            value=45.0,
        )

    submitted = st.form_submit_button(
        label="Estimate resale price",
        type="primary",
        use_container_width=True,
    )


if submitted:
    car_data = {
        "make": make,
        "model": model,
        "year": year,
        "kilometer": kilometer,
        "fuel_type": fuel_type,
        "transmission": transmission,
        "location": location,
        "color": color,
        "owner": owner,
        "seller_type": seller_type,
        "engine": engine,
        "max_power": max_power,
        "max_torque": max_torque,
        "drivetrain": drivetrain,
        "length": length,
        "width": width,
        "height": height,
        "seating_capacity": seating_capacity,
        "fuel_tank_capacity": fuel_tank_capacity,
    }

    try:
        with st.spinner("Calculating estimated resale price..."):
            response = requests.post(API_URL, json=car_data, timeout=90)
            response.raise_for_status()
            result = response.json()

        predicted_price = result["predicted_price"]

        st.divider()
        st.success("Prediction completed successfully.")
        st.metric(
            label="Estimated resale price",
            value=f"₹{predicted_price:,.0f}",
        )
        st.caption("This is a model estimate, not a guaranteed selling price.")

    except requests.exceptions.ConnectionError:
        st.error(
            "Cannot connect to the FastAPI backend. "
            "Start it using: uvicorn src.api:app --reload"
        )

    except requests.exceptions.RequestException as error:
        st.error(f"Prediction failed: {error}")
