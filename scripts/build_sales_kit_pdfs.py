from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
OVERVIEW = OUT / "Formulary_Finder_Clinic_Overview.pdf"
RUNBOOK = OUT / "Formulary_Finder_Demo_Runbook.pdf"

INK = HexColor("#173B3A")
TEAL = HexColor("#0B6D69")
MUTED = HexColor("#5C7472")
CORAL = HexColor("#D87351")
MINT = HexColor("#EAF6F3")
PALE = HexColor("#F7FBFA")
BLUE = HexColor("#3F8EF7")
LINE = HexColor("#C9DEDA")
WHITE = colors.white

PAGE_W, PAGE_H = letter
MARGIN = 0.58 * inch


def styles():
    base = getSampleStyleSheet()
    return {
        "brand": ParagraphStyle("Brand", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=8, leading=10, textColor=HexColor("#CBE9E3"), tracking=1.4),
        "title": ParagraphStyle("Title", parent=base["Title"], fontName="Helvetica-Bold", fontSize=26, leading=29, textColor=WHITE, alignment=TA_LEFT, spaceAfter=8),
        "cover": ParagraphStyle("Cover", parent=base["BodyText"], fontName="Helvetica", fontSize=10.8, leading=14.5, textColor=HexColor("#E1F3EF")),
        "h1": ParagraphStyle("H1", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=20, leading=23, textColor=INK, spaceAfter=7, keepWithNext=True),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=11.5, leading=14, textColor=TEAL, spaceBefore=6, spaceAfter=4, keepWithNext=True),
        "body": ParagraphStyle("Body", parent=base["BodyText"], fontName="Helvetica", fontSize=8.8, leading=12.3, textColor=INK, spaceAfter=4),
        "small": ParagraphStyle("Small", parent=base["BodyText"], fontName="Helvetica", fontSize=7.3, leading=10.2, textColor=MUTED),
        "small_white": ParagraphStyle("SmallWhite", parent=base["BodyText"], fontName="Helvetica", fontSize=7.6, leading=10.2, textColor=WHITE),
        "card_title": ParagraphStyle("CardTitle", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=INK, spaceAfter=3),
        "price": ParagraphStyle("Price", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=16, leading=18, textColor=TEAL, spaceAfter=3),
        "eyebrow": ParagraphStyle("Eyebrow", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=7.5, leading=9, textColor=CORAL, tracking=1.3, spaceAfter=5),
        "quote": ParagraphStyle("Quote", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=INK, alignment=TA_CENTER),
    }


S = styles()


def p(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, S[style])


def bullets(items: list[str], font_size: float = 8.8) -> ListFlowable:
    style = ParagraphStyle("BulletBody", parent=S["body"], fontSize=font_size, leading=font_size + 3.3, spaceAfter=1)
    return ListFlowable(
        [ListItem(Paragraph(item, style), leftIndent=7) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=15,
        bulletFontSize=6,
        bulletColor=TEAL,
        spaceAfter=4,
    )


class BrandedDoc(BaseDocTemplate):
    def __init__(self, filename: str, title: str, subject: str):
        super().__init__(
            filename,
            pagesize=letter,
            leftMargin=MARGIN,
            rightMargin=MARGIN,
            topMargin=0.62 * inch,
            bottomMargin=0.5 * inch,
            title=title,
            author="Formulary Finder",
            subject=subject,
        )
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="main", frames=[frame], onPage=self._furniture))

    @staticmethod
    def _furniture(canvas, doc):
        if canvas.getPageNumber() == 1:
            return
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.6)
        canvas.line(MARGIN, PAGE_H - 0.39 * inch, PAGE_W - MARGIN, PAGE_H - 0.39 * inch)
        canvas.setFont("Helvetica-Bold", 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN, PAGE_H - 0.29 * inch, "FORMULARY FINDER")
        canvas.drawRightString(PAGE_W - MARGIN, 0.29 * inch, f"Page {canvas.getPageNumber()}")
        canvas.restoreState()


def hero(title: str, subtitle: str, label: str):
    content = [p(label.upper(), "brand"), Spacer(1, 0.08 * inch), p(title, "title"), p(subtitle, "cover")]
    table = Table([[content]], colWidths=[PAGE_W - 2 * MARGIN], rowHeights=[1.68 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 24),
        ("RIGHTPADDING", (0, 0), (-1, -1), 24),
        ("TOPPADDING", (0, 0), (-1, -1), 20),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
    ]))
    return table


def feature_card(number: str, title: str, body: str):
    return [
        Paragraph(f'<font color="{BLUE.hexval()}"><b>{number}</b></font>', S["card_title"]),
        p(title, "card_title"),
        p(body, "small"),
    ]


