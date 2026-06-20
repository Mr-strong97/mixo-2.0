from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from authentification.models.utilisateur import RoleChoix, StatutChoix, Utilisateur
from notifications.models import Notification, TypeNotification
from .models.rendezvous import RendezVous


class RendezVousSignalTests(TestCase):
    def setUp(self):
        self.client_user = Utilisateur.objects.create_user(
            username='client-rdv',
            email='client-rdv@example.com',
            password='StrongPass123!',
            role=RoleChoix.CLIENT,
            statut=StatutChoix.ACTIF,
        )
        self.coiffeur_user = Utilisateur.objects.create_user(
            username='coiffeur-rdv',
            email='coiffeur-rdv@example.com',
            password='StrongPass123!',
            role=RoleChoix.COIFFEUR,
            statut=StatutChoix.ACTIF,
        )

    def test_creation_rendezvous_produit_des_notifications_valides(self):
        initial_count = Notification.objects.count()

        rdv = RendezVous.objects.create(
            client=self.client_user,
            coiffeur=self.coiffeur_user,
            date_heure=timezone.now() + timedelta(days=2),
        )

        self.assertIsNotNone(rdv.pk)
        self.assertEqual(Notification.objects.count(), initial_count + 2)

        notifications = Notification.objects.order_by('created_at')[:2]
        self.assertTrue(all(n.type in TypeNotification.values for n in notifications))
        self.assertTrue(all(n.statut == 'NON_LU' for n in notifications))
        self.assertTrue(all(n.lien == '/notifications' for n in notifications))
