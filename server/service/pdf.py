import base64
import io

from pypdf import PdfReader
from pypdf.errors import PdfReadError


def extract_text_from_pdf(pdf_bytes: bytes) -> str:

    if not pdf_bytes:
        raise ValueError("PDF content is empty")

    try:
        pdf_stream = io.BytesIO(pdf_bytes)

        reader = PdfReader(pdf_stream)

        extracted_pages = []

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                extracted_pages.append(page_text.strip())

        extracted_text = "\n".join(extracted_pages).strip()

        if not extracted_text:
            raise ValueError("Could not extract text from PDF")

        return extracted_text

    except PdfReadError:
        raise ValueError("Invalid PDF file")

    except Exception as e:
        raise ValueError(f"Failed to process PDF: {str(e)}")