def build_overview():
    story = [
        hero(
            "Know the formulary path before the pharmacy call.",
            "Formulary Finder gives New Jersey clinic teams one clear workflow from insurance card to exact plan, medication product, source evidence, and the next prior-authorization step.",
            "Medication-access workflow for New Jersey clinics",
        ),
        Spacer(1, 0.18 * inch),
    ]

    workflow = Table(
        [[
            feature_card("01", "Choose the insurer", "Start with what is printed on the card."),
            feature_card("02", "Select the coverage type", "Commercial, Medicaid, Medicare Advantage, or Part D."),
            feature_card("03", "Choose the exact plan", "See only the subplans and formularies that fit."),
            feature_card("04", "Select the medication", "Autocomplete helps staff reach the exact product."),
        ]],
        colWidths=[1.78 * inch] * 4,
    )
    workflow.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story += [workflow, Spacer(1, 0.16 * inch)]

    left = [
        p("WHAT THE CLINIC GAINS", "eyebrow"),
        p("One repeatable workflow for the whole care team", "h2"),
        bullets([
            "Exact plan and medication-product selection with autocomplete.",
            "Tier, prior authorization, step therapy, quantity limits, source date, and other published restrictions when supplied.",
            "Immediate access to the official prior-authorization form or route when available.",
            "A safe <b>unconfirmed, not a denial</b> state when exact evidence is unavailable.",
            "No member ID, date of birth, diagnosis, or other patient information required for the current workflow.",
        ]),
    ]
    right = [
        p("CURRENT FOUNDATION", "eyebrow"),
        p("Built for a real NJ pulmonary workflow", "h2"),
        bullets([
            "85 pulmonary and commonly used medication families.",
            "17 New Jersey plan-family baselines.",
            "Exact NJ Medicare Advantage and standalone Part D plan selection.",
            "Exact public-data connectors for UHC Marketplace, Aetna NJ FamilyCare, UHC Community NJ Medicaid, and Wellpoint NJ FamilyCare.",
            "Source-visible evidence designed to reduce carrier-level assumptions.",
        ]),
    ]
    columns = Table([[left, right]], colWidths=[3.56 * inch, 3.56 * inch], hAlign="LEFT")
    columns.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 14),
        ("LEFTPADDING", (1, 0), (1, 0), 14),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("LINEBEFORE", (1, 0), (1, 0), 0.7, LINE),
    ]))
    story += [columns, Spacer(1, 0.15 * inch)]

    pricing = Table(
        [[
            [p("60-DAY CLINIC PROOF", "eyebrow"), p("$500 total", "price"), p("One NJ location; credited toward annual conversion.", "small")],
            [p("CLINIC CORE", "eyebrow"), p("$149 / month", "price"), p("Per location; up to 10 prescribers; unlimited support staff.", "small")],
            [p("CLINIC PLUS", "eyebrow"), p("$249 / month", "price"), p("Per location; up to 25 prescribers and a broader plan pack.", "small")],
        ]],
        colWidths=[2.37 * inch, 2.37 * inch, 2.37 * inch],
    )
    pricing.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), MINT),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story += [pricing, Spacer(1, 0.13 * inch)]

    intake = Table([[p("<b>Bring your plan list.</b> Send the 10–20 plan families and 25–50 medication products your clinic sees most. We configure what is already supported, identify the highest-value source additions, and measure the workflow using deidentified scenarios.", "body")]], colWidths=[PAGE_W - 2 * MARGIN])
    intake.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.8, CORAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story += [intake, Spacer(1, 0.08 * inch), p("Live product demonstration available for qualified New Jersey clinic teams.", "small")]
    story += [p("Source-listed evidence is not a guarantee of eligibility, cost, payment, approval, or coverage. Final benefit determination remains with the payer.", "small")]

    OUT.mkdir(parents=True, exist_ok=True)
    BrandedDoc(str(OVERVIEW), "Formulary Finder Clinic Overview", "One-page buyer handout for New Jersey clinic demonstrations").build(story)


def runbook_header(label: str, title: str, subtitle: str):
    return [p(label.upper(), "eyebrow"), p(title, "h1"), p(subtitle)]


def two_col(left, right, left_width=3.55 * inch):
    right_width = PAGE_W - 2 * MARGIN - left_width
    table = Table([[left, right]], colWidths=[left_width, right_width])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 14),
        ("LEFTPADDING", (1, 0), (1, 0), 14),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("LINEBEFORE", (1, 0), (1, 0), 0.7, LINE),
    ]))
    return table


