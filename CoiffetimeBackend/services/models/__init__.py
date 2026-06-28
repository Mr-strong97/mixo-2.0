"""
models/__init__.py — MIXO · Services
Centralise les imports des modèles du module Services afin de permettre :
    from services.models import Service, CategorieService, ServiceImage
"""
from .service import Service, CategorieService, ServiceImage

__all__ = [
    'Service',
    'CategorieService',
    'ServiceImage',
]
