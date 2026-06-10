"""
authentification/urls.py — MIXO
Les notifications sont maintenant dans l'app dédiée : /api/notifications/
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views.creer_compte_view      import creerNouveauCompte
from .views.connexion_view         import ConnexionPersonnaliseeView
from .views.profil_details_view    import detailsProfil
from .views.utilisateur_view       import listerTousLesUtilisateurs
from .views.coiffeur.coiffeur_view import listeCoiffeurs, detailCoiffeur
from .views.client.client_view     import listeClients, espaceClient
from .views.verification_view      import (
    demanderVerificationEmail,
    verifierEmail,
    demanderResetMotDePasse,
    confirmerResetMotDePasse,
)
from .views.status_view            import monStatut
from .views.reactivation_view      import demanderReactivation

urlpatterns = [
    # Authentification
    path('inscription/',          creerNouveauCompte,                   name='creer-compte'),
    path('connexion/',            ConnexionPersonnaliseeView.as_view(),  name='connexion'),
    path('connexion/rafraichir/', TokenRefreshView.as_view(),           name='rafraichir-token'),

    # Statut temps réel (utilisé par AuthGuard.js)
    path('moi/statut/',           monStatut,                            name='mon-statut'),

    # Vérification email
    path('email/demander-verification/', demanderVerificationEmail,     name='demander-verif'),
    path('email/verifier/',              verifierEmail,                 name='verifier-email'),

    # Reset mot de passe
    path('password/demander-reset/',     demanderResetMotDePasse,       name='demander-reset'),
    path('password/confirmer-reset/',    confirmerResetMotDePasse,      name='confirmer-reset'),

    # Réactivation compte suspendu
    path('reactivation/demander/',       demanderReactivation,          name='reactivation'),

    # Profil & utilisateurs
    path('profil/<uuid:id>/',     detailsProfil,             name='details-profil'),
    path('utilisateurs/',         listerTousLesUtilisateurs, name='liste-utilisateurs'),
    path('clients/',              listeClients,              name='client-liste'),
    path('clients/<uuid:id>/',    espaceClient,              name='client-espace'),
    path('coiffeurs/',            listeCoiffeurs,            name='coiffeur-liste'),
    path('coiffeurs/<uuid:id>/',  detailCoiffeur,            name='coiffeur-detail'),
]