
import pandas as pd
import streamlit as st

st.set_page_config(
    page_title="WorthMyCar",
    page_icon="🚗",
    layout="wide"
)

with st.sidebar:
    st.title("WorthMy-Car🚗")
    st.caption("WorthMY-Car is an end to end machine learning project built to predict the resale price of any used car")   

    st.divider()

    st.markdown("### :material/build: Made With")

    st.caption("Python  |  Streamlit  |  Scikit-Learn | Fastapi  | Pandas  |  Reportlab ")


    st.caption(
        "© 2026 WorthMy-Car"
    )


pages=[
    st.Page(
        "pages/0home.py",
        title="Home",
        icon=":material/home:"
    ),
    st.Page(
        "pages/1Deal_Analysis.py",
        title="Deal Analysis",
        icon=":material/money_bag:"
    ),
    st.Page(
        "pages/3predict_price.py",
        title="Predict Price",
        icon=":material/drive_fusiontable:"
    )
]

pg=st.navigation(pages)
pg.run()

