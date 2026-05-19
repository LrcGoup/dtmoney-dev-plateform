# Déploiement VPS

Le portail **dt-developers** est exposé en HTTPS standard sur le port **443** (Apache), pas sur un port personnalisé.

## Architecture

1. **Next.js** écoute en HTTP sur **4023** (`systemd` : `config/dt-developers.service`).
2. **Apache** termine le TLS sur **443** et proxy vers `127.0.0.1:4023` (`config/apache-developers.dt-money.com.conf`).
3. **Apache :80** sert les challenges Let's Encrypt et redirige vers HTTPS.

URL publique : **https://developers.dt-money.com/**

Le port **4022** n’est **pas** exposé (accès public désactivé).

### Installation rapide

```bash
sudo cp config/dt-developers.service /etc/systemd/system/dt-developers.service
sudo systemctl daemon-reload
sudo systemctl enable --now dt-developers

sudo cp config/apache-developers.dt-money.com.conf /etc/apache2/sites-available/developers.dt-money.com.conf
sudo a2ensite developers.dt-money.com.conf
sudo a2enmod proxy proxy_http headers ssl
sudo apache2ctl configtest && sudo systemctl reload apache2
```

### DNS

Enregistrement **A** : `developers` → IP du VPS (`185.98.136.239`).

Certificat :

```bash
sudo certbot certonly --webroot -w /var/www/letsencrypt -d developers.dt-money.com
```

### `.env` (sur le VPS, non commité)

```env
NEXT_PUBLIC_API_URL=https://vps101055.serveur-vps.net:4016/api/v2
API_PROXY_TARGET=http://127.0.0.1:4017
```

## CI/CD

Pipeline GitHub Actions (build + déploiement SSH) : voir [`docs/CICD.md`](CICD.md).
