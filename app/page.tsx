import { MarketingNav } from '@/components/layout/marketing-nav'
import { MarketingAuthActions } from '@/components/layout/marketing-auth-actions'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <MarketingNav />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-emerald-400">
              Developer Platform
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Acceptez DTMoney dans votre produit
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              API REST orientée développeurs : devis, confirmation de paiement, webhooks signés et gestion
              self-service des clés API. Conçue pour marketplaces, e-commerce et intégrations B2B.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <MarketingAuthActions size="lg" />
            </div>
          </div>

          <div className="mt-16 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-2xl">
            <pre className="overflow-x-auto p-6 text-sm leading-relaxed text-slate-300 font-[family-name:var(--font-geist-mono)]">
              {`# Exemple checkout
POST /api/v2/dtmoney-api/payments/quote
POST /api/v2/dtmoney-api/payments/confirm

Headers:
  dt-api-key: sk_live_••••••••••••
  Idempotency-Key: order-12345`}
            </pre>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-800 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          {[
            {
              title: 'Clés API multi-environnements',
              desc: 'Créez, révoquez et faites tourner vos clés depuis le dashboard. Scopes granulaires.',
            },
            {
              title: 'Paiements sécurisés',
              desc: 'PIN client, idempotence obligatoire, transactions atomiques et réconciliation par orderId.',
            },
            {
              title: 'Webhooks HMAC',
              desc: 'Recevez payment.succeeded, payment.refunded et événements de dette avec signature X-DTMoney-Signature.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="integration" className="border-t border-slate-800 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-white">Flux d’intégration</h2>
          <ol className="mt-8 space-y-4 text-slate-400">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400">
                1
              </span>
              Créez un compte développeur et liez votre numéro de téléphone DTMoney (Agent, Marchand ou Partenaire).
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400">
                2
              </span>
              Générez une clé API et configurez vos webhooks.
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-400">
                3
              </span>
              Au checkout : quote → collecte PIN → confirm avec idempotencyKey.
            </li>
          </ol>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        DTMoney API © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
