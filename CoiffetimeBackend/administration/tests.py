from django.test import TestCase
from rest_framework.test import APIClient

from authentification.models.audit_log import AuditLog
from authentification.models.utilisateur import RoleChoix, StatutChoix, Utilisateur


class ReclamationReactivationTests(TestCase):
    def setUp(self):
        self.client_api = APIClient()
        self.admin = Utilisateur.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123!',
            role=RoleChoix.ADMIN,
            statut=StatutChoix.ACTIF,
        )
        self.suspended_one = Utilisateur.objects.create_user(
            username='client1',
            email='client1@example.com',
            password='StrongPass123!',
            role=RoleChoix.CLIENT,
            statut=StatutChoix.INACTIF,
        )
        self.suspended_two = Utilisateur.objects.create_user(
            username='client2',
            email='client2@example.com',
            password='StrongPass123!',
            role=RoleChoix.CLIENT,
            statut=StatutChoix.INACTIF,
        )

    def test_liste_demandes_reactivation_utilise_created_at(self):
        self.client_api.force_authenticate(user=self.suspended_one)
        res1 = self.client_api.post(
            '/api/auth/reactivation/demander/',
            {'message': 'Je souhaite réactiver mon compte car je dois reprendre mes rendez-vous.'},
            format='json',
        )
        self.assertEqual(res1.status_code, 200)

        self.client_api.force_authenticate(user=self.suspended_two)
        res2 = self.client_api.post(
            '/api/auth/reactivation/demander/',
            {'message': 'Je souhaite réactiver mon compte car je dois reprendre mes rendez-vous.'},
            format='json',
        )
        self.assertEqual(res2.status_code, 200)

        self.client_api.force_authenticate(user=self.admin)
        res = self.client_api.get('/api/admin/reactivations/')

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['count'], 2)
        self.assertEqual(len(res.data['resultats']), 2)
        self.assertTrue(all('date_demande' in item for item in res.data['resultats']))

        self.assertEqual(
            AuditLog.objects.filter(action='DEMANDE_REACTIVATION').count(),
            2,
        )
