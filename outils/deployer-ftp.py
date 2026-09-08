"""Televerse _site/ vers l'hebergeur en FTPS.

Le depot ne contient aucun identifiant, et ne doit jamais en contenir : ils se
passent par variables d'environnement.

    set SOLYBAT_FTP_HOTE=ftp.solybat18.fr
    set SOLYBAT_FTP_UTILISATEUR=uXXXXXXXX
    set SOLYBAT_FTP_MOTDEPASSE=...
    python outils/deployer-ftp.py

Ces trois valeurs sont dans hPanel Hostinger > Fichiers > Comptes FTP.

Par defaut le script tourne a blanc (il annonce ce qu'il ferait sans rien
envoyer). Ajouter --envoyer pour televerser reellement.

Le script rebatit systematiquement _site/ via outils/faire-archive.py, qui
efface le dossier avant : 11ty ne nettoie pas sa sortie, donc un fichier
retire des sources y survivrait et repartirait en ligne.
"""

import ftplib
import os
import ssl
import subprocess
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SITE = RACINE / "_site"
# Dossier web chez Hostinger. OVH utilise plutot "www".
DISTANT = os.environ.get("SOLYBAT_FTP_RACINE", "public_html")

# Ces fichiers pesent lourd et changent rarement, mais on les envoie quand meme :
# un deploiement partiel qui laisse une ancienne image en place est une source
# de bugs bien plus couteuse que quelques Mo de transfert.


def batir():
    print("Reconstruction de _site/ ...")
    subprocess.run(
        [sys.executable, str(RACINE / "outils" / "faire-archive.py")],
        check=True,
        cwd=RACINE,
    )


def fichiers():
    """Tous les fichiers de _site/, en chemins relatifs, dossiers d'abord."""
    for chemin in sorted(SITE.rglob("*")):
        if chemin.is_file():
            yield chemin, chemin.relative_to(SITE).as_posix()


def creer_dossier(ftp, chemin):
    """mkdir -p distant : FTP n'a pas d'equivalent, il faut descendre etage
    par etage et ignorer les dossiers qui existent deja."""
    courant = ""
    for part in chemin.split("/"):
        courant = f"{courant}/{part}" if courant else part
        try:
            ftp.mkd(courant)
        except ftplib.error_perm:
            pass  # existe deja


def main():
    envoyer = "--envoyer" in sys.argv

    hote = os.environ.get("SOLYBAT_FTP_HOTE")
    utilisateur = os.environ.get("SOLYBAT_FTP_UTILISATEUR")
    motdepasse = os.environ.get("SOLYBAT_FTP_MOTDEPASSE")

    if envoyer and not all([hote, utilisateur, motdepasse]):
        sys.exit(
            "Identifiants absents. Definir SOLYBAT_FTP_HOTE, "
            "SOLYBAT_FTP_UTILISATEUR et SOLYBAT_FTP_MOTDEPASSE.\n"
            "(hPanel Hostinger > Fichiers > Comptes FTP)"
        )

    batir()
    liste = list(fichiers())
    poids = sum(c.stat().st_size for c, _ in liste)
    print(f"\n{len(liste)} fichiers, {poids / 1_000_000:.2f} Mo")

    if not envoyer:
        print("\n--- ESSAI A BLANC : rien n'a ete envoye ---")
        print("Relancer avec --envoyer pour televerser.")
        for _, rel in liste[:10]:
            print(f"  {DISTANT}/{rel}")
        if len(liste) > 10:
            print(f"  ... et {len(liste) - 10} autres")
        return

    # FTPS explicite : un FTP en clair transmettrait le mot de passe en clair.
    ftp = ftplib.FTP_TLS(context=ssl.create_default_context())
    ftp.connect(hote, 21, timeout=30)
    ftp.login(utilisateur, motdepasse)
    ftp.prot_p()
    print(f"Connecte a {hote}")

    dossiers_crees = set()
    for n, (chemin, rel) in enumerate(liste, 1):
        cible = f"{DISTANT}/{rel}"
        parent = cible.rsplit("/", 1)[0]
        if parent not in dossiers_crees:
            creer_dossier(ftp, parent)
            dossiers_crees.add(parent)
        with open(chemin, "rb") as f:
            ftp.storbinary(f"STOR {cible}", f)
        print(f"  [{n}/{len(liste)}] {rel}")

    ftp.quit()
    print("\nTermine. Verifier https://www.solybat18.fr/sitemap.xml")


if __name__ == "__main__":
    main()
