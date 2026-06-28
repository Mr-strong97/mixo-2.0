"""Compatibilité pour permettre `administration.views.*`."""
from pathlib import Path

__path__ = [str(Path(__file__).resolve().with_name('views'))]
