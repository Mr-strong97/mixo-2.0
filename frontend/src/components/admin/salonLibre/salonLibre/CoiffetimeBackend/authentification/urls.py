"""
authentification/urls.py — Routes complètes
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views.creer_compte_view   import creerNouveauCompte
from .views.connexion_view      import ConnexionPersonnaliseeView
from .views.profil_details_view import detailsProfil
from .views.utilisateur_view    import listerTousLesUtilisateurs
from .views.coiffeur.coiffeur_view import listeCoiffeurs, detailCoiffeur
from .views.client.client_view     import listeClients, espaceClient
from .views.verification_view  import (
    demanderVerificationEmail,
    verifierEmail,
    demanderResetMotDePasse,
    confirmerResetMotDePasse,
)

urlpatterns = [
    # ── Authentification ────────────────────────────────────────────
    path('inscription/',          creerNouveauCompte,               name='creer-compte'),
    path('connexion/',            ConnexionPersonnaliseeView.as_view(), name='connexion'),
    path('connexion/rafraichir/', TokenRefreshView.as_view(),       name='rafraichir-token'),

    # ── Vérification email ──────────────────────────────────────────
    path('email/demander-verification/', demanderVerificationEmail, name='demander-verification'),
    path('email/verifier/',              verifierEmail,             name='verifier-email'),

    # ── Reset mot de passe ──────────────────────────────────────────
    path('password/demander-reset/',   demanderResetMotDePasse,    name='demander-reset'),
    path('password/confirmer-reset/',  confirmerResetMotDePasse,   name='confirmer-reset'),

    # ── Profil utilisateur ──────────────────────────────────────────
    path('profil/<uuid:id>/',          detailsProfil,              name='details-profil'),

    # ── Admin : liste globale ────────────────────────────────────────
    path('utilisateurs/',              listerTousLesUtilisateurs,  name='liste-utilisateurs'),

    # ── Clients ─────────────────────────────────────────────────────
    path('clients/',                   listeClients,               name='client-liste'),
    path('clients/<uuid:id>/',         espaceClient,               name='client-espace'),

    # ── Coiffeurs ───────────────────────────────────────────────────
    path('coiffeurs/',                 listeCoiffeurs,             name='coiffeur-liste'),
    path('coiffeurs/<uuid:id>/',       detailCoiffeur,             name='coiffeur-detail'),
]