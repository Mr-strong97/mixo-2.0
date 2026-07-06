from services.models import CategorieService

categories = [
    ("Coupe Homme", "Coupes et degrades pour homme"),
    ("Coupe Femme", "Coupes, brushings et stylisme pour femme"),
    ("Tresses", "Tresses, box braids, vanilles"),
    ("Coloration", "Colorations, balayages, meches"),
    ("Lissage", "Lissages bresiliens, defrisages"),
    ("Soins", "Soins capillaires et traitements"),
    ("Autres", "Autres prestations diverses"),
]

for nom, description in categories:
    obj, created = CategorieService.objects.get_or_create(
        nom=nom,
        defaults={"description": description}
    )
    print(nom)

print("Total :", CategorieService.objects.count())