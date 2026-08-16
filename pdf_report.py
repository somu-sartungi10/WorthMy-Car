from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


def create_pdf_report(car, predicted_price):
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=22,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        spaceBefore=10,
        spaceAfter=8,
    )

    price_style = ParagraphStyle(
        "Price",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        fontSize=24,
        spaceAfter=15,
    )

    story = []

    story.append(
        Paragraph("WorthMy-Car", title_style)
    )

    story.append(
        Paragraph(
            "Car Price Prediction Report",
            subtitle_style,
        )
    )

    vehicle_data = [
    ["Vehicle Detail", "Value"],

    # Vehicle identity
    ["Make", car.make],
    ["Model", car.model],
    ["Manufacturing Year", str(car.year)],

    # Usage and ownership
    ["Kilometres Driven", f"{car.kilometer:,.0f} km"],
    ["Owner Type", car.owner],
    ["Seller Type", car.seller_type],

    # Vehicle configuration
    ["Fuel Type", car.fuel_type],
    ["Transmission", car.transmission],
    ["Drivetrain", car.drivetrain or "N/A"],
    ["Seating Capacity", (
        f"{car.seating_capacity:g}"
        if car.seating_capacity is not None
        else "N/A"
    )],

    # Location and appearance
    ["Location", car.location],
    ["Color", car.color],

    # Engine specifications
    ["Engine", car.engine],
    ["Max Power", car.max_power],
    ["Max Torque", car.max_torque],

    # Vehicle dimensions
    ["Length", (
        f"{car.length:,.0f} mm"
        if car.length is not None
        else "N/A"
    )],
    ["Width", (
        f"{car.width:,.0f} mm"
        if car.width is not None
        else "N/A"
    )],
    ["Height", (
        f"{car.height:,.0f} mm"
        if car.height is not None
        else "N/A"
    )],
    ["Fuel Tank Capacity", (
        f"{car.fuel_tank_capacity:,.1f} L"
        if car.fuel_tank_capacity is not None
        else "N/A"
    )],
]

    vehicle_table = Table(
        vehicle_data,
        colWidths=[180, 290],
    )

    vehicle_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )

    story.append(vehicle_table)

    story.append(Spacer(1, 25))

    story.append(
        Paragraph(
            "Estimated Resale Price",
            heading_style,
        )
    )

    story.append(
        Paragraph(
            f"₹{predicted_price:,.0f}",
            price_style,
        )
    )

    story.append(
        Paragraph(
            "This is a model estimate and is not a guaranteed selling price.",
            subtitle_style,
        )
    )

    document.build(story)

    buffer.seek(0)

    return buffer