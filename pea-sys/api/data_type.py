from typing import Union
from pydantic import BaseModel


class ActionRequestModel(BaseModel):
    data: Union[list, dict]


class QueryRequestModel(BaseModel):
    condition: Union[list, dict]


class DatasetRequestModel(QueryRequestModel):
    combined: bool = True
