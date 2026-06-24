# API Keys & Webhooks — dt-dev-platform

## API Keys page

`app/dashboard/api-keys/page.tsx` — via `api.*` methods

Fonctions typiques :
- Lister clés
- Créer / révoquer
- Scopes affichés

## Webhooks

Dashboard config URL + secrets — aligné dt-api dtmoney-api webhooks module

## Auth pour gestion

JWT dashboard developer — **pas** `dt-api-key` (réservé appels métier)

## Exemples doc

Guide montre `dt-api-key: sk_live_...` pour appels serveur

## ride-api

Ride a sa propre clé partenaire côté serveur — pas gérée dans ce UI
