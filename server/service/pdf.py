import base64
import io
from pypdf import PdfReader

def extract_text_from_pdf(content: str) -> str:
    pdf_bytes = base64.b64decode(content)
    pdf_stream = io.BytesIO(pdf_bytes)
    reader = PdfReader(pdf_stream)
    extracted_text = ""
    for page in reader.pages:
        extracted_text += page.extract_text()
    return extracted_text
