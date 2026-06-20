from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

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
    path('api/abonnements/', include('abonnements.urls')), 
    path('api/planning/',    include('planning.urls.horaire_urls')),
    path('api/media-portfolio/',   include('media_portfolio.urls.portfolio_urls')),
    path('api/admin/extended/', include('administration.urls.admin_extended_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
