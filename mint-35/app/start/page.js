import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FormatsModal from '@/components/FormatsModal'
import DisclaimerModal from '@/components/DisclaimerModal'
import DialogController from '@/components/DialogController'
import StartFlow from './StartFlow'
import {paymentsReady, tokenizeUrl} from '@/lib/qb'
import {upcomingClosedDays} from '@/lib/holidays'
import {findOffer} from '@/lib/offerServer'

export const metadata = {title: 'Start a project · Mint 35', alternates: {canonical: '/start'}}
export const dynamic = 'force-dynamic'

// Step 1: build the order. Step 2 (?step=details): one form covering every package in it.
export default async function StartPage({searchParams}) {
  const {step, package: legacyPackage, offer: offerToken} = await searchParams
  const tokenUrl = (await paymentsReady()) ? tokenizeUrl() : null
  // A custom offer link (Admin → Offers) skips the package step: just that package, at its price.
  let offer = null
  if (offerToken) {
    const {offer: o, state} = await findOffer(String(offerToken))
    offer = o && state === 'Open'
      ? {token: o.token, id: o.id, title: o.title, items: o.items, videos: o.videos, price_cents: o.price_cents, message: o.message,
          expires_on: o.expires_on, client_name: o.client_name, email: o.email, company: o.company}
      : {closed: state}
  }
  return (
    <>
      <Header />
      <main className="start-page">
        <div className="container">
          <StartFlow offer={offer} step={step === 'details' ? 'details' : 'order'} legacyPackage={legacyPackage || null} tokenUrl={tokenUrl} closedDays={upcomingClosedDays()} />
        </div>
      </main>
      <Footer />
      <FormatsModal />
      <DisclaimerModal />
      <DialogController />
    </>
  )
}
