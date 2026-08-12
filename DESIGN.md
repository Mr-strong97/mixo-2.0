---
name: Mixo
description: Une fiche de prestation numérique claire, fiable et orientée vers la prochaine action.
colors:
  cobalt-deep: "#082F62"
  cobalt-strong: "#0B3F7F"
  cobalt-action: "#0B4F9C"
  cobalt-hover: "#0E61BA"
  cobalt-interactive: "#1776D2"
  cobalt-soft: "#DCEBFA"
  cobalt-wash: "#EDF5FD"
  ink-black: "#101722"
  ink-primary: "#18212F"
  ink-strong: "#344054"
  ink-muted: "#475467"
  ink-soft: "#667085"
  ink-faint: "#8A94A3"
  paper: "#F4F7FA"
  surface: "#FFFFFF"
  surface-muted: "#EEF3F7"
  rule: "#D9E1E8"
  rule-strong: "#C7D1DB"
  success: "#127A45"
  success-soft: "#E8F5EE"
  warning: "#946200"
  warning-soft: "#FFF5DA"
  danger: "#C63838"
  danger-soft: "#FCEBEC"
  info: "#175CD3"
  info-soft: "#EAF2FF"
typography:
  display:
    fontFamily: "Public Sans Variable, Public Sans, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.6rem)"
    fontWeight: 790
    lineHeight: 1.04
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Public Sans Variable, Public Sans, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 720
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Public Sans Variable, Public Sans, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Public Sans Variable, Public Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Public Sans Variable, Public Sans, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "14px"
  xl: "16px"
  display: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.surface}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
    height: "48px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "46px"
  status-chip:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.info}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 9px"
    height: "28px"
  matte-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Mixo

## Overview

**Creative North Star: "La fiche de prestation"**

Mixo ressemble à une fiche de travail de salon parfaitement tenue : un fond papier calme, une encre très lisible, des règles fines et un index cobalt qui attire l’œil vers la tâche à accomplir. L’interface est professionnelle sans devenir froide ; les photos réelles et les informations métier gardent la relation humaine au centre.

La densité reste contenue sur mobile et s’enrichit sur ordinateur. Chaque rôle retrouve la même grammaire — contexte clair, état explicite, action principale évidente — tandis que la navigation change uniquement pour refléter les responsabilités du client, du coiffeur ou de l’administrateur.

**Key Characteristics:**

- Papier gris très clair, surfaces blanches mates et séparateurs fins.
- Cobalt réservé à l’orientation, à l’état actif et aux actions importantes.
- Titres courts, francs et fortement contrastés en Public Sans Variable.
- Une fiche prioritaire à index cobalt pour la prochaine tâche métier.
- Navigation au pouce sur mobile et rail persistant sur ordinateur.
- Mouvement bref, fonctionnel et désactivable avec `prefers-reduced-motion`.

## Colors

La palette oppose un cobalt de confiance à une gamme encre-papier neutre ; les couleurs sémantiques restent limitées aux états réellement utiles.

### Primary

- **Cobalt d’atelier** (`cobalt-action`) : action principale, destination active, index de la fiche prioritaire et éléments de marque.
- **Cobalt profond** (`cobalt-deep`, `cobalt-strong`) : survols, valeurs fortes et textes de marque sur fond clair.
- **Cobalt interactif** (`cobalt-hover`, `cobalt-interactive`) : progression, focus et retours d’interaction.
- **Bleus de papier** (`cobalt-soft`, `cobalt-wash`) : icônes contenues, sélection légère et arrière-plans actifs.

### Tertiary

- **Succès, attente, danger et information** (`success`, `warning`, `danger`, `info` avec leurs variantes `-soft`) : uniquement pour les statuts, erreurs et confirmations correspondants.

### Neutral

