# API Keys & Webhooks — dt-dev-platform

## API Keys page

`app/dashboard/api-keys/page.tsx` — via `api.*` methods

Fonctions typiques :
- Lister clés
- Créer / révoquer
- Scopes affichés

## Webhooks

Dashboard config URL + secrets — aligné dt-api Connect v3 webhooks module

## Auth pour gestion

JWT dashboard developer — **pas** `dt-connect-key` (réservé appels métier)

## Exemples doc

Guide montre `dt-connect-key: dt_live_...` pour appels métier Connect v3. Le portail n’utilise pas Connect v2.

## ride-api

Ride a sa propre clé partenaire côté serveur — pas gérée dans ce UI
