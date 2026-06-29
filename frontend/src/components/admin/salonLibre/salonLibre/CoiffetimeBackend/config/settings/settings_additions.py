"""
Ajouts à config/settings/base.py
Colle ces blocs dans ton base.py existant.
"""

# 1. EMAIL - développement (terminal)
EMAIL_BACKEND      = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'CoiffTime <noreply@coifftime.com>'
FRONTEND_URL       = 'http://localhost:5173'

# 2. RATE LIMITING dans REST_FRAMEWORK
# Ajoute ces clés à ton REST_FRAMEWORK existant :
# 'DEFAULT_THROTTLE_CLASSES': [
#     'rest_framework.throttling.AnonRateThrottle',
#     'rest_framework.throttling.UserRateThrottle',
# ],
# 'DEFAULT_THROTTLE_RATES': {
#     'anon': '30/minute',
#     'user': '120/minute',
# },

# 3. SÉCURITÉ
X_FRAME_OPTIONS = 'DENY'