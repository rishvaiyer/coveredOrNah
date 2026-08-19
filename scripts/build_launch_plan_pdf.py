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
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PATH = OUTPUT_DIR / "Formulary_Finder_Launch_Plan.pdf"

INK = HexColor("#163A3A")
TEAL = HexColor("#0B6D69")
MUTED = HexColor("#557573")
CORAL = HexColor("#D86F4B")
MINT = HexColor("#EAF6F3")
PALE = HexColor("#F7FBFA")
GOLD = HexColor("#9B6A20")
GOLD_PALE = HexColor("#FFF8E8")
LINE = HexColor("#C8DFDA")
WHITE = colors.white

PAGE_W, PAGE_H = letter
LEFT = 0.72 * inch
RIGHT = 0.72 * inch
TOP = 0.72 * inch
BOTTOM = 0.62 * inch


class LaunchDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(
            filename,
            pagesize=letter,
            leftMargin=LEFT,
            rightMargin=RIGHT,
            topMargin=TOP,
            bottomMargin=BOTTOM,
            title="Formulary Finder Launch Plan",
            author="Formulary Finder",
            subject="Pricing, packaging, launch gates, sales motion, and 90-day execution plan",
        )
        frame = Frame(
            LEFT,
            BOTTOM,
            PAGE_W - LEFT - RIGHT,
            PAGE_H - TOP - BOTTOM,
            id="main",
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
        )
        self.addPageTemplates(PageTemplate(id="launch", frames=[frame], onPage=self._page_furniture))

    @staticmethod
    def _page_furniture(canvas, doc):
        page = canvas.getPageNumber()
        if page == 1:
            return
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.6)
        canvas.line(LEFT, PAGE_H - 0.42 * inch, PAGE_W - RIGHT, PAGE_H - 0.42 * inch)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawString(LEFT, PAGE_H - 0.31 * inch, "FORMULARY FINDER  |  LAUNCH PLAN")
        canvas.setFont("Helvetica", 7.5)
        canvas.drawRightString(PAGE_W - RIGHT, 0.33 * inch, f"August 2026  |  Page {page}")
        canvas.restoreState()


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=32,
            leading=34,
            textColor=WHITE,
            alignment=TA_LEFT,
            spaceAfter=10,
        ),
        "cover_sub": ParagraphStyle(
            "CoverSub",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=13,
            leading=18,
            textColor=HexColor("#DDF2ED"),
            spaceAfter=7,
        ),
        "cover_label": ParagraphStyle(
            "CoverLabel",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.5,
            leading=11,
            textColor=HexColor("#CDEBE5"),
            tracking=1.5,
            spaceAfter=14,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=25,
            textColor=INK,
            spaceAfter=11,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=TEAL,
            spaceBefore=8,
            spaceAfter=6,
            keepWithNext=True,
        ),
        "eyebrow": ParagraphStyle(
            "Eyebrow",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=CORAL,
            tracking=1.4,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.4,
            leading=13.5,
            textColor=INK,
            spaceAfter=6,
        ),
        "body_small": ParagraphStyle(
            "BodySmall",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=11.5,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "body_white": ParagraphStyle(
            "BodyWhite",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=13,
            textColor=WHITE,
        ),
        "card_title": ParagraphStyle(
            "CardTitle",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=13,
            textColor=INK,
            spaceAfter=3,
        ),
        "card_price": ParagraphStyle(
            "CardPrice",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=19,
            textColor=TEAL,
            spaceAfter=5,
        ),
        "table_head": ParagraphStyle(
            "TableHead",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.7,
            leading=9.5,
            textColor=WHITE,
        ),
        "table_body": ParagraphStyle(
            "TableBody",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.6,
            leading=10.3,
            textColor=INK,
        ),
        "table_bold": ParagraphStyle(
            "TableBold",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.7,
            leading=10.3,
            textColor=INK,
        ),
        "source": ParagraphStyle(
            "Source",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.2,
            leading=10.2,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=19,
            textColor=WHITE,
            alignment=TA_CENTER,
        ),
    }


S = styles()


def p(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, S[style])


def bullet_list(items: list[str], level: int = 0) -> ListFlowable:
    return ListFlowable(
        [ListItem(p(item), leftIndent=8) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=17 + level * 10,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        bulletColor=TEAL,
        spaceAfter=7,
    )


def section_header(label: str, title: str, intro: str | None = None):
    parts = [p(label.upper(), "eyebrow"), p(title, "h1")]
    if intro:
        parts.append(p(intro))
    return parts


def note_box(title: str, text: str, fill=MINT, accent=TEAL):
    content = Paragraph(f'<font color="{accent.hexval()}"><b>{title}</b></font><br/>{text}', S["body"])
    table = Table([[content]], colWidths=[PAGE_W - LEFT - RIGHT])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), fill),
                ("BOX", (0, 0), (-1, -1), 0.8, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return table


def data_table(headers: list[str], rows: list[list[str]], widths: list[float]):
    data = [[p(h, "table_head") for h in headers]]
    for row in rows:
        data.append([p(value, "table_bold" if index == 0 else "table_body") for index, value in enumerate(row)])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    for row_index in range(1, len(data)):
        if row_index % 2 == 0:
            style.append(("BACKGROUND", (0, row_index), (-1, row_index), PALE))
    table.setStyle(TableStyle(style))
    return table


def pricing_cards():
    card_w = (PAGE_W - LEFT - RIGHT - 0.24 * inch) / 3
    cards = []
    specs = [
        (
            "DESIGN PARTNER",
            "60-day clinic proof",
            "$500 total",
            "One NJ location, up to 10 prescribers, unlimited staff, insurer-list intake, onboarding, and a measured workflow review. Fully credited toward annual conversion.",
        ),
        (
            "CLINIC CORE",
            "Supported clinic workflow",
            "$149 / location / month",
            "Up to 10 prescribers, unlimited staff, 10 supported plan families, pulmonary library, source-visible results, PA-form routes, and monthly source review.",
        ),
        (
            "CLINIC PLUS",
            "Managed expansion",
            "$249 / location / month",
            "Up to 25 prescribers, unlimited staff, 20 plan families, two feasible standard source additions per year, reporting, and priority corrections.",
        ),
    ]
    for label, title, price, detail in specs:
        cell = [
            p(f'<font color="{CORAL.hexval()}"><b>{label}</b></font>', "body_small"),
            p(title, "card_title"),
            p(price, "card_price"),
            p(detail, "body_small"),
        ]
        cards.append(cell)
    table = Table([cards], colWidths=[card_w, card_w, card_w], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), PALE),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 11),
                ("RIGHTPADDING", (0, 0), (-1, -1), 11),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    return table


def timeline_table():
    rows = [
        ["Days 0-14", "Package and recruit", "Finalize buyer materials; identify 25 NJ pulmonary and allergy groups; secure five discovery calls; demonstrate two de-identified workflows."],
        ["Days 15-30", "Close design partners", "Offer the $500 proof; collect top plan families and medication priorities; define success measures and correction ownership."],
        ["Days 31-60", "Run and measure", "Configure supported plan packs; onboard staff; track lookup completion, time-to-answer, corrections, and unconfirmed results."],
        ["Days 61-90", "Convert and repeat", "Review evidence; convert qualified clinics to Core or Plus; publish one approved case study; create the next connector backlog from actual demand."],
    ]
    return data_table(["Period", "Objective", "Required output"], rows, [0.9 * inch, 1.25 * inch, 4.05 * inch])


def cover_story():
    brand = Table(
        [
            [
                [
                    p("COMMERCIAL LAUNCH PLAN", "cover_label"),
                    p("Formulary Finder", "title"),
                    p("A clinic-configured medication-access workflow for New Jersey specialty practices.", "cover_sub"),
                    Spacer(1, 0.22 * inch),
                    p("Pricing hypotheses, packaging, market position, launch gates, sales motion, and 90-day execution.", "cover_sub"),
                ]
            ]
        ],
        colWidths=[PAGE_W - LEFT - RIGHT],
    )
    brand.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), TEAL),
                ("LEFTPADDING", (0, 0), (-1, -1), 26),
                ("RIGHTPADDING", (0, 0), (-1, -1), 26),
                ("TOPPADDING", (0, 0), (-1, -1), 36),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 36),
            ]
        )
    )
    return [
        Spacer(1, 0.42 * inch),
        brand,
        Spacer(1, 0.35 * inch),
        note_box(
            "Launch pricing hypothesis",
            "Start with a $500 paid design-partner proof. Convert only after the clinic's high-volume supported plans are configured and the workflow demonstrates practical value. Test $149 Core and $249 Plus per location monthly, with no per-staff fees, across the first qualified clinic conversations.",
            fill=GOLD_PALE,
            accent=GOLD,
        ),
        Spacer(1, 0.28 * inch),
        Table(
            [
                [p("Prepared for", "body_small"), p("Rishva Iyer - Product owner", "card_title")],
                [p("Market", "body_small"), p("New Jersey pulmonary and adjacent specialty clinics", "card_title")],
                [p("Version", "body_small"), p("August 19, 2026 - Launch plan v1.1", "card_title")],
            ],
            colWidths=[1.1 * inch, 5.1 * inch],
            style=TableStyle(
                [
                    ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            ),
        ),
        Spacer(1, 0.35 * inch),
        p("Know what the plan says before you prescribe.", "quote"),
    ]


def build_story():
    story = []
    story.extend(cover_story())
    story.append(PageBreak())

    story.extend(section_header("01 / Executive decision", "What we are launching", "A focused clinic proof, not an unlimited national formulary promise."))
    story.append(
        note_box(
            "Primary offer",
            "Give us the insurers and plan families your clinic actually sees. We configure and maintain that medication-access workflow for the entire care team, without per-staff fees or an enterprise implementation.",
        )
    )
    story.append(Spacer(1, 0.14 * inch))
    story.append(p("The first sellable wedge", "h2"))
    story.append(
        bullet_list(
            [
                "Independent New Jersey pulmonary or allergy clinics with 5-20 prescribers.",
                "Practice administrator or clinical operations leader as buyer.",
                "Nurse, authorization specialist, pharmacist, or practice manager as daily champion.",
                "PHI-free start with no EHR integration required.",
                "Clinic-provided top insurer, plan-family, and medication priority list.",
            ]
        )
    )
    story.append(p("What the buyer gains", "h2"))
    story.append(
        bullet_list(
            [
                "One repeatable insurer-to-plan-to-product workflow instead of scattered payer pages and PDFs.",
                "Source dates, published tier and restriction details, and direct PA-form or official route access where available.",
                "Autocomplete and dependent filtering that reduce wrong-plan lookups.",
                "A maintained source trail, correction queue, and prioritized missing-source backlog.",
                "Explicit unresolved handling: unconfirmed is not a denial.",
            ]
        )
    )
    story.append(p("What we do not sell", "h2"))
    story.append(
        bullet_list(
            [
                "Patient-specific eligibility, cost, payment, approval, or guaranteed coverage.",
                "Electronic PA submission, appeals management, or EHR integration in the launch package.",
                "Every insurer, every plan, every medication, or every state.",
            ]
        )
    )
    story.append(PageBreak())

    story.extend(section_header("02 / Pricing", "A credible low-friction clinic offer", "Pricing remains a hypothesis until qualified clinic buyers react to it."))
    story.append(pricing_cards())
    story.append(Spacer(1, 0.18 * inch))
    story.append(p("Additional commercial terms", "h2"))
    story.append(
        data_table(
            ["Item", "Launch term"],
            [
                ["Multi-site", "From $599/month for up to five locations using one shared payer configuration."],
                ["Unsupported payer source", "$250-$750 one time after source feasibility, rights, refresh cadence, and deliverables are confirmed."],
                ["Annual option", "10% discount and 12-month price lock. Keep monthly purchasing available during initial market validation."],
                ["Custom state, specialty, or integration", "Separate written scope. Do not hide licensing or recurring manual research inside the base subscription."],
            ],
            [1.55 * inch, 4.65 * inch],
        )
    )
    story.append(Spacer(1, 0.15 * inch))
    story.append(
        note_box(
            "Margin rule",
            "At $149/month and a 75% gross-margin target, direct recurring service cost must remain below approximately $37 per clinic per month. Build each payer connector once, version it centrally, and reuse it across clinics.",
            fill=GOLD_PALE,
            accent=GOLD,
        )
    )
    story.append(Spacer(1, 0.16 * inch))
    story.append(p("Price validation rule", "h2"))
    story.append(p("Keep this pricing hypothesis if at least two of the first five qualified NJ clinics accept the $500 proof without a special discount. Reduce scope before reducing price when custom-source labor is the objection."))
    story.append(PageBreak())

    story.extend(section_header("03 / Market position", "Why this will not get laughed out of the room", "The price is anchored below multi-seat prescribing tools and far below integrated PA automation, while preserving a paid operational service."))
    story.append(
        data_table(
            ["Market reference", "Public price", "Commercial lesson"],
            [
                ["CoverMyMeds", "$0 for providers and pharmacists", "Do not charge for PA access alone. Position Formulary Finder as earlier plan navigation and source evidence."],
                ["Surescripts PA Portal", "$0 for portal users", "A submission portal is not the paid differentiator. Formulary Finder should work alongside ePA tools."],
                ["DrFirst iPrescribe", "$30-$50 per prescriber/month", "Five Practice licenses cost about $250/month and include prescribing and PA automation."],
                ["MDToolbox", "$28-$35 per prescriber/month on annual plans", "Five Complete seats cost about $175/month and include formulary, pricing, ePA, and e-prescribing."],
                ["Practice Fusion ePrescribe", "$59 per provider/month", "Five seats cost $295/month and include actual prescribing."],
                ["RXNT ePrescribing", "$665 per prescriber/year plus EPCS fee", "Full e-prescribing establishes an approximate $55/provider monthly anchor before EPCS."],
                ["Prioriq Clinic", "$490/month or $420/month annually", "PA automation and EHR integration support a higher price than research and navigation alone."],
                ["MMIT, FDB, Medi-Span", "Custom enterprise licensing", "National data infrastructure is a later build-or-buy decision, not the current clinic price comparison."],
            ],
            [1.35 * inch, 1.5 * inch, 3.35 * inch],
        )
    )
    story.append(Spacer(1, 0.16 * inch))
    story.append(
        note_box(
            "Competitive sentence",
            "Enterprise-grade source discipline without an enterprise implementation. The clinic pays for configuration, normalization, maintenance, and a repeatable workflow - not for access to a public payer document.",
        )
    )
    story.append(PageBreak())

    story.extend(section_header("04 / Readiness gates", "What must be true before recurring sales", "The product can be demonstrated now. Recurring billing requires a clinic-specific sold pack that is trustworthy and supportable."))
    story.append(
        data_table(
            ["Gate", "Required evidence before conversion"],
            [
                ["Plan fit", "The clinic's highest-volume supported plan families are configured and easy to select."],
                ["Product exactness", "Every sold result shows the exact product, strength, form, device, or a clearly bounded family-level result."],
                ["Source trust", "Source URL, effective date, last-reviewed date, and published restrictions are visible or documented."],
                ["Safe absence", "Missing exact evidence remains unconfirmed, not a denial or noncoverage statement."],
                ["Correction path", "The clinic knows how to report an error and receives a defined response target."],
                ["Workflow value", "Named staff confirm the workflow is faster or clearer than their current process."],
                ["Operations", "Refresh ownership, source-drift checks, and connector maintenance costs are assigned."],
                ["Security boundary", "The launch workflow remains PHI-free. Patient-specific workflows require separate security, access, audit, contracting, and HIPAA/BAA assessment."],
            ],
            [1.45 * inch, 4.75 * inch],
        )
    )
    story.append(Spacer(1, 0.16 * inch))
    story.append(p("Current proof points", "h2"))
    story.append(
        bullet_list(
            [
                "Live New Jersey-focused clinician portal with 85 medication families and 17 plan-family baselines.",
                "Exact Medicare Advantage and standalone Part D routing plus validated UHC Marketplace, Aetna NJ FamilyCare, UHC Community, Fidelis NJ FamilyCare, Horizon NJ Health, and Wellpoint NJ FamilyCare workflows.",
                "Deterministic local audit records 1,011 of 1,445 medication-plan cells as source-confirmed; 434 remain explicitly unconfirmed.",
                "Clinician guide, demo package, source matrix, sales materials, and PHI-free plan-list intake template are prepared.",
            ]
        )
    )
    story.append(PageBreak())

    story.extend(section_header("05 / Execution", "The first 90 days", "Keep the launch narrow: New Jersey specialty clinics, validated plan packs, and measured workflow value."))
    story.append(timeline_table())
    story.append(Spacer(1, 0.18 * inch))
    story.append(p("Fastest product improvements", "h2"))
    story.append(
        bullet_list(
            [
                "Add a safe insurer-list intake destination after choosing an approved business contact or CRM.",
                "Show source review dates and a correction-request path consistently across result families.",
                "Instrument PHI-free lookup completion, time-to-answer, and unconfirmed frequency.",
                "Use clinic volume to prioritize the next reusable payer connector instead of chasing every possible insurer.",
                "Expand pulmonary to allergy/immunology first, then biologic-heavy specialties only after the NJ launch process works.",
            ]
        )
    )
    story.append(p("Do not do yet", "h2"))
    story.append(
        bullet_list(
            [
                "Do not add PHI, member IDs, EHR integration, or automated PA submission before security and contracting work.",
                "Do not expand nationally before source ownership and reusable connector economics are proven.",
                "Do not buy licensed formulary data until real clinic demand justifies the contract and unit economics.",
            ]
        )
    )
    story.append(PageBreak())

    story.extend(section_header("06 / Sales playbook", "How to run the first clinic conversation", "Lead with the clinic's workflow, not the number of database rows."))
    story.append(p("Five-minute demonstration", "h2"))
    story.append(
        data_table(
            ["Step", "What to show", "What it proves"],
            [
                ["1", "Select the major insurer and coverage type.", "The workflow starts from information staff recognize on the card."],
                ["2", "Choose only plan families compatible with that insurer.", "Dependent filtering prevents irrelevant subplan clutter."],
                ["3", "Select the exact medication product with autocomplete.", "A small spelling error does not force exact manual typing."],
                ["4", "Review the source, tier, PA, QL, or ST details.", "The evidence and restrictions remain inspectable."],
                ["5", "Download the official PA form or open the payer route when available.", "The result leads to a practical next action."],
                ["6", "Show one unconfirmed result.", "The product does not invent a denial when exact evidence is missing."],
            ],
            [0.42 * inch, 2.8 * inch, 2.98 * inch],
        )
    )
    story.append(Spacer(1, 0.16 * inch))
    story.append(p("Discovery questions", "h2"))
    story.append(
        bullet_list(
            [
                "Which insurers, exact plan families, and PBMs create the most staff work?",
                "Which medications, strengths, and devices generate the most coverage questions?",
                "How many staff members participate, and what tools do they use now?",
                "How long does a typical lookup take before staff have an interpretable next step?",
                "What would make a 60-day proof clearly successful or clearly unsuccessful?",
                "Would $149 or $249 per location require additional budget approval?",
            ]
        )
    )
    story.append(p("Objection handling", "h2"))
    story.append(
        data_table(
            ["Buyer objection", "Response"],
            [
                ["CoverMyMeds is free.", "Correct. Formulary Finder is earlier plan navigation and maintained source evidence, not another ePA submission portal."],
                ["Our EHR already does this.", "Compare exact plan/product selection, source visibility, unresolved handling, and PA-form routing. If the EHR is faster, do not force a sale."],
                ["The payer website is free.", "The clinic pays for normalization, maintenance, insurer-specific routing, and one repeatable workflow across its payer mix."],
                ["We do not want another portal.", "Keep onboarding short, support unlimited staff, require no patient re-entry, and target a sub-minute lookup for supported scenarios."],
            ],
            [1.75 * inch, 4.45 * inch],
        )
    )
    story.append(PageBreak())

    story.extend(section_header("07 / Measurement", "Evidence that earns the renewal", "The first contracts should be won with measured workflow value, not unverified savings claims."))
    story.append(
        data_table(
            ["Metric", "How to measure", "Why it matters"],
            [
                ["Lookup completion", "Percent of started supported lookups reaching an interpretable result.", "Shows whether the workflow is usable."],
                ["Time-to-answer", "Median time from insurer selection to result interpretation.", "Directly tests staff efficiency."],
                ["Exact-plan selection", "Percent of workflows using a confirmed exact plan or bounded named formulary.", "Reduces carrier-level assumptions."],
                ["Unconfirmed rate", "Share of lookups without a complete exact source match, grouped by plan and product.", "Creates the connector backlog."],
                ["Correction rate", "Results corrected after staff or source review.", "Measures product reliability and mapping quality."],
                ["Source freshness", "Sources past their expected review cadence.", "Protects buyer trust."],
                ["Repeat use", "Named staff completing multiple workflows each week.", "Indicates practical adoption."],
                ["Conversion", "Paid proofs converting to Core or Plus without a special discount.", "Validates pricing and buyer value."],
            ],
            [1.2 * inch, 2.8 * inch, 2.2 * inch],
        )
    )
    story.append(Spacer(1, 0.16 * inch))
    story.append(
        note_box(
            "Break-even test",
            "At a conservative $30 hourly staff cost, Core breaks even after about 5 hours saved per month and Plus after about 8.3 hours. Across 20 business days, those thresholds are roughly 15 and 25 minutes saved per day. Measure this before using it as a claim.",
            fill=GOLD_PALE,
            accent=GOLD,
        )
    )
    story.append(Spacer(1, 0.18 * inch))
    story.append(p("Go / no-go after five clinics", "h2"))
    story.append(
        bullet_list(
            [
                "GO: at least two qualified clinics accept the paid proof; supported workflows are trusted; maintenance costs fit the pricing hypothesis.",
                "REVISE: buyers want the product but custom-source work exceeds the service budget. Tighten scope or raise Plus pricing.",
                "NO-GO: clinics consistently prefer existing EHR/payer workflows and measured time-to-answer does not improve.",
            ]
        )
    )
    story.append(PageBreak())

    story.extend(section_header("08 / Launch checklist and sources", "The exact next actions", "A short sequence that turns the current product into a measured commercial launch."))
    story.append(
        data_table(
            ["Owner action", "Status / required evidence"],
            [
                ["Test the launch prices", "$500 proof; $149 Core; $249 Plus; multi-site from $599."],
                ["Choose an intake destination", "Approved business email, CRM form, or secure upload path. Do not publish a personal address by default."],
                ["Build the first 25-account list", "NJ pulmonary and allergy clinics with 5-20 prescribers and visible formulary burden."],
                ["Book five discovery calls", "Capture plan mix, staff workflow, price reaction, and success criteria."],
                ["Close two design partners", "Use a written 60-day scope, no PHI, and the clinic's prioritized plan list."],
                ["Measure before claiming", "Publish time savings or outcomes only after clinic-approved evidence exists."],
            ],
            [1.75 * inch, 4.45 * inch],
        )
    )
    story.append(Spacer(1, 0.18 * inch))
    story.append(p("Primary market sources", "h2"))
    sources = [
        ("CoverMyMeds provider pricing", "https://www.covermymeds.com/main/support/general/is-covermymeds-free-to-use/"),
        ("Surescripts Electronic Prior Authorization", "https://surescripts.com/products/electronic-prior-authorization"),
        ("DrFirst iPrescribe pricing", "https://www.iprescribe.com/pricing"),
        ("MDToolbox pricing", "https://mdtoolbox.com/pricing.aspx"),
        ("Practice Fusion ePrescribe offer", "https://info.practicefusion.com/eprescribing-solution-for-quanum-clients"),
        ("RXNT pricing", "https://www.rxnt.com/pricing/"),
        ("Prioriq pricing", "https://www.prioriqo.com/pricing"),
        ("MMIT API licensing terms", "https://api.mmitnetwork.com/Home/TermsOfService"),
        ("CMS Electronic Prior Authorization overview", "https://www.cms.gov/priorities/electronic-prior-authorization/overview"),
        ("AMA prior authorization burden", "https://www.ama-assn.org/practice-management/prior-authorization/fixing-prior-auth-nearly-40-prior-authorizations-week-way"),
    ]
    for name, url in sources:
        story.append(Paragraph(f'<b>{name}</b><br/><link href="{url}" color="#0B6D69">{url}</link>', S["source"]))
    story.append(Spacer(1, 0.12 * inch))
    story.append(
        note_box(
            "Final boundary",
            "Formulary Finder is a source-visible medication-access workflow. It does not determine eligibility, member cost, payment, approval, or guaranteed coverage. Exact product and plan context still matter, and source absence is never a denial.",
        )
    )
    return story


def build():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = LaunchDocTemplate(str(OUTPUT_PATH))
    doc.build(build_story())
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build()
