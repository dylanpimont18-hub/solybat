<?php
require __DIR__ . '/devis-validation.php';

// Adresse de contact Soly'bat (cohérente avec src/_data/site.json > email).
// Adresse de réception des demandes de devis. Elle est sur le même domaine que
// l'en-tête From ci-dessous et hébergée chez le même prestataire : la remise est
// donc locale, le cas le plus fiable. Ne pas y remettre une adresse externe
// (gmail, orange) sans vérifier SPF/DKIM, sous peine de finir en indésirables.
$adresseContact = 'contact@solybat18.fr';

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
if (!$resultat['valide']) {
    // La page /devis/ est statique : les valeurs saisies sont repassées en
    // paramètres d'URL pour que form-devis.js les réaffiche côté client,
    // au lieu d'une redirection sèche qui les perdrait.
    $parametres = http_build_query([
        'erreur' => '1',
        'profil' => $_POST['profil'] ?? '',
        'nom' => $_POST['nom'] ?? '',
        'email' => $_POST['email'] ?? '',
        'telephone' => $_POST['telephone'] ?? '',
        'message' => $_POST['message'] ?? '',
    ]);
    header('Location: /devis/?' . $parametres);
    exit;
}

$profil = nettoyerValeur($_POST['profil']);
$nom = nettoyerValeur($_POST['nom']);
$email = nettoyerValeur($_POST['email']);
$telephone = nettoyerValeur($_POST['telephone'] ?? '');
$message = nettoyerValeur($_POST['message']);

$sujet = 'Nouvelle demande de devis — ' . $profil;
$corps = "Profil : $profil\nNom : $nom\nEmail : $email\nTéléphone : $telephone\n\nMessage :\n$message\n";
$entetes = 'From: no-reply@solybat18.fr' . "\r\n" . 'Reply-To: ' . $email;

mail($adresseContact, $sujet, $corps, $entetes);

header('Location: /devis-merci/');
exit;
