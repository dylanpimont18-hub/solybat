<?php
require __DIR__ . '/devis-validation.php';

// Adresse de contact Soly'bat (cohérente avec src/_data/site.json > email).
// Elle est sur le même domaine que l'en-tête From ci-dessous et hébergée chez le
// même prestataire : la remise est donc locale, le cas le plus fiable. Ne pas y
// remettre une adresse externe (gmail, orange) sans vérifier SPF/DKIM, sous
// peine de finir en indésirables.
$adresseContact = 'contact@solybat18.fr';

// Page à réafficher en cas d'erreur, selon le formulaire d'origine.
$pagesFormulaire = [
    'devis' => '/devis/',
    'analyse' => '/analyse-rentabilite/',
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /devis/');
    exit;
}

if (estHoneypotRempli($_POST)) {
    // Requête probablement émise par un bot : réponse de succès sans envoi d'email.
    header('Location: /devis-merci/');
    exit;
}

$resultat = validerDonnees($_POST);
$type = $resultat['type'];
$pageFormulaire = $pagesFormulaire[$type];

if (!$resultat['valide']) {
    // Les pages de formulaire sont statiques : les valeurs saisies sont repassées
    // en paramètres d'URL pour que le JS les réaffiche côté client, au lieu d'une
    // redirection sèche qui les perdrait.
    $champsRappeles = $type === 'analyse'
        ? ['nom', 'email', 'telephone', 'ville', 'bien', 'prix_achat', 'travaux', 'loyer', 'message']
        : ['profil', 'nom', 'email', 'telephone', 'message'];

    $parametres = ['erreur' => '1'];
    foreach ($champsRappeles as $champ) {
        $parametres[$champ] = $_POST[$champ] ?? '';
    }

    header('Location: ' . $pageFormulaire . '?' . http_build_query($parametres));
    exit;
}

$nom = nettoyerValeur($_POST['nom']);
$email = nettoyerValeur($_POST['email']);
$telephone = nettoyerValeur($_POST['telephone'] ?? '');

if ($type === 'analyse') {
    $ville = nettoyerValeur($_POST['ville']);
    $bien = nettoyerValeur($_POST['bien']);
    $prixAchat = nettoyerValeur($_POST['prix_achat']);
    $travaux = nettoyerValeur($_POST['travaux'] ?? '');
    $loyer = nettoyerValeur($_POST['loyer'] ?? '');
    $message = nettoyerValeur($_POST['message'] ?? '');

    $sujet = "Demande d'analyse de rentabilité — Spark Cash Flow";
    $corps = "Nom : $nom\nEmail : $email\nTéléphone : $telephone\n\n"
        . "Ville ou secteur : $ville\n"
        . "Bien : $bien\n"
        . "Prix d'achat envisagé : $prixAchat\n"
        . "Travaux à prévoir : $travaux\n"
        . "Loyer attendu : $loyer\n";

    if ($message !== '') {
        $corps .= "\nPrécisions :\n$message\n";
    }
} else {
    $profil = nettoyerValeur($_POST['profil']);
    $message = nettoyerValeur($_POST['message']);

    $sujet = 'Nouvelle demande de devis — ' . $profil;
    $corps = "Profil : $profil\nNom : $nom\nEmail : $email\nTéléphone : $telephone\n\nMessage :\n$message\n";

    // Champs conditionnels du formulaire, affichés selon le profil choisi. Ils
    // étaient collectés mais absents du mail : l'adresse du bien saisie par
    // chaque particulier n'arrivait jamais jusqu'ici.
    $champsProfil = [
        'Nombre de biens par an' => $_POST['volume_estime'] ?? '',
        'Délai souhaité' => $_POST['delai_souhaite'] ?? '',
        'Adresse du bien' => $_POST['adresse_bien'] ?? '',
    ];

    foreach ($champsProfil as $libelle => $valeur) {
        $valeur = nettoyerValeur((string) $valeur);
        if ($valeur !== '') {
            $corps .= "\n$libelle : $valeur";
        }
    }
}

$entetes = 'From: no-reply@solybat18.fr' . "\r\n" . 'Reply-To: ' . $email;

// L'arobase n'est pas de la negligence : sans elle, un echec d'envoi affiche un
// Warning PHP, cette sortie precede le header() de redirection, et le visiteur
// se retrouve devant un message d'erreur brut au lieu d'etre redirige — sa
// demande perdue sans qu'il le sache. On teste donc la valeur de retour.
$envoye = @mail($adresseContact, $sujet, $corps, $entetes);

if (!$envoye) {
    // Mieux vaut l'avouer que d'afficher un faux « message envoyé » : la page
    // du formulaire invite alors à écrire directement à l'adresse de contact.
    header('Location: ' . $pageFormulaire . '?erreur=envoi');
    exit;
}

header('Location: /devis-merci/');
exit;
