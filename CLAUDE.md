# dt-dev-platform

@AGENTS.md

## Démarrage de session — OBLIGATOIRE

Avant tout `grep`, `glob`, `find`, `ls` ou exploration large :

1. Lire `D:\Projects\ride-platform-docs\INDEX.md`
2. Lire `integrations/payments-dtmoney.md` + `integrations/api-envelopes.md`
3. Lire `projects/dt-dev-platform.md`
4. Lire **2–4** `.skills/` selon la tâche

Résumer en 5 lignes avant de coder.

## .skills par type de tâche

| Tâche | Fichiers |
|-------|----------|
| Architecture | `.skills/architecture.md` |
| Client dt-api | `.skills/api-client.md` — vérifie `ok` avant `data` |
| Proxy / routes | `.skills/api-proxy.md` |
| Auth session | `.skills/auth-session.md` |
| Pages dashboard | `.skills/dashboard-pages.md` |
| Guide intégration | `.skills/integration-guide.md` |
| Clés API / webhooks | `.skills/api-keys-webhooks.md` |
| UI | `.skills/ui-components.md` |
| Config | `.skills/env-config.md`, `.skills/types.md` |
| Écosystème | `.skills/ecosystem.md` |

## Rappel

- Next.js **16** — lire `node_modules/next/dist/docs/` si incertain (voir AGENTS.md)
- Enveloppe dt-api : `{ ok, statusCode, data }` — pas celle de ride-api
- Documente les appels `/api/v2/dtmoney-api/...`

## Interdits

- Pas de mélange enveloppes ride-api dans le client dt

## Fin de tâche

Flux documenté change → MAJ `components/docs/integration-guide-content.tsx` + hub.
