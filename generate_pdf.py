import subprocess
import sys

# Ensure fpdf2 is installed
try:
    import fpdf
except ImportError:
    print("Installing fpdf2 library...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2"])
    from fpdf import FPDF
else:
    from fpdf import FPDF

class TechnicalReportPDF(FPDF):
    def header(self):
        # Draw top banner border
        self.set_draw_color(212, 175, 55) # Gold
        self.set_line_width(0.8)
        self.line(10, 20, 200, 20)
        
        # Title branding
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(10, 10, 12) # Dark charcoal
        self.cell(0, 8, 'AURAGEMS AI JEWELLERY PLATFORM', ln=True, align='L')
        
        # Subtitle
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(113, 113, 122) # Muted gray
        self.cell(0, 4, 'Internship Assessment Report | Architecture & AI Systems Documentation', ln=True, align='L')
        self.ln(6)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(113, 113, 122)
        # Page number
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')

    def add_section_header(self, text):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(170, 124, 17) # Gold tone
        self.ln(4)
        self.cell(0, 6, text, ln=True)
        # Divider line
        self.set_draw_color(212, 175, 55)
        self.set_line_width(0.3)
        self.line(self.get_x(), self.get_y(), 200, self.get_y())
        self.ln(2)

    def add_bullet_point(self, title, desc):
        self.set_font('Helvetica', 'B', 9.5)
        self.set_text_color(10, 10, 12)
        self.write(5, "  - " + title + ": ")
        self.set_font('Helvetica', '', 9.5)
        self.set_text_color(60, 60, 60)
        self.write(5, desc + "\n")
        self.ln(1)

    def add_paragraph(self, text):
        self.set_font('Helvetica', '', 9.5)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

def generate_report():
    pdf = TechnicalReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_margins(10, 25, 10)
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Intro
    pdf.ln(5)
    pdf.add_paragraph("AuraGems AI is a premium, high-end jewellery e-commerce platform that integrates handcrafted visual design with state-of-the-art Artificial Intelligence to enhance the luxury shopping journey. Below is the technical specification of the features, architecture, and technology selections compiled for the Kalvix Nexus Internship Assessment.")
    
    # Section 1: AI Features
    pdf.add_section_header("1. AI Features Implemented & Problem-Solving Value")
    
    pdf.add_bullet_point(
        "Smart NLP Product Search",
        "Traditional keyword filters are rigid and fail under natural queries. AuraGems AI includes a natural language parser that extracts key material types (Gold, Platinum, Silver), categories (Rings, Necklaces, etc.), gemstones, and budgets directly from text. It scores items and displays an AI Match Analysis detailing the criteria matching."
    )
    
    pdf.add_bullet_point(
        "Style Profile Matchmaker",
        "Shoppers struggle to coordinate matching items or select metals complimenting their skin tone. Our 5-step interactive quiz determines undertones, statements, and lifestyle, returning a coordinated 3-item jewellery set (e.g. Ring, Necklace, Bracelet) alongside an AI Styling Rationale explaining the color match."
    )
    
    pdf.add_bullet_point(
        "AI Gift Finder & Card Note Generator",
        "Jewelleries are high-stakes gifts, creating anxiety for buyers. The Gift Finder maps the occasion (Birthday, Anniversary, etc.) and relationship (Mother, Partner, Friend) to appropriate designs, while generating a custom greeting card message."
    )
    
    pdf.add_bullet_point(
        "Conversational Styling Chatbot",
        "Answers client enquiries regarding sizing charts, return policies, gemstone care guidelines, and returns. Powered by the Google Gemini API when configured, and falls back to a locally-run rules-based intent classifier."
    )
    
    # Section 2: System Architecture
    pdf.add_section_header("2. System Architecture")
    pdf.add_paragraph("AuraGems AI adopts a decoupled client-server architecture. The backend acts as a stateless REST API validating data formats and running NLP calculations. The frontend handles state routing and client views.")
    pdf.add_paragraph("Crucially, a 'Graceful Client Fallback' is implemented: if the backend server goes offline, the frontend API service layer (api.js) replicates all search parsing, style matching, gift notes, and chatbot replies directly in the browser. This guarantees offline demo reliability.")

    # Section 3: Technologies Used
    pdf.add_section_header("3. Technologies Used")
    
    pdf.add_bullet_point("React.js (Vite)", "For modular component-based layouts, instant hot-reloading development speed, and efficient single-page state routing.")
    pdf.add_bullet_point("FastAPI (Python 3.13)", "A high-performance ASGI framework powering fast asynchronous JSON operations, request validating, and automatic Swagger docs.")
    pdf.add_bullet_point("Vanilla CSS (HSL Tokens)", "Designed and customized from scratch to establish premium glassmorphic cards, gold glow colors, and smooth fade-in animations without relying on template frameworks.")
    pdf.add_bullet_point("Pydantic & Python Dotenv", "For validating incoming API models and loading project configurations safely.")
    pdf.add_bullet_point("Google Generative AI SDK", "For connecting the support chat to live Gemini LLM models.")
    
    # Section 4: Future Enhancements
    pdf.add_section_header("4. Future Enhancements & Roadmap")
    
    pdf.add_bullet_point(
        "AR Virtual Try-On",
        "Integrating WebXR and Canvas APIs to capture the customer's camera feed, mapping 3D rings on fingers or earrings on ear lobes in real-time."
    )
    pdf.add_bullet_point(
        "Multimodal Outfit Matching",
        "Allowing users to upload pictures of their dresses, using a vision LLM to suggest matching necklaces matching the color, dress style, and neckline."
    )
    pdf.add_bullet_point(
        "Live Bullion Price Sync",
        "Hooking the database directly to gold/platinum global commodity rates, automatically updating jewellery values to follow live market values."
    )

    pdf.output("AuraGems_AI_Technical_Report.pdf")
    print("PDF successfully generated as AuraGems_AI_Technical_Report.pdf")

if __name__ == "__main__":
    generate_report()
