<?php

/**
 * Logique pure des formulaires du site. Deux types de demandes passent par le
 * meme point d'entree (traiter-devis.php) :
 *   - 'devis'   : demande de devis travaux, differenciee par profil ;
 *   - 'analyse' : demande d'analyse de rentabilite avec Spark Cash Flow.
 * Un seul fichier PHP a maintenir, donc un seul honeypot et un seul nettoyage
 * anti-injection d'en-tetes a garder corrects.
 */

const TYPES_DEMANDE = ['devis', 'analyse'];
const PROFILS = ['agence', 'investisseur', 'particulier'];

function estHoneypotRempli(array $post): bool
{
    return isset($post['site_web']) && trim((string) $post['site_web']) !== '';
}

function nettoyerValeur(string $valeur): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $valeur));
}

/**
 * Type de la demande. Absent = 'devis', pour que les anciens formulaires (et
 * les tests ecrits avant l'ajout de l'analyse) continuent de fonctionner.
 * Une valeur inconnue n'est pas silencieusement ramenee a 'devis' : elle est
 * signalee comme erreur par validerDonnees(), sinon une faute de frappe dans
 * un champ cache enverrait le mauvais mail sans que personne ne le voie.
 */
function typeDemande(array $post): string
{
    $type = trim((string) ($post['type'] ?? ''));

    return $type === '' ? 'devis' : $type;
}

function validerDonnees(array $post): array
{
    $erreurs = [];
    $type = typeDemande($post);

    if (!in_array($type, TYPES_DEMANDE, true)) {
        $erreurs['type'] = 'Type de demande inconnu.';
        $type = 'devis';
    }

    // --- Champs communs aux deux formulaires ---

    $nom = trim((string) ($post['nom'] ?? ''));
    if ($nom === '') {
        $erreurs['nom'] = 'Le nom est requis.';
    }

    $email = trim((string) ($post['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erreurs['email'] = 'Adresse email invalide.';
    }

    // --- Champs propres a chaque type ---

    if ($type === 'devis') {
        $profil = trim((string) ($post['profil'] ?? ''));
        if (!in_array($profil, PROFILS, true)) {
            $erreurs['profil'] = 'Sélectionnez un profil valide.';
        }

        $message = trim((string) ($post['message'] ?? ''));
        if ($message === '') {
            $erreurs['message'] = 'Le message est requis.';
        }
    } else {
        $ville = trim((string) ($post['ville'] ?? ''));
        if ($ville === '') {
            $erreurs['ville'] = 'La ville ou le secteur du bien est requis.';
        }

        $bien = trim((string) ($post['bien'] ?? ''));
        if ($bien === '') {
            $erreurs['bien'] = 'Le type et la surface du bien sont requis.';
        }

        $prix = trim((string) ($post['prix_achat'] ?? ''));
        if ($prix === '') {
            $erreurs['prix_achat'] = "Le prix d'achat envisagé est requis.";
        }
    }

    return [
        'valide' => count($erreurs) === 0,
        'erreurs' => $erreurs,
        'type' => $type,
    ];
}
