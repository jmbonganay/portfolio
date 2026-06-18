from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = Path("output/pdf/JohnMichael_Bonganay_Resume.pdf")

INK = colors.HexColor("#15252B")
MUTED = colors.HexColor("#53666D")
TEAL = colors.HexColor("#087F78")
PALE = colors.HexColor("#E8F5F2")
RULE = colors.HexColor("#C9DAD7")


class UncompressedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        kwargs["pageCompression"] = 0
        super().__init__(*args, **kwargs)


def footer(page_canvas, document):
    page_canvas.saveState()
    page_canvas.setStrokeColor(RULE)
    page_canvas.setLineWidth(0.5)
    page_canvas.line(0.58 * inch, 0.47 * inch, 7.92 * inch, 0.47 * inch)
    page_canvas.setFont("Helvetica", 7.5)
    page_canvas.setFillColor(MUTED)
    page_canvas.drawString(0.58 * inch, 0.29 * inch, "PUBLIC PROFESSIONAL RESUME")
    page_text = f"PAGE {document.page}"
    page_canvas.drawString(
        7.92 * inch - stringWidth(page_text, "Helvetica", 7.5),
        0.29 * inch,
        page_text,
    )
    page_canvas.restoreState()


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="ResumeName",
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=27,
        textColor=INK,
        alignment=TA_CENTER,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeRole",
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=TEAL,
        alignment=TA_CENTER,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeContact",
        fontName="Helvetica",
        fontSize=8.6,
        leading=12,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeSection",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=TEAL,
        spaceBefore=9,
        spaceAfter=6,
        borderColor=RULE,
        borderWidth=0,
        borderPadding=(0, 0, 3, 0),
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeBody",
        fontName="Helvetica",
        fontSize=8.8,
        leading=12.5,
        textColor=INK,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeJob",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        textColor=INK,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeMeta",
        fontName="Helvetica",
        fontSize=8.2,
        leading=11,
        textColor=MUTED,
        alignment=TA_LEFT,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeBullet",
        fontName="Helvetica",
        fontSize=8.5,
        leading=11.8,
        leftIndent=11,
        firstLineIndent=-8,
        textColor=INK,
        spaceAfter=3,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeMetric",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=TEAL,
        alignment=TA_CENTER,
    )
)
styles.add(
    ParagraphStyle(
        name="ResumeMetricLabel",
        fontName="Helvetica",
        fontSize=7.4,
        leading=10,
        textColor=MUTED,
        alignment=TA_CENTER,
    )
)


def section(title):
    return Paragraph(title, styles["ResumeSection"])


def bullet(text):
    return Paragraph(f"- {text}", styles["ResumeBullet"])


def job(title, company, dates, bullets):
    heading = Table(
        [
            [
                Paragraph(title, styles["ResumeJob"]),
                Paragraph(dates, styles["ResumeMeta"]),
            ],
            [Paragraph(company, styles["ResumeMeta"]), ""],
        ],
        colWidths=[5.65 * inch, 1.55 * inch],
    )
    heading.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        )
    )
    return KeepTogether([heading, Spacer(1, 4), *[bullet(item) for item in bullets]])


