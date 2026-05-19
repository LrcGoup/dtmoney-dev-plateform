import Link from 'next/link'
import { getIntegrationGuideMeta } from '@/lib/integration-guide'

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80 p-4 font-mono text-xs leading-relaxed text-slate-300">
      {children}
    </pre>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-slate-800 pb-10 last:border-0">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  )
}

export function IntegrationGuideContent() {
  const { base, swagger } = getIntegrationGuideMeta()

  return (
    <article className="space-y-10">
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">Documentation</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Guide d’intégration DTMoney API</h1>
        <p className="mt-4 max-w-2xl text-slate-400">
          Intégrez les paiements DTMoney dans votre marketplace, e-commerce ou application mobile via l’API REST
          développeur. Ce guide est réservé aux comptes connectés — l’API v2 expose les endpoints et le Swagger
          technique.
        </p>
      </header>

      <Section id="prerequisites" title="1. Prérequis">
        <ul className="list-disc space-y-2 pl-5">
          <li>Un compte DTMoney avec profil <strong className="text-white">Agent</strong>, <strong className="text-white">Marchand</strong> ou <strong className="text-white">Partenaire</strong>.</li>
          <li>Un <Link href="/register" className="text-emerald-400 hover:underline">compte développeur</Link> sur cette plateforme, lié à votre numéro de téléphone DTMoney.</li>
          <li>Au moins une <Link href="/dashboard/api-keys" className="text-emerald-400 hover:underline">clé API</Link> générée depuis le dashboard.</li>
        </ul>
        <p>
          Les clés API sont créées en self-service (plusieurs clés possibles, rotation et révocation). Ne les commitez
          jamais — utilisez des variables d’environnement ou un secret manager.
        </p>
      </Section>

      <Section id="base-url" title="2. Base URL">
        <p>Toutes les routes métier sont sous :</p>
        <Code>{`${base}/dtmoney-api/...`}</Code>
        <p>
          Référence interactive OpenAPI :{' '}
          <a href={swagger} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
            Swagger DTMoney API
          </a>
        </p>
      </Section>

      <Section id="onboarding" title="3. Compte développeur">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <Link href="/register" className="text-emerald-400 hover:underline">Inscription</Link> avec email, mot de passe et numéro de téléphone DTMoney.
          </li>
          <li>Vérification email (code OTP).</li>
          <li>Connexion JWT → création de clé(s) API → configuration webhooks.</li>
        </ol>
        <p>La gestion des clés et webhooks se fait via JWT (dashboard). Les appels métier utilisent <code className="text-emerald-400">dt-api-key</code>.</p>
      </Section>

      <Section id="authentication" title="4. Authentification API">
        <p>Chaque requête métier inclut :</p>
        <Code>{`dt-api-key: votre_cle_api_secrete`}</Code>
        <p>En cas d’absence ou de clé invalide : <strong className="text-white">401</strong> avec <code className="text-slate-400">error.message</code>.</p>
      </Section>

      <Section id="responses" title="5. Format des réponses">
        <p>Succès :</p>
        <Code>{`{ "ok": true, "statusCode": 200, "data": { ... } }`}</Code>
        <p>Erreur :</p>
        <Code>{`{ "ok": false, "statusCode": 4xx, "error": { "message": "..." } }`}</Code>
      </Section>

      <Section id="checkout" title="6. Flux checkout recommandé">
        <ol className="list-decimal space-y-2 pl-5">
          <li>L’utilisateur choisit « Payer avec DTMoney » et saisit son téléphone.</li>
          <li><strong className="text-white">Quote</strong> — vérifier solde + frais.</li>
          <li>Afficher le total TTC et collecter le <strong className="text-white">PIN</strong> client.</li>
          <li><strong className="text-white">Confirm</strong> — débit avec <code className="text-emerald-400">idempotencyKey</code> obligatoire.</li>
          <li>En cas de timeout : <strong className="text-white">GET by-order/:orderId</strong>.</li>
        </ol>
      </Section>

      <Section id="endpoints" title="7. Endpoints">
        <h3 className="font-medium text-white">POST /payments/quote</h3>
        <Code>{`POST ${base}/dtmoney-api/payments/quote
dt-api-key: ...

{ "clientPhone": "242612345678", "amount": 5000 }`}</Code>
        <p>Retourne <code className="text-slate-400">balance</code>, <code className="text-slate-400">fees</code>, <code className="text-slate-400">totalAmount</code>, <code className="text-slate-400">accountBalance</code>.</p>

        <h3 className="mt-6 font-medium text-white">POST /payments/confirm</h3>
        <Code>{`POST ${base}/dtmoney-api/payments/confirm
Content-Type: application/json
dt-api-key: ...
Idempotency-Key: CMD-2024-001-unique

{
  "clientPhone": "242612345678",
  "pin": "1234",
  "amount": 5000,
  "orderId": "CMD-2024-001",
  "idempotencyKey": "CMD-2024-001-unique"
}`}</Code>
        <p><code className="text-emerald-400">idempotencyKey</code> est <strong className="text-white">obligatoire</strong> (body ou en-tête <code className="text-slate-400">Idempotency-Key</code>).</p>

        <h3 className="mt-6 font-medium text-white">GET /payments/by-order/:orderId</h3>
        <Code>{`GET ${base}/dtmoney-api/payments/by-order/CMD-2024-001
dt-api-key: ...`}</Code>

        <h3 className="mt-6 font-medium text-white">GET /customers/:phone/balance</h3>
        <Code>{`GET ${base}/dtmoney-api/customers/242612345678/balance?amount=5000
dt-api-key: ...`}</Code>

        <h3 className="mt-6 font-medium text-white">POST /payments/deposit (Agents uniquement)</h3>
        <p>Dépôt cash en point physique — ignoré pour une intégration purement en ligne.</p>
        <Code>{`POST ${base}/dtmoney-api/payments/deposit

{ "clientPhone": "242612345678", "amount": 10000 }`}</Code>
      </Section>

      <Section id="idempotency" title="8. Idempotence">
        <p>
          Pour éviter un double encaissement (double clic, timeout, retry), envoyez une clé unique par paiement via{' '}
          <code className="text-emerald-400">idempotencyKey</code> ou l’en-tête <code className="text-emerald-400">Idempotency-Key</code>.
          Une requête identique retourne le même succès sans second débit.
        </p>
        <p>Utilisez aussi <code className="text-slate-400">orderId</code> pour la traçabilité et la réconciliation.</p>
      </Section>

      <Section id="webhooks" title="9. Webhooks">
        <p>
          Configurez l’URL et le secret depuis le{' '}
          <Link href="/dashboard/webhooks" className="text-emerald-400 hover:underline">dashboard webhooks</Link>{' '}
          (JWT). Événements : <code className="text-emerald-400">payment.succeeded</code>,{' '}
          <code className="text-emerald-400">deposit.succeeded</code>.
        </p>
        <p>En-têtes : <code className="text-slate-400">X-DTMoney-Event</code>, <code className="text-slate-400">X-DTMoney-Signature: sha256=&lt;hmac&gt;</code>.</p>
        <Code>{`{
  "event": "payment.succeeded",
  "operationId": "uuid",
  "amount": 5000,
  "currency": "XAF",
  "clientPhoneMasked": "242***5678",
  "timestamp": "2024-03-05T14:30:00.000Z",
  "orderId": "CMD-2024-001",
  "idempotencyKey": "CMD-2024-001-unique"
}`}</Code>
        <p>Vérifiez HMAC-SHA256 sur le body brut. Retries : 3 tentatives (1s, 2s, 4s). Répondez 2xx sous 15s.</p>
      </Section>

      <Section id="best-practices" title="10. Bonnes pratiques">
        <ul className="list-disc space-y-2 pl-5">
          <li>HTTPS uniquement en production.</li>
          <li>PIN : ne jamais stocker, transiter uniquement lors du confirm.</li>
          <li>Idempotence obligatoire sur chaque paiement.</li>
          <li>Parser <code className="text-slate-400">error.message</code> pour l’UX.</li>
          <li>Webhooks idempotents côté réception (<code className="text-slate-400">operationId</code>).</li>
        </ul>
      </Section>
    </article>
  )
}
