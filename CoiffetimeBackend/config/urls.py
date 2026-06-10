from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Interface d'administration par défaut de Django
    path('admin/', admin.site.urls),
    
    # --- ROUTES DE L'API COIFFETIME ---
    
    # Authentification (Inscription, Connexion, Profil)
    path('api/auth/', include('authentification.urls')),

    # Module Services (Avis, Horaires, Prestations)
    # Note la virgule à la fin de la ligne suivante
    path('api/services/', include('services.urls.service_urls')),

    # Module Rendez-vous (Réservations, Notifications)
    # Note le '#' pour le commentaire ci-dessous
    # Les routes seront préfixées par 'api/rendez-vous/'
    path('api/rendez-vous/', include('rendez_vous.urls.rendezvous_urls')),
    path('api/admin/', include('administration.urls')),
    path('api/notifications/', include('notifications.urls')), 
]