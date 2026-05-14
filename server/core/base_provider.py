from abc import ABC, abstractmethod

class BaseProvider(ABC):
    @abstractmethod
    def get_data(self, prompt, text_format = 'text'):
        pass