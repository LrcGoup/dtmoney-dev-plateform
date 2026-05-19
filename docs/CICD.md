# CI/CD (GitHub Actions)

## Workflows

| Fichier                        | Rôle                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`     | Sur `push` / `pull_request` vers `main` : `bun install`, `next build`.                                                     |
| `.github/workflows/deploy.yml` | Après un **CI réussi** sur `main` : SSH vers le VPS, `git pull`, `bun install`, `build`, `systemctl restart dt-developers`. |

## Secrets GitHub (dépôt → _Settings_ → _Secrets and variables_ → _Actions_)

| Secret            | Obligatoire | Description                                                                      |
| ----------------- | ----------- | -------------------------------------------------------------------------------- |
| `SSH_HOST`        | oui         | Ex. `vps101055.serveur-vps.net`                                                  |
| `SSH_USER`        | oui         | Ex. `root`                                                                       |
| `SSH_PRIVATE_KEY` | oui         | Clé privée OpenSSH (multi-lignes), paire de la clé publique autorisée sur le VPS |
| `DEPLOY_PATH`     | non         | Chemin du clone sur le VPS (défaut : `/root/dtmoney-developers`)                 |
| `GH_PAT`          | non         | Token `repo` si le `git fetch` sur le VPS utilise un remote HTTPS                |

Les mêmes secrets que **dtmoney-admin** peuvent être réutilisés si le déploiement cible le même VPS (seul `DEPLOY_PATH` diffère si besoin).

## VPS (prérequis)

- Dépôt cloné dans `DEPLOY_PATH` avec remote pointant vers GitHub.
- [Bun](https://bun.sh) installé (`bun --version`).
- Service `dt-developers` installé (`config/dt-developers.service`).
- Apache configuré (`config/apache-developers.dt-money.com.conf`).
- Fichier `.env` présent sur le serveur (non commité) avec `NEXT_PUBLIC_API_URL`, `API_PROXY_TARGET`, etc.

## Vérification locale

```bash
bun install
bun run lint
bun run build
```
