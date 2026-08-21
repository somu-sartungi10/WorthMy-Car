from pathlib import Path
import os

import pandas as pd
import requests
import streamlit as st
import time




if "prediction_result" not in st.session_state:
    st.session_state.prediction_result = None

if "car_data" not in st.session_state:
    st.session_state.car_data = None



# Project Paths


PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_PATH = PROJECT_ROOT / "data" / "raw" / "cardata.csv"


# --------------------------------------------------
# API URLs
# --------------------------------------------------

API_URL = os.getenv(
    "API_URL",
    "http://127.0.0.1:8000/predict",
)

REPORT_API_URL = os.getenv(
    "REPORT_API_URL",
    "http://127.0.0.1:8000/download-report",
)


# --------------------------------------------------
# Streamlit Configuration
# --------------------------------------------------

st.set_page_config(
    page_title="WorthMy-Car",
    page_icon="🚗",
    layout="wide",
)


# --------------------------------------------------
# Load Dataset
# --------------------------------------------------

@st.cache_data
def load_data():
    return pd.read_csv(DATA_PATH)


def get_options(dataframe, column_name):
    return sorted(
        dataframe[column_name]
        .dropna()
        .astype(str)
        .unique()
    )


df = load_data()


st.header("Car Detail")

st.caption(
    "Input the detail of your car to predict the resale price"
)




with st.form("car_prediction_form"):


    st.subheader("1. Vehicle Identity")

    col1, col2 = st.columns(2)

    with col1:
        make = st.selectbox(
            label="Car Make / Brand",
            options=get_options(df, "Make"),
        )

    with col2:
        available_models = sorted(
            df.loc[
                df["Make"] == make,
                "Model"
            ]
            .dropna()
            .astype(str)
            .unique()
        )

        model = st.selectbox(
            label="Car model",
            options=available_models,
        )


    st.subheader("2. Usage and Ownership")

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
            label="Kilometres Driven",
            min_value=0,
            max_value=1_000_000,
            value=50_000,
            step=1_000,
        )

    with col3:
        owner = st.selectbox(
            label="Owner Type",
            options=get_options(df, "Owner"),
        )

    with col4:
        seller_type = st.selectbox(
            label="Seller Type",
            options=get_options(df, "Seller Type"),
        )


    st.subheader("3. Vehicle Configuration")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        fuel_type = st.selectbox(
            label="Fuel Type",
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
            label="Seating Capacity",
            min_value=1.0,
            max_value=12.0,
            value=5.0,
            step=1.0,
        )


    st.subheader("4. Location and Appearance")

    col1, col2 = st.columns(2)

    with col1:
        location = st.selectbox(
            label="Car Location",
            options=get_options(df, "Location"),
        )

    with col2:
        color = st.selectbox(
            label="Car Colour",
            options=get_options(df, "Color"),
        )


    st.subheader("5. Engine Specifications")

    col1, col2, col3 = st.columns(3)

    with col1:
        engine = st.text_input(
            label="Engine Capacity",
            value="1493 cc",
            help="Example: 1493 cc",
        )

    with col2:
        max_power = st.text_input(
            label="Maximum Power",
            value="70 bhp",
            help="Example: 70 bhp",
        )

    with col3:
        max_torque = st.text_input(
            label="Maximum Torque",
            value="195 Nm",
            help="Example: 195 Nm",
        )



    st.subheader("6. Vehicle Dimensions")

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
            label="Fuel Tank Capacity (litres)",
            min_value=0.0,
            value=45.0,
        )


    submitted = st.form_submit_button(
        label="Estimate Resale Price",
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


    st.session_state.prediction_result =None
    st.session_state.car_data=None
    st.session_state.pdf_data=None


    try:
        start_time = time.perf_counter()

        with st.spinner(
            "Calculating estimated resale price..."
        ):
            response = requests.post(
                API_URL,
                json=car_data,
                timeout=90,
            )

            response.raise_for_status()

            result = response.json()
            predicted_price = result["predicted_price"]

            elapsed = time.perf_counter()-start_time
            minimum_loading_time=0.8

            if elapsed < minimum_loading_time:
                time.sleep(
                    minimum_loading_time - elapsed
                )
        

        st.session_state.prediction_result = predicted_price
        st.session_state.car_data = car_data


    except requests.exceptions.ConnectionError:

        st.error(
            "Cannot connect to the FastAPI backend. "
            "Start it using: uvicorn src.api:app --reload"
        )

    except requests.exceptions.RequestException as error:

        st.error(
            f"Prediction failed: {error}"
        )




if st.session_state.prediction_result is not None:

    predicted_price = (
        st.session_state.prediction_result
    )

    saved_car_data = (
        st.session_state.car_data
    )


    #Prediction result

    st.divider()

    st.subheader(
        ":material/money_bag: Estimated Resale Value"
    )


    c1, c2, c3 = st.columns(3)


    with c1:

        st.metric(
            label="Estimated Price",
            value=f"₹{predicted_price:,.0f}",
        )


    with c2:

        car_age = (
            2026 - saved_car_data["year"]
        )

        st.metric(
            label="Car Age",
            value=f"{car_age} year",
        )


    with c3:

        st.metric(
            label="Kilometres Driven",
            value=(
                f"{saved_car_data['kilometer']:,.0f} km"
            ),
        )


    st.caption(
        "This is a model estimate and may differ "
        "from the actual market selling price."
    )


    
    st.subheader("Car Price Report")


    try:

       with st.spinner("Preparing PDF report..."):

        pdf_response = requests.post(
            REPORT_API_URL,
            json=saved_car_data,
            timeout=90,
        )

       print("PDF STATUS:", pdf_response.status_code)
       print("PDF CONTENT TYPE:", pdf_response.headers.get("content-type"))

       pdf_response.raise_for_status()

       st.download_button(
        label=":material/download: Download PDF report",
        data=pdf_response.content,
        file_name="car_price_report.pdf",
        mime="application/pdf",
        use_container_width=True,
       )

    except requests.exceptions.ConnectionError as error:

       st.error(f"Connection error: {error}")
 
    except requests.exceptions.HTTPError as error:

        st.error(
            f"FastAPI returned an error: "
            f"{pdf_response.status_code} — "
            f"{pdf_response.text[:500]}"
        )

    except requests.exceptions.RequestException as error:

        st.error(f"Request failed: {error}")

    except Exception as error:

       st.error(f"Unexpected error: {error}")