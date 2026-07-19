<?php
require __DIR__ . '/../devis-validation.php';

function verifier(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "ECHEC: $message\n");
        exit(1);
    }
    echo "OK: $message\n";
}

$donneesValides = [
    'profil' => 'particulier',
    'nom' => 'Jean Dupont',
    'email' => 'jean@example.com',
    'message' => 'Bonjour, je souhaite un devis.',
];
$resultat = validerDonnees($donneesValides);
verifier($resultat['valide'] === true, 'donnees valides acceptees');

$donneesIncompletes = ['profil' => '', 'nom' => '', 'email' => 'pas-un-email', 'message' => ''];
$resultat2 = validerDonnees($donneesIncompletes);
verifier($resultat2['valide'] === false, 'donnees incompletes rejetees');
verifier(count($resultat2['erreurs']) === 4, 'quatre erreurs relevees');

verifier(estHoneypotRempli(['site_web' => 'http://spam.example']) === true, 'honeypot rempli detecte');
verifier(estHoneypotRempli(['site_web' => '']) === false, 'honeypot vide non detecte');
verifier(estHoneypotRempli([]) === false, 'honeypot absent non detecte');

verifier(nettoyerValeur("Jean\r\nBcc: pirate@example.com") === "Jean Bcc: pirate@example.com", 'injection en-tete neutralisee');

echo "Tous les tests sont passes.\n";
