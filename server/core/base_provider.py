from abc import ABC, abstractmethod

class BaseProvider(ABC):
    @abstractmethod
    def get_data(self):
        pass