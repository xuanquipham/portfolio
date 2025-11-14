import os
import json
import re

# Liste des dossiers de galeries
galleries = [
    "images/street",
    "images/voyage",
    "images/portrait",
    "images/concert",
    "images/zines"  # on met juste le dossier zines
]

# Extensions acceptées
valid_extensions = (".jpg", ".jpeg", ".png", ".webp")

def natural_sort_key(s):
    """Retourne une clé pour trier les noms de fichiers de façon naturelle (numérique)."""
    # Exemple : '10.png' -> ['10'], '1.png' -> ['1']
    parts = re.split(r'(\d+)', s)
    return [int(p) if p.isdigit() else p.lower() for p in parts]

def create_standard_json(folder):
    """Créer un index.json simple pour les galeries classiques."""
    if not os.path.exists(folder):
        print(f"⚠️  Dossier {folder} n'existe pas, skipping.")
        return

    files = [f for f in os.listdir(folder) if f.lower().endswith(valid_extensions)]
    json_path = os.path.join(folder, "index.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(files, f, indent=2, ensure_ascii=False)
    print(f"✅ {json_path} créé avec {len(files)} images.")

def create_zine_json(folder):
    """Créer un index.json pour chaque sous-dossier de zines."""
    if not os.path.exists(folder):
        print(f"⚠️  Dossier {folder} n'existe pas, skipping.")
        return

    for subfolder in os.listdir(folder):
        subfolder_path = os.path.join(folder, subfolder)
        if not os.path.isdir(subfolder_path):
            continue

        # Lister et trier les fichiers images numériquement
        pages = sorted(
            [f for f in os.listdir(subfolder_path) if f.lower().endswith(valid_extensions)],
            key=natural_sort_key
        )

        if not pages:
            print(f"⚠️  Aucun fichier image dans {subfolder_path}, skipping.")
            continue

        zine_json = {
            "cover": pages[0],  # première image comme couverture
            "pages": pages,
            "title": {
                "fr": subfolder,
                "en": subfolder
            }
        }

        json_path = os.path.join(subfolder_path, "index.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(zine_json, f, indent=2, ensure_ascii=False)
        
        print(f"✅ {json_path} créé avec {len(pages)} pages.")

# Boucle principale
for folder in galleries:
    if folder.endswith("zines"):
        create_zine_json(folder)
    else:
        create_standard_json(folder)