def step_table(rows):
    data = [[p("TIME", "eyebrow"), p("ACTION", "eyebrow"), p("WHAT TO SAY", "eyebrow")]]
    for time, action, talk in rows:
        data.append([p(time, "card_title"), p(action, "card_title"), p(talk, "body")])
    table = Table(data, colWidths=[0.72 * inch, 1.72 * inch, 4.68 * inch], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE]),
    ]))
    return table


def build_runbook():
    story = [
        hero(
            "The five-minute Formulary Finder demo",
            "A practical presenter runbook for clinic administrators, physicians, nurses, pharmacists, and prior-authorization teams.",
            "Presenter edition • August 2026",
        ),
        Spacer(1, 0.18 * inch),
    ]

    left = [
        p("BEFORE THE CALL", "eyebrow"),
        p("Open the proof, not the whole product roadmap", "h2"),
        bullets([
            "Open the live portal in a fresh browser tab.",
            "Confirm the data service is connected.",
            "Use only the synthetic identifiers in this runbook; never enter patient information.",
            "Keep the buyer handout and pitch deck open for the close.",
            "Know the audience: practice administrator, clinical champion, or daily workflow owner.",
        ]),
    ]
    right = [
        p("OPENING LINE", "eyebrow"),
        p("Lead with the workflow problem", "h2"),
        p("“Your staff should not have to start on five payer sites to answer one medication question. Formulary Finder guides them from the card to the exact plan, medication product, source evidence, and the next PA step in one clinical workflow.”", "quote"),
        Spacer(1, 0.08 * inch),
        p("Promise only what the product shows. A source-listed result is evidence, not patient-specific adjudication.", "small"),
    ]
    story += [two_col(left, right), Spacer(1, 0.18 * inch)]

    story += runbook_header("Live demonstration", "A simple sequence with three useful moments", "Use one exact Medicare plan, one NJ public-plan connector, and one safe unconfirmed result.")
    story.append(step_table([
        ("0:00", "Frame the problem", "Show that the workflow begins with insurer and coverage type, not a carrier-wide assumption. Point out that the portal does not ask for member ID, DOB, or diagnosis."),
        ("0:40", "Select the exact plan", "Choose <b>Aetna</b> → <b>Medicare Advantage</b>. Search <b>H3152-098</b>, select the exact contract-plan-segment, then choose <b>Albuterol HFA</b>."),
        ("2:00", "Show standalone Part D", "Switch to <b>Standalone Medicare Part D</b>. Search <b>S4802-078</b> or <b>Wellcare Classic</b>. Explain that the prescription-drug card—not Original Medicare alone—identifies this benefit."),
        ("3:05", "Show an exact connector", "Use UHC NJ Marketplace plan <b>37777NJ0100002</b> and a suggested albuterol product, or use Aetna NJ FamilyCare and select the exact 11-digit NDC."),
        ("4:05", "Show the safe failure state", "Use an unmatched plan/product and point to <b>Unconfirmed, not a denial</b>. Explain that the portal fails closed instead of guessing from another plan."),
        ("4:40", "Make the offer", "Ask for the clinic’s 10–20 highest-volume plan families and 25–50 medication products. Offer the $500, 60-day clinic proof."),
    ]))
    story += [Spacer(1, 0.1 * inch), p("Demo URL: <u>https://formulary-finder-pilot-production.up.railway.app/</u>", "small"), PageBreak()]

    story += runbook_header("Buyer conversation", "Turn interest into a scoped clinic proof", "The goal is a clear next step, not a promise that every plan or medication is already loaded.")
    discovery = [
        p("DISCOVERY QUESTIONS", "eyebrow"),
        p("Find the high-volume pain", "h2"),
        bullets([
            "Which plan families generate the most staff work?",
            "Which medications produce the most callbacks or prior-authorization questions?",
            "Who owns the final formulary verification today?",
            "Where does the team leave the EHR or current portal?",
            "How would you judge this workflow after 60 days?",
        ]),
        p("Ask for deidentified plan and medication examples only. Do not request screenshots containing member information.", "small"),
    ]
    offer = [
        p("THE OFFER", "eyebrow"),
        p("Low-risk pricing that respects clinic budgets", "h2"),
        p("<b>$500 clinic proof</b><br/>60 days, one NJ location, credited toward annual conversion.", "body"),
        p("<b>$149 Core / month</b><br/>Up to 10 prescribers and unlimited support staff.", "body"),
        p("<b>$249 Plus / month</b><br/>Up to 25 prescribers, a broader plan pack, and feasible standard source additions.", "body"),
        p("No per-seat fees for nurses, medical assistants, or authorization staff.", "small"),
    ]
    story += [two_col(discovery, offer), Spacer(1, 0.2 * inch)]

    story += [p("OBJECTION HANDLING", "eyebrow"), p("Be direct, credible, and commercially confident", "h2")]
    objections = [
        ("“The payer website is free.”", "Correct. The clinic pays for one configured workflow, normalized source evidence, source maintenance, and fewer wrong-plan starts across the payer mix it actually sees."),
        ("“CoverMyMeds is free.”", "CoverMyMeds is an electronic prior-authorization network. Formulary Finder supports the earlier plan and product evidence step and provides the official PA form or route when available."),
        ("“Does it guarantee coverage?”", "It shows what the exact source says when the match is complete. Eligibility, cost, payment, and final benefit determination remain with the payer."),
        ("“What if our plan is missing?”", "Send the clinic’s plan list. Already-supported workflows are configured first; missing high-volume sources receive a documented feasibility review and priority order."),
        ("“Can we use patient data?”", "The current product is intentionally PHI-free. Patient-specific use requires a separate security, access-control, contracting, and BAA workstream."),
    ]
    table = Table([[p(q, "card_title"), p(a, "body")] for q, a in objections], colWidths=[2.25 * inch, 4.87 * inch])
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [PALE, WHITE]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [table, PageBreak()]

    story += runbook_header("Close and follow-up", "Leave every buyer with one concrete action", "The best close is permission to review the clinic’s actual payer mix and schedule the proof kickoff.")
    close_box = Table([[p("<b>Decision request:</b> “If this workflow fits the way your team works, let’s use your top plan and medication list to scope a 60-day clinic proof. We can confirm feasibility before you commit to any unsupported source.”", "quote")]], colWidths=[PAGE_W - 2 * MARGIN])
    close_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), MINT),
        ("BOX", (0, 0), (-1, -1), 0.8, TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ]))
    story += [close_box, Spacer(1, 0.18 * inch)]

    checklist = [
        p("WHAT TO COLLECT", "eyebrow"),
        p("No PHI required", "h2"),
        bullets([
            "10–20 highest-volume insurer and plan-family names.",
            "25–50 medication products, including device, strength, and dosage form when relevant.",
            "Counties served and common coverage types.",
            "Deidentified examples of common and difficult lookups.",
            "One clinical operations owner for weekly review.",
        ]),
    ]
    success = [
        p("WHAT TO MEASURE", "eyebrow"),
        p("Make the proof earn the subscription", "h2"),
        bullets([
            "Median time to an interpretable result.",
            "Exact-plan and exact-product selection rate.",
            "Supported lookups completed without starting on another site.",
            "Correction and unconfirmed-result rates.",
            "Source freshness exceptions and critical false-confirmed results.",
            "Staff usefulness rating and next-source priorities.",
        ]),
    ]
    story += [two_col(checklist, success), Spacer(1, 0.16 * inch)]

    story += [p("FOLLOW-UP EMAIL", "eyebrow"), p("Copy, personalize, and send after the meeting", "h2")]
    email = (
        "<b>Subject:</b> Formulary Finder clinic proof — next step<br/><br/>"
        "Thank you for walking through your medication-access workflow with me. Formulary Finder can be configured around the plan families and medication products your team sees most, without collecting patient information.<br/><br/>"
        "The proposed next step is a $500, 60-day clinic proof for one New Jersey location. The fee is credited toward an annual subscription. We will configure already-supported plan workflows, review missing high-volume sources for feasibility, train staff, and report time-to-answer, exact-match, correction, and unresolved-result measures.<br/><br/>"
        "To scope it, please send: (1) the top 10–20 plan families, (2) 25–50 high-volume medication products, and (3) the name of the clinical operations owner. Please do not include member IDs, names, dates of birth, diagnoses, or other patient information.<br/><br/>"
        "I’ll return a bounded scope and kickoff plan after the source review."
    )
    email_box = Table([[p(email, "body")]], colWidths=[PAGE_W - 2 * MARGIN])
    email_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story += [email_box, Spacer(1, 0.12 * inch), p("Internal reminder: do not claim measured time savings, denial reduction, or revenue impact until a clinic has produced verified baseline and post-proof data.", "small")]

    OUT.mkdir(parents=True, exist_ok=True)
    BrandedDoc(str(RUNBOOK), "Formulary Finder Demo Runbook", "Presenter script, discovery questions, pricing, objections, and follow-up").build(story)


if __name__ == "__main__":
    build_overview()
    build_runbook()
    print(OVERVIEW)
    print(RUNBOOK)