def build_resume():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=LETTER,
        rightMargin=0.58 * inch,
        leftMargin=0.58 * inch,
        topMargin=0.48 * inch,
        bottomMargin=0.62 * inch,
        title="John Michael Bonganay - Public Professional Resume",
        author="John Michael Bonganay",
        subject="Front End Development, Landing Pages, and Automation",
    )

    story = [
        Paragraph("JOHN MICHAEL BONGANAY", styles["ResumeName"]),
        Paragraph(
            "LANDING PAGE DESIGNER / DEVELOPER | AUTOMATION SPECIALIST",
            styles["ResumeRole"],
        ),
        Paragraph(
            'Philippines - Remote&nbsp;&nbsp;|&nbsp;&nbsp;'
            '<link href="mailto:johnmichaelbonganay1231@gmail.com" color="#087F78">'
            "johnmichaelbonganay1231@gmail.com</link>&nbsp;&nbsp;|&nbsp;&nbsp;"
            '<link href="https://www.linkedin.com/in/john-michael-bonganay-802950167/" color="#087F78">'
            "LinkedIn Profile</link>",
            styles["ResumeContact"],
        ),
        section("PROFESSIONAL SUMMARY"),
        Paragraph(
            "Conversion-focused front end developer and landing page designer with 4+ years of experience building responsive websites, ecommerce product pages, sales funnels, and lead workflows. Combines Figma, WordPress, Shopify, GoHighLevel, HTML/CSS, analytics, and automation tools to turn business goals into launch-ready customer journeys. Experienced in remote delivery, responsive QA, performance optimization, and clear technical handoff.",
            styles["ResumeBody"],
        ),
        section("SELECTED IMPACT"),
    ]

    metrics = Table(
        [
            [
                Paragraph("$52.9K", styles["ResumeMetric"]),
                Paragraph("1,229", styles["ResumeMetric"]),
                Paragraph("4.82%", styles["ResumeMetric"]),
                Paragraph("689+", styles["ResumeMetric"]),
            ],
            [
                Paragraph("sales proof on a Shopify build", styles["ResumeMetricLabel"]),
                Paragraph("orders on the top performer", styles["ResumeMetricLabel"]),
                Paragraph("conversion rate", styles["ResumeMetricLabel"]),
                Paragraph("production leads routed", styles["ResumeMetricLabel"]),
            ],
        ],
        colWidths=[1.8 * inch] * 4,
    )
    metrics.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE),
                ("BOX", (0, 0), (-1, -1), 0.6, RULE),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, RULE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, 0), 7),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.extend(
        [
            metrics,
            section("EXPERIENCE"),
            job(
                "FRONT-END DEVELOPER / WORDPRESS DEVELOPER",
                "Cherrington Media",
                "Apr 2023 - Apr 2026",
                [
                    "Designed and optimized responsive WordPress landing pages and sales funnels for lead generation and conversion-focused campaigns.",
                    "Developed Shopify product pages with clearer offer hierarchy, product visuals, proof sections, and mobile purchase paths.",
                    "Improved page speed by optimizing plugins, images, video, fonts, and other media across WordPress and Shopify sites.",
                    "Built GoHighLevel funnels and lead capture workflows to support campaign operations and follow-up.",
                    "Integrated analytics, payment, email, logistics, and DNS services while coordinating responsive QA and launch checks.",
                    "Migrated fixed HTML sites into GoHighLevel while preserving layout, styling, and responsive behavior.",
                ],
            ),
            Spacer(1, 8),
            job(
                "WEB DEVELOPER / LANDING PAGE DESIGNER",
                "Nest Marketing",
                "2022 - 2023",
                [
                    "Created high-fidelity website and landing page designs in Figma and Sketch for client marketing projects.",
                    "Built responsive websites from approved designs with accurate layout execution and consistent visual presentation.",
                    "Developed and maintained WordPress sites while applying on-page SEO and performance best practices.",
                    "Configured analytics and Zapier workflows to improve reporting and reduce repetitive manual tasks.",
                ],
            ),
            section("SKILLS"),
            Paragraph(
                "<b>Design and Front End:</b> Figma, UX/UI design, responsive web design, HTML/CSS, conversion rate optimization, accessibility-aware QA<br/>"
                "<b>Platforms:</b> WordPress, WooCommerce, Shopify, GoHighLevel, Netlify<br/>"
                "<b>Automation and Data:</b> Make, Zapier, n8n, webhooks, CRM routing, Google Sheets, Gmail, Gemini<br/>"
                "<b>Measurement and Delivery:</b> Google Analytics, Google Tag Manager, performance optimization, Jira, ClickUp, Trello, Asana",
                styles["ResumeBody"],
            ),
            section("EDUCATION"),
            job(
                "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY",
                "Bicol University College of Science | Philippines",
                "2019",
                [],
            ),
            section("WORKING STYLE"),
            Paragraph(
                "Remote collaboration across US, UK, and AU time zones | Async-friendly communication | Clear QA notes and handoff documentation | English and Filipino",
                styles["ResumeBody"],
            ),
        ]
    )

    document.build(
        story,
        onFirstPage=footer,
        onLaterPages=footer,
        canvasmaker=UncompressedCanvas,
    )


if __name__ == "__main__":
    build_resume()
    print(f"Generated {OUTPUT}")
