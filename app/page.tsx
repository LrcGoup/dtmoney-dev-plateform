import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect(process.env.NEXT_PUBLIC_DT_BUSINESS_URL ?? 'https://business.dt-money.com')
}