- **Encre principale** (`ink-black`, `ink-primary`) : titres, valeurs et texte essentiel.
- **Encres secondaires** (`ink-strong`, `ink-muted`, `ink-soft`, `ink-faint`) : corps, métadonnées, aide et contenu désaccentué.
- **Papier et surfaces** (`paper`, `surface`, `surface-muted`) : fond global, cartes et zones secondaires.
- **Règles** (`rule`, `rule-strong`) : séparation structurelle, champs et contours de cartes.

### Named Rules

**The Cobalt Index Rule.** Le cobalt guide ; il ne colore jamais tout l’écran. La bande latérale ou supérieure appartient à la fiche prioritaire et à quelques cartes d’action, pas à chaque conteneur.

**The Semantic Truth Rule.** Une couleur d’état doit toujours accompagner un libellé lisible ; la couleur seule ne porte jamais le sens.

## Typography

**Display Font:** Public Sans Variable (avec Public Sans puis sans-serif)
**Body Font:** Public Sans Variable (avec Public Sans puis sans-serif)

**Character:** Une seule famille variable donne au produit une voix stable et technique. La différence entre niveaux vient du poids, de la taille et de l’espacement, jamais d’un changement décoratif de police.

### Hierarchy

- **Display** (790, fluide de `2rem` à `3.6rem`, 1.04) : salutation, tâche principale et titre de tableau de bord.
- **Headline** (720, `1.35rem`, 1.2) : titre de fiche prioritaire et dialogue important.
- **Title** (700, `1.12rem`, 1.25) : titre de section, carte ou élément de liste.
- **Body** (400, `1rem`, 1.5) : descriptions et explications, avec une longueur cible de 60 à 70 caractères.
- **Label** (700, `0.72rem`, espacement `0.08em`) : statut, valeur synthétique et métadonnée courte.

### Named Rules

**The Workhorse Type Rule.** Public Sans Variable porte toute l’interface ; les poids les plus forts sont réservés à la décision et aux données à scanner.

## Layout

Le produit commence à 320 px. Jusqu’à 1023 px, une barre d’application fixe de 64 px et une navigation basse de 72 px encadrent le contenu ; cinq destinations principales au maximum restent visibles et les routes secondaires passent par la feuille de compte. Les zones tactiles mesurent au moins 44 px, avec 14 à 18 px de marge latérale sur les petits écrans.

À partir de 1024 px, la navigation devient un rail fixe de 248 px. Le contenu est borné à 1240 px, centré dans l’espace restant et emploie 24 à 48 px de marge selon la largeur. Les grilles gagnent des colonnes, mais l’ordre de lecture mobile est conservé.

Les tableaux métier deviennent des fiches verticales sous 780 px plutôt que de forcer un défilement horizontal. Le rythme spatial repose sur 4, 8, 12, 16, 24, 32 et 48 px ; les écarts de 8 à 16 px structurent les composants, ceux de 24 à 32 px séparent les groupes de travail.

**The Thumb-First Rule.** Une action mobile essentielle doit être atteignable sans viser un petit pictogramme ni ouvrir plusieurs menus.

## Elevation & Depth

Mixo utilise une profondeur hybride mais retenue. Les contours et les variations de papier définissent d’abord la structure ; les ombres servent seulement à détacher une fiche importante, une navigation fixe ou une feuille modale.

### Shadow Vocabulary

- **Contact** (`0 1px 2px rgba(16, 24, 40, 0.05)`) : cartes et champs au repos.
- **Fiche** (`0 6px 18px rgba(16, 36, 64, 0.07)`) : fiche prioritaire et conteneur actif.
- **Feuille** (`0 14px 34px rgba(16, 36, 64, 0.10)`) : dialogue, menu de compte et surface temporairement élevée.

### Named Rules

**The Structure-Before-Shadow Rule.** Employer d’abord une règle fine et un changement de ton ; ajouter une ombre uniquement lorsqu’une surface doit réellement passer devant une autre.

## Shapes

