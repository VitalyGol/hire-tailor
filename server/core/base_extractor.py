from abc import ABC, abstractmethod

class BaseExtractor(ABC):
    """Base class for extractors, defining the interface for extracting data from various sources.
    This abstract class serves as a blueprint for specific extractor implementations that will
    implement the methods to extract data based on given inputs."""

    @abstractmethod
    def extract_data(self, input_data):
        """Abstract method to extract data from the given input.
        :param input_data: The input data from which to extract information.
        :return: The extracted data.
        """