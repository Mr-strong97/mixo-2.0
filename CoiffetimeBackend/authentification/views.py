"""Compatibilité pour permettre `authentification.views.*`."""
from pathlib import Path

__path__ = [str(Path(__file__).resolve().with_name('views'))]
