from typing import Union
from pydantic import BaseModel


class RequestData(BaseModel):
    data: Union[list, dict]


class BasicSearchData(BaseModel):
    condition: Union[list, dict]


class SearchDataForDataset(BasicSearchData):
    combined: bool = True