Les formes sont doucement rectangulaires et précises : 6 px pour les petits détails, 10 à 14 px pour les commandes et cartes, 16 à 20 px pour les grandes feuilles. Le rayon pilule est réservé aux statuts et sélections compactes ; les avatars et marques personnelles restent circulaires avec une image recadrée en `object-fit: cover`.

La signature visuelle est la fiche blanche à contour fin, renforcée sur son bord gauche par un index cobalt de 4 à 6 px lorsqu’elle représente la prochaine action.

## Components

### Buttons

- **Shape:** rectangle tactile de 48 px de haut, coins précis de 12 px.
- **Primary:** cobalt plein, texte blanc, verbe direct et une seule action dominante par groupe.
- **Hover / Focus:** translation maximale de 1 px, transition de 150 à 220 ms et anneau de focus visible.
- **Secondary:** surface blanche, encre principale et contour `rule-strong`; le danger emploie `danger-soft` et un libellé explicite.

### Chips

- **Style:** rayon pilule, hauteur d’environ 28 px, fond sémantique pâle et texte de la même famille plus sombre.
- **State:** toujours accompagné d’un mot compréhensible tel que « En attente », « Payée » ou « Archivée ».

### Cards / Containers

- **Corner Style:** 12 à 16 px pour les cartes usuelles, jusqu’à 20 px pour une feuille modale.
- **Background:** surface blanche sur papier gris clair.
- **Shadow Strategy:** contact au repos, fiche pour le contenu prioritaire.
- **Border:** règle de 1 px ; index cobalt uniquement lorsqu’une action est prioritaire.
- **Internal Padding:** 16 à 24 px sur mobile, 24 à 32 px sur ordinateur.

### Inputs / Fields

- **Style:** hauteur minimale de 46 px, fond blanc, contour fort de 1 px et rayon de 12 px.
- **Focus:** contour cobalt et anneau translucide de 4 px sans déplacer le champ.
- **Error / Disabled:** danger explicite pour l’erreur ; contraste réduit et interaction supprimée pour l’état désactivé.

### Navigation

Le mobile utilise cinq destinations étiquetées, une règle cobalt en haut de l’élément actif et une feuille de compte pour les raccourcis, paramètres et la déconnexion. L’ordinateur utilise un rail de 248 px ; l’élément actif reçoit un fond cobalt très pâle et une règle interne à gauche.

### Priority Work Sheet

Cette fiche signature regroupe l’état courant, le contexte minimal et une action principale. Elle emploie une surface mate, un contour fin, un index cobalt et une mise en page qui passe naturellement d’une ligne sur ordinateur à une pile sur mobile.

### Loading and Empty States

Le chargement comprend un écran de démarrage de marque, une barre de progression de route, des squelettes ou un spinner selon la quantité de contenu. Un état vide explique ce qui manque et propose une action réelle lorsqu’elle existe.

## Do's and Don'ts

### Do:

- **Do** concevoir et vérifier chaque parcours critique à 320 et 360 px avant de l’enrichir sur ordinateur.
- **Do** placer une seule action primaire évidente dans chaque fiche ou dialogue.
- **Do** afficher les prix en FC ou CDF et formater les milliers avec des espaces.
- **Do** conserver les photos réelles des profils et services, recadrées proprement sans déformation.
- **Do** fournir chargement, vide, succès et erreur sans inventer de données.
- **Do** garder la déconnexion accessible dans la feuille de compte et les paramètres sur mobile.

### Don't:

- **Don't** forcer un tableau de bureau hors du viewport mobile ; convertir les lignes en fiches lisibles.
- **Don't** utiliser l’euro ou EUR dans un parcours Mixo destiné aux francs congolais.
- **Don't** multiplier les actions pleines en cobalt dans le même groupe.
- **Don't** réduire une commande interactive sous 44 px ou dépendre d’une icône sans libellé accessible.
- **Don't** employer une couleur sémantique comme décoration ou comme seul indicateur d’état.
- **Don't** remplacer les appels API, routes ou données réelles par du contenu de démonstration dans l’application.
