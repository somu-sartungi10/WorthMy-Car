
import pandas as pd
import streamlit as st

st.set_page_config(
    page_title="CarPredictt",
    page_icon="🚗",
    layout="wide"
)

with st.sidebar:
    st.title("🚗 Resale-Predictor")
    st.caption("Resale-predictor is an end to end machine learning project built to predict the resale price of any used car")   

    mdf = pd.DataFrame(
                {
                    "Key Metrics" : ['R-squared','MAE','RMSE'],
                    "Score" : [0.8859,'Rs 259069','Rs 722302']
                }
            )
    st.header("Model Performance")
    st.dataframe(mdf,hide_index=True)
    st.divider()
    st.info('The model explains approximately 88.6% of the variation in used-car prices on the unseen test data')


pages=[
    st.Page(
        "pages/0home.py",
        title="Home",
        icon="🏡"
    ),
    st.Page(
        "pages/1Deal_Analysis.py",
        title="Deal Analysis",
        icon="💰"
    ),
    st.Page(
        "pages/3predict_price.py",
        title="Predict Price",
        icon="🔮"
    )
]

pg=st.navigation(pages)
pg.run()