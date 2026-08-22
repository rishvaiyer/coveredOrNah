from __future__ import annotations

from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak


ROOT = Path(__file__).resolve().parents[1]
OUT = Path('/Users/unevil-warden-scallion-princess-no-rollback/Desktop/Main Folder/formulary/Formulary_Finder_Client_Deliverables')
PAGE_W, PAGE_H = letter
MARGIN = 0.68 * inch
INK = colors.HexColor('#173B3A')
TEAL = colors.HexColor('#0B6D69')
CORAL = colors.HexColor('#D87351')
MUTED = colors.HexColor('#5C7472')
PALE = colors.HexColor('#F7FBFA')
MINT = colors.HexColor('#EAF6F3')
LINE = colors.HexColor('#C9DEDA')


def styles():
    base = getSampleStyleSheet()
    return {
        'title': ParagraphStyle('Title', parent=base['Title'], fontName='Helvetica-Bold', fontSize=27, leading=31, textColor=INK, spaceAfter=10),
        'subtitle': ParagraphStyle('Subtitle', parent=base['BodyText'], fontName='Helvetica', fontSize=12, leading=17, textColor=MUTED, spaceAfter=13),
        'h1': ParagraphStyle('H1', parent=base['Heading1'], fontName='Helvetica-Bold', fontSize=19, leading=23, textColor=INK, spaceBefore=8, spaceAfter=8, keepWithNext=True),
        'h2': ParagraphStyle('H2', parent=base['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=TEAL, spaceBefore=8, spaceAfter=4, keepWithNext=True),
        'body': ParagraphStyle('Body', parent=base['BodyText'], fontName='Helvetica', fontSize=9.3, leading=13.2, textColor=INK, spaceAfter=5),
        'small': ParagraphStyle('Small', parent=base['BodyText'], fontName='Helvetica', fontSize=7.8, leading=10.4, textColor=MUTED, spaceAfter=4),
        'bullet': ParagraphStyle('Bullet', parent=base['BodyText'], fontName='Helvetica', fontSize=9.2, leading=13, leftIndent=12, firstLineIndent=-8, textColor=INK, spaceAfter=3),
        'eyebrow': ParagraphStyle('Eyebrow', parent=base['BodyText'], fontName='Helvetica-Bold', fontSize=7.5, leading=9, textColor=CORAL, spaceAfter=5),
    }


S = styles()


class Doc(BaseDocTemplate):
    def __init__(self, path: Path, title: str):
        super().__init__(str(path), pagesize=letter, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=0.72 * inch, bottomMargin=0.56 * inch, title=title, author='Formulary Finder')
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id='main', frames=[frame], onPage=self.furniture))

    @staticmethod
    def furniture(canvas, doc):
        if canvas.getPageNumber() == 1:
            return
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.line(MARGIN, PAGE_H - 0.43 * inch, PAGE_W - MARGIN, PAGE_H - 0.43 * inch)
        canvas.setFont('Helvetica-Bold', 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(MARGIN, PAGE_H - 0.32 * inch, 'FORMULARY FINDER')
        canvas.setFont('Helvetica', 7)
        canvas.drawRightString(PAGE_W - MARGIN, 0.31 * inch, f'Page {canvas.getPageNumber()}')
        canvas.restoreState()


def p(text: str, style='body') -> Paragraph:
    return Paragraph(text, S[style])


def bullets(items):
    return [p(f'• {item}', 'bullet') for item in items]


def cover(label: str, title: str, subtitle: str):
    box = Table([[p(label.upper(), 'eyebrow'), p(title, 'title'), p(subtitle, 'subtitle')]], colWidths=[PAGE_W - 2 * MARGIN])
    box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), MINT),
        ('BOX', (0, 0), (-1, -1), 0.8, LINE),
        ('LEFTPADDING', (0, 0), (-1, -1), 18), ('RIGHTPADDING', (0, 0), (-1, -1), 18),
        ('TOPPADDING', (0, 0), (-1, -1), 16), ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
    ]))
    return [box, Spacer(1, 0.18 * inch)]


def section(title, body, items=None):
    out = [p(title, 'h2'), p(body)]
    if items:
        out.extend(bullets(items))
    return out


