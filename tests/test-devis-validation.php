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

// --- Type de la demande ---

verifier(typeDemande([]) === 'devis', 'type absent traite comme un devis');
verifier(typeDemande(['type' => 'analyse']) === 'analyse', 'type analyse reconnu');
verifier($resultat['type'] === 'devis', 'le type est renvoye avec le resultat');

$typeInconnu = validerDonnees($donneesValides + ['type' => 'nimporte-quoi']);
verifier($typeInconnu['valide'] === false, 'type inconnu rejete');
verifier(isset($typeInconnu['erreurs']['type']), 'le type inconnu est signale comme tel');
verifier($typeInconnu['type'] === 'devis', 'un type inconnu retombe sur devis pour la redirection');

// --- Demande d analyse de rentabilite ---

$analyseValide = [
    'type' => 'analyse',
    'nom' => 'Claire Martin',
    'email' => 'claire@example.com',
    'ville' => 'Vierzon',
    'bien' => 'T2 de 48 m2',
    'prix_achat' => '45 000 EUR',
];
$resultatAnalyse = validerDonnees($analyseValide);
verifier($resultatAnalyse['valide'] === true, 'demande d analyse valide acceptee');
verifier($resultatAnalyse['type'] === 'analyse', 'type analyse conserve');

// Le profil et le message sont exiges du devis, pas de l analyse : les reclamer
// ici rendrait le formulaire d analyse impossible a valider.
verifier(!isset($resultatAnalyse['erreurs']['profil']), 'le profil n est pas exige pour une analyse');
verifier(!isset($resultatAnalyse['erreurs']['message']), 'le message n est pas exige pour une analyse');

$analyseIncomplete = ['type' => 'analyse', 'nom' => '', 'email' => 'pas-un-email'];
$resultatIncomplet = validerDonnees($analyseIncomplete);
verifier($resultatIncomplet['valide'] === false, 'demande d analyse incomplete rejetee');
verifier(count($resultatIncomplet['erreurs']) === 5, 'cinq erreurs relevees sur l analyse');

// A l inverse, les champs du bien ne doivent pas etre reclames a un devis.
$devisSansBien = validerDonnees($donneesValides);
verifier(!isset($devisSansBien['erreurs']['ville']), 'la ville n est pas exigee pour un devis');
verifier(!isset($devisSansBien['erreurs']['prix_achat']), 'le prix d achat n est pas exige pour un devis');

echo "Tous les tests sont passes.\n";
