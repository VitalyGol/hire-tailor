
import io
from pypdf import PdfReader
from pypdf.errors import PdfReadError
from core.base_extractor import BaseExtractor
from core.base_provider import BaseProvider
from models.ai.extract_models import UserProfile
from prompts.extractors.pdf_json_prompt import get_pdf_json_prompt


class PdfJsonExtractor(BaseExtractor):
    def __init__(self, provider: BaseProvider):
        self.provider = provider

    def extract_data(self, input_data: bytes) -> UserProfile:
        try:
            content = self._extract_text_from_pdf(input_data)
            prompt = get_pdf_json_prompt(content)
            data = self.provider.get_parsed_data(prompt, text_format=UserProfile)
            return data
        except Exception as e:  # pylint: disable=broad-exception-caught
            print(f"Error while extracting data from PDF: {e}")
            return None

    def _extract_text_from_pdf(self,pdf_bytes: bytes) -> str:

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

        except PdfReadError as e:
            raise ValueError("Invalid PDF file") from e

        except Exception as e:
            raise ValueError("Failed to process PDF") from e
