<?php

function estHoneypotRempli(array $post): bool
{
    return isset($post['site_web']) && trim((string) $post['site_web']) !== '';
}

function nettoyerValeur(string $valeur): string
{
    return trim(str_replace(["\r", "\n"], ' ', $valeur));
}

function validerDonnees(array $post): array
{
    $erreurs = [];

    $profil = trim((string) ($post['profil'] ?? ''));
    if (!in_array($profil, ['agence', 'investisseur', 'particulier'], true)) {
        $erreurs['profil'] = 'Sélectionnez un profil valide.';
    }

    $nom = trim((string) ($post['nom'] ?? ''));
    if ($nom === '') {
        $erreurs['nom'] = 'Le nom est requis.';
    }

    $email = trim((string) ($post['email'] ?? ''));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erreurs['email'] = 'Adresse email invalide.';
    }

    $message = trim((string) ($post['message'] ?? ''));
    if ($message === '') {
        $erreurs['message'] = 'Le message est requis.';
    }

    return [
        'valide' => count($erreurs) === 0,
        'erreurs' => $erreurs,
    ];
}
