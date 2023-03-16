import os
import sys
import dotenv
import pathlib
import importlib.util
from types import ModuleType

dotenv.load_dotenv()


def import_lib(module_name: str, spec_name: str, spec_path: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(spec_name, spec_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    sys.modules[module_name] = module

    return module


def get_env(var: str) -> str:
    return os.getenv(var)


ROOT_PATH = pathlib.PurePath(__file__).parent.parent.parent
