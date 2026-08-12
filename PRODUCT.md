# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Clients utilisant principalement Mixo sur mobile pour découvrir des prestations de coiffure, consulter les profils des coiffeurs, réserver, échanger, recevoir des notifications, consulter leurs factures, payer et laisser un avis après une prestation.
- Coiffeurs utilisant Mixo sur mobile et ordinateur pour gérer leurs services, leurs horaires et indisponibilités, leurs rendez-vous, les avis clients, leurs factures et les paiements reçus.
- Administrateurs utilisant Mixo pour superviser les utilisateurs, les rendez-vous, les services et l'activité de la plateforme.

## Product Purpose

Mixo réunit dans une même plateforme la découverte de prestations de coiffure, la réservation, les échanges entre clients et coiffeurs, ainsi que la gestion opérationnelle et administrative. Le produit réussit lorsque chaque rôle comprend immédiatement où il se trouve, peut atteindre ses tâches essentielles sans formation et termine ses parcours courants facilement sur mobile.

## Positioning

Mixo relie le catalogue réel d'un coiffeur, ses disponibilités, la réservation client, la conversation, la facturation et le paiement dans un parcours continu, tout en donnant aux administrateurs une vue de supervision de la même activité.

## Operating Context

- La majorité des utilisateurs accède au produit depuis un téléphone mobile.
- Les coiffeurs peuvent également utiliser un ordinateur pour les tâches de gestion plus denses.
- Les interfaces sont organisées par rôle : client, coiffeur et administrateur.
- Les montants sont affichés de manière cohérente en francs congolais, avec les libellés FC ou CDF selon le contexte.

## Capabilities and Constraints

- Conserver les routes, les appels API, les modèles de données et toute la logique métier existante.
- Refaire le front-end progressivement sans casser le backend fonctionnel.
- Préserver toutes les fonctionnalités actuellement disponibles pour les trois rôles.
- Mettre en place une navigation explicite et cohérente sur mobile et ordinateur.
- Ajouter des états de chargement, des états vides et des retours d'action compréhensibles.
- Utiliser des transitions et des animations CSS avec `@keyframes`, tout en respectant `prefers-reduced-motion`.
- Corriger notamment l'accès à la déconnexion dans les paramètres client sur mobile.

## Brand Commitments

- Le produit conserve le nom **Mixo**.
- L'identité doit inspirer confiance, professionnalisme et proximité, sans rendre les tâches métier décoratives ou difficiles à lire.
- Les commandes de navigation doivent offrir une lisibilité et une prévisibilité comparables à l'application LinkedIn sur mobile et ordinateur, sans en copier l'identité visuelle.

## Evidence on Hand

- Le dépôt contient les parcours et appels API fonctionnels dans `frontend/src`.
- Les captures fournies le 12 août 2026 documentent les problèmes actuels de navigation, de tableaux débordants, de densité, de hiérarchie et d'adaptation mobile.
- Aucun témoignage commercial, benchmark public ou promesse chiffrée ne doit être inventé.

## Product Principles

1. Concevoir d'abord pour le pouce et les petits écrans, puis enrichir l'expérience ordinateur.
2. Montrer à chaque rôle uniquement les actions et informations utiles à sa tâche actuelle.
3. Préserver la logique métier et rendre son état visible : chargement, succès, erreur, attente et vide.
4. Employer les mêmes conventions de navigation, de statut et d'action dans toute la plateforme.
5. Garder les parcours critiques — découvrir, réserver, gérer, payer et superviser — courts et explicites.

## Accessibility & Inclusion

- Cibles tactiles adaptées au mobile, navigation clavier, focus visible, contrastes lisibles et libellés explicites.
- Les animations ne doivent jamais être indispensables à la compréhension et doivent être réduites lorsque l'utilisateur active `prefers-reduced-motion`.
