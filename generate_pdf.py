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
        self.cell(0, 4, 'Portfolio Technical Report | Advanced Full-Stack AI E-commerce', ln=True, align='L')
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(113, 113, 122)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')

    def add_section_header(self, text):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(170, 124, 17) # Gold tone
        self.ln(4)
        self.cell(0, 6, text, ln=True)
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
    pdf.add_paragraph("AuraGems AI is an elite, full-stack jewellery e-commerce application designed to demonstrate database architectures, secure authentication patterns, dynamic commodity pricing, and webcam canvas graphics manipulations. This document details the implementation scope.")
    
    # Section 1: AI Features
    pdf.add_section_header("1. Production-Grade Features & AI Systems")
    
    pdf.add_bullet_point(
        "SQLite Relational Database & Auth",
        "Implements relational database schemas using SQLite. User sessions, encrypted passwords, wishlists, and shopping cart states are persistently stored, demonstrating a true full-stack account-backed shopping workflow."
    )
    
    pdf.add_bullet_point(
        "Interactive Webcam AR Try-On Suite",
        "A highly interactive frontend module. Shoppers activate their camera or upload photos, and place jewellery assets on top of the image canvas. Features dragging coordinates, rotation slider math, scaling, opacity skin-blends, and PNG snapshot downloads."
    )
    
    pdf.add_bullet_point(
        "Live Bullion Commodities Pricing Engine",
        "Fluctuates metal rates dynamically in a background thread. Prices are recalculated on-the-fly based on grams, gemstone appraisal values, and labor. Displays a scrolling header price ticker and transparent invoice cost breakdown."
    )
    
    pdf.add_bullet_point(
        "Smart NLP Product Search",
        "Translates unstructured search phrases (e.g. 'gold ring under $1000') into SQL constraints. Analyzes tags and materials, sorting matching results by relevance score accompanied by match explanations."
    )
    
    pdf.add_bullet_point(
        "AI Developer Telemetry Console",
        "A slide-out dashboard allowing engineers to modify temperatures, select active Gemini models, and track live JSON payloads and execution latency logs."
    )
    
    # Section 2: Architecture & Decoupled APIs
    pdf.add_section_header("2. System Architecture")
    pdf.add_paragraph("The application utilizes a decoupled client-server structure. The React.js frontend interacts with the FastAPI backend via stateless HTTP REST requests, carrying simulated Bearer Token session headers. SQLite manages data layers, while threading handles market ticker updates in python.")
    pdf.add_paragraph("Durability Design: If the python server is offline, the React API client automatically falls back to client-side JS algorithms for search, quizzes, and chat replies. This makes the project highly resilient and robust for offline portfolio demos.")

    # Section 3: Technologies Used
    pdf.add_section_header("3. Technologies Used")
    pdf.add_bullet_point("React.js (Vite)", "Single Page state routing, canvas animation updates, and responsive dashboard overlays.")
    pdf.add_bullet_point("FastAPI (Python 3.13)", "Asynchronous endpoints, automatic Swagger testing sandbox, and Pydantic schema validation.")
    pdf.add_bullet_point("SQLite3", "Relational database operations, user schemas, and cart items persistence.")
    pdf.add_bullet_point("Vanilla CSS HSL Tokens", "Custom luxury design layouts, sliding panels, and responsive drawers.")
    pdf.add_bullet_point("Google Gemini API", "LLM-driven conversations on styles and queries.")
    
    # Section 4: Future Roadmap
    pdf.add_section_header("4. Future Technical Enhancements")
    pdf.add_bullet_point("WebGL 3D Try-On", "Upgrading the 2D canvas try-on to utilize Three.js/WebGL for rendering true 3D CAD jewellery rings onto hand joints.")
    pdf.add_bullet_point("Multimodal Vision Prompts", "Allowing users to upload outfits and recommend coordinate jewellery matches using vision LLMs.")

    pdf.output("AuraGems_AI_Technical_Report.pdf")
    print("PDF successfully updated as AuraGems_AI_Technical_Report.pdf")

if __name__ == "__main__":
    generate_report()
