<?php
require __DIR__ . '/devis-validation.php';

// Placeholder — remplacer par la vraie adresse de contact Soly'bat une fois connue
// (garder cohérent avec src/_data/site.json > email, utilisé côté front).
$adresseContact = 'contact@solybat.fr';

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
$entetes = 'From: no-reply@solybat.fr' . "\r\n" . 'Reply-To: ' . $email;

mail($adresseContact, $sujet, $corps, $entetes);

header('Location: /devis-merci/');
exit;