def build(name: str, label: str, title: str, subtitle: str, content):
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    def flatten(items):
        result = []
        for item in items:
            if isinstance(item, list):
                result.extend(flatten(item))
            else:
                result.append(item)
        return result
    story = flatten(cover(label, title, subtitle) + content)
    story.append(Spacer(1, 0.12 * inch))
    story.append(p('Prepared for qualified clinic conversations. PHI-free pilot scope. Source-listed evidence is not a guarantee of eligibility, cost, payment, approval, or coverage.', 'small'))
    Doc(path, title).build(story)


def main():
    build('01_Executive_Brief.pdf', 'Client brief', 'Formulary Finder', 'A source-visible medication-access workflow for New Jersey specialty clinics.', [
        p('The product helps clinic teams route from an insurance card to the exact plan, medication product, restriction signals, and official source evidence. It is designed to reduce avoidable payer-portal and PDF hunting while keeping uncertainty visible.', 'body'),
        section('What is verified today', 'The current implementation is a working, supervised demo and design-partner pilot.', ['85 medication families in the quick-search catalog.', '17 New Jersey plan-family baselines.', 'Exact CMS plan selection for New Jersey Medicare Advantage and standalone Part D.', 'Exact or source-backed product checks across bounded New Jersey payer paths.', 'A deliberate “unconfirmed, not a denial” state when evidence is incomplete.']),
        section('The proposed client offer', 'A 60-day, PHI-free design-partner proof for one New Jersey clinic or specialty group.', ['Configure the clinic’s 10 to 20 highest-volume plan families and medications.', 'Run deidentified or synthetic scenarios with five to ten named staff.', 'Review false matches, unconfirmed results, source freshness, and lookup time weekly.', 'End with a measured expand, revise, or stop decision.']),
        section('The ask', 'Approve a 20-minute workflow conversation with a practice administrator and one clinical staff champion. The first goal is fit evidence, not a national product claim.'),
    ])

    build('03_Clinic_Pilot_Proposal.pdf', 'Pilot proposal', 'A measured 60-day proof', 'A bounded path from demonstration to evidence-backed clinic adoption.', [
        section('Pilot scope', 'One New Jersey clinic, one named source-refresh owner, and a PHI-free workflow.', ['Five to ten prescribers, nurses, medical assistants, or authorization staff.', 'Ten to 20 plan families and 25 to 50 medication products supplied by the clinic.', 'Weekly review of changed, conflicting, stale, and unconfirmed evidence.', 'No member IDs, patient names, dates of birth, diagnoses, portal credentials, or payer submissions.']),
        section('Success measures', 'The pilot is successful only if the workflow produces measurable improvement.', ['Median time from insurer selection to interpretable result.', 'Exact-plan selection rate.', 'Percentage of scenarios resolved in the portal.', 'Manual correction and false-match rate.', 'Unconfirmed-result rate and source-freshness exceptions.', 'Staff confidence compared with the current process.']),
        section('Commercial hypothesis', 'The existing package proposes a $500 proof credited toward annual conversion, with location-based monthly pricing after validation. Pricing remains a hypothesis until a buyer conversation confirms value and procurement fit.'),
        section('Exit decision', 'At day 60, the clinic and product owner decide to expand, revise the source pack, or stop. Expansion requires security and contracting review before any patient-specific workflow.'),
    ])

    build('06_Safety_Claims_and_Evidence.pdf', 'Safety and claims', 'Say exactly what the product does', 'A claim discipline sheet for demos, proposals, and outreach.', [
        section('Approved claims', 'Use these statements in client-facing materials.', ['“Source-visible medication-access workflow.”', '“Helps route staff to the correct plan and product evidence.”', '“PHI-free pilot scope.”', '“Unconfirmed is not a denial.”', '“Payer sources remain authoritative for final verification.”']),
        section('Do not claim', 'These are outside the current product boundary.', ['Patient-specific eligibility, benefit status, or cost.', 'Guaranteed coverage, payment, approval, or clinical outcomes.', 'Prior-authorization submission or EHR integration.', 'Complete coverage for every insurer, plan, county, employer, or product.', 'Clinical recommendations or automatic substitution decisions.']),
        section('Required demo language', 'The workflow displays source-listed evidence tied to an exact plan and product where available. A missing or conflicting match is shown as unconfirmed. Final benefit determination remains with the payer and the clinic’s established verification process.'),
        section('Launch gates', 'Before any PHI or production clinical workflow, require a named source owner and refresh SLA, security review, contracting review, and documented false-match monitoring.'),
    ])

    build('07_Market_and_Product_Fit_Brief.pdf', 'Market and UX brief', 'Own the evidence layer', 'A focused wedge for small specialty clinics, not a replacement for payer or EHR incumbents.', [
        section('Market signal', 'Prior authorization and formulary work are recurring operational burdens. Public industry evidence points to delay, abandonment risk, staff time, and a continued shift toward structured electronic exchange. The category is crowded, so broad “coverage lookup” positioning is weak.'),
        section('Best-fit buyer', 'Start with New Jersey specialty clinics where medication-access work crosses payer variants and manual sources.', ['Economic buyer: practice administrator or clinical operations leader.', 'Champion: nurse, pharmacist, physician, or authorization lead.', 'Daily user: coordinator or staff member routing plan and product evidence.', 'Initial wedge: pulmonary, allergy/immunology, and multispecialty clinics.']),
        section('Differentiating UX', 'The product should win on trust and exception handling.', ['Ask for exact plan identity before showing a result.', 'Show status first, then source, date, restriction signals, and confidence.', 'Separate prior authorization, step therapy, quantity limits, unavailable, stale, and conflicting states.', 'Provide a compact evidence card for staff handoffs.', 'Build a reviewed change queue, not an enormous generic database.']),
        section('Five product-fit tests', 'Run these before broad outreach or pricing confidence.', ['Five-minute lookup test with five synthetic scenarios.', 'Old-versus-new source change-diff test.', 'Trust test comparing cited uncertainty with uncited polish.', 'Eight-person workflow-value interview set.', 'Four-week concierge pilot with time, correction, and freshness measurements.']),
    ])

    build('08_Implementation_and_90_Day_Plan.pdf', 'Implementation plan', 'From pilot to proof', 'A practical 90-day operating plan with clear evidence gates.', [
        section('Days 1 to 14: configure', 'Establish a baseline before changing the workflow.', ['Name the clinic owner and source-refresh owner.', 'Collect deidentified top plans, products, and current verification steps.', 'Configure the supported plan pack and record known gaps.', 'Run five-minute synthetic usability tests.']),
        section('Days 15 to 45: supervise', 'Operate the workflow with weekly review.', ['Track lookup time, exact-plan selection, unconfirmed states, and corrections.', 'Review source freshness and false matches every week.', 'Log requests for new payer paths without promising coverage.', 'Keep all scenarios PHI-free.']),
        section('Days 46 to 60: decide', 'Turn pilot activity into a client decision packet.', ['Compare current and pilot workflow measures.', 'Document what the product resolved and what it could not resolve.', 'Prioritize the next connector or change-monitoring feature.', 'Choose expand, revise, or stop.']),
        section('Days 61 to 90: prepare expansion', 'Expansion is conditional, not automatic.', ['Complete security, contracting, and healthcare compliance review.', 'Confirm source-refresh ownership and support expectations.', 'Define annual pricing from measured value and buyer feedback.', 'Only then consider any patient-specific or authenticated integration scope.']),
    ])

    build('09_FAQ_and_Objection_Handling.pdf', 'Client FAQ', 'Questions a careful buyer will ask', 'Short, truthful answers for discovery calls and presentations.', [
        section('Why not just use the payer website?', 'The payer remains authoritative. Formulary Finder reduces routing work, keeps exact plan and product identity visible, and preserves source evidence for review.'),
        section('Can it tell me whether this patient is covered?', 'No. The current pilot shows source-listed formulary evidence. It does not determine eligibility, benefit payment, cost, or approval.'),
        section('What happens when a plan or product is missing?', 'The result stays visible as “unconfirmed, not a denial.” The gap can be logged for source review and connector prioritization.'),
        section('Can the clinic upload patient files?', 'Not in the current pilot. The pilot is deliberately PHI-free and should use synthetic or deidentified scenarios only.'),
        section('Is this replacing CoverMyMeds, Surescripts, or the EHR?', 'No. The stronger positioning is a complementary evidence and exception-routing layer for small specialty clinics.'),
        section('What would make this a real launch?', 'A named clinic, measured workflow evidence, source-refresh ownership, security and contracting review, and a buyer-approved pilot outcome.'),
    ])


if __name__ == '__main__':
    main()
