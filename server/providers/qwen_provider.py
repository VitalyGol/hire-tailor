from core.base_provider import BaseProvider
from core.config import Config
from models.api.consultant_response import ConsultantResponse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


class QwenProvider(BaseProvider):
    """
    Provider for interacting with a Qwen-based language model.

    This class loads a pretrained Qwen model and tokenizer and provides
    methods for generating text responses and wrapping them into
    application-specific response objects.
    """
    
    def __init__(self):
        """
        Initialize the Qwen model and tokenizer.

        The model is loaded from the path specified in
        ``Config.HR_CHATBOT_MODEL``.

        GPU acceleration is automatically enabled when CUDA is available.
        The model is switched to evaluation mode after loading.
        """
        super().__init__()

        self.model_name = Config.HR_CHATBOT_MODEL

        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_name,
            trust_remote_code=True
        )


        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True
        )

        self.model.eval()

    def get_data(self, messages, enable_thinking=False):
        """
        Generate a response from the language model.
        """
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=enable_thinking
        )

        model_inputs = self.tokenizer(
            text,
            return_tensors="pt"
        ).to(self.model.device)

        with torch.no_grad():
            generated_ids = self.model.generate(
                **model_inputs,
                max_new_tokens=512,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=self.tokenizer.eos_token_id
            )

        output_ids = generated_ids[:, model_inputs["input_ids"].shape[1]:]

        answer = self.tokenizer.batch_decode(
            output_ids,
            skip_special_tokens=True
        )[0]

        return answer.strip()

    def get_parsed_data(self, prompt, text_format='text'):
        output = self.get_data(prompt)
        return ConsultantResponse(answer=output)
