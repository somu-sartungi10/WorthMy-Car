import streamlit as st

st.title("💰 Deal Analysis")

st.subheader("Is this car worth the asking price?")

st.write(
    """
    Enter the estimated market price and the seller's
    asking price to determine whether the car is
    fairly priced.
    """
)

st.divider()

col1, col2 = st.columns(2)

with col1:
    estimated_price = st.number_input(
        "Estimated Market Price (₹)",
        min_value=0.0,
        value=500000.0,
        step=10000.0,
    )

with col2:
    asking_price = st.number_input(
        "Seller's Asking Price (₹)",
        min_value=0.0,
        value=500000.0,
        step=10000.0,
    )

if st.button(
    "Analyze Deal",
    type="primary",
    use_container_width=True,
):

    difference = asking_price - estimated_price

    percentage_difference = (
        difference / estimated_price * 100
        if estimated_price > 0
        else 0
    )

    st.divider()

    st.subheader("Deal Analysis")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "Estimated Market Price",
            f"₹{estimated_price:,.0f}"
        )

    with col2:
        st.metric(
            "Asking Price",
            f"₹{asking_price:,.0f}"
        )

    with col3:
        st.metric(
            "Difference",
            f"₹{abs(difference):,.0f}",
            delta=f"{percentage_difference:.1f}%"
        )

    st.divider()

    if percentage_difference <= -10:

        st.success(
            "🟢 Excellent Deal\n\n"
            "The seller's asking price is significantly "
            "below the estimated market value."
        )

    elif percentage_difference < 0:

        st.success(
            "🟢 Good Deal\n\n"
            "The asking price is below the estimated "
            "market value."
        )

    elif percentage_difference <= 10:

        st.warning(
            "🟡 Fair Price\n\n"
            "The asking price is reasonably close to "
            "the estimated market value."
        )

    else:

        st.error(
            "🔴 Price Seems High\n\n"
            "The seller's asking price is significantly "
            "above the estimated market value."
        )