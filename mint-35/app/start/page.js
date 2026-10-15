import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FormatsModal from '@/components/FormatsModal'
import DisclaimerModal from '@/components/DisclaimerModal'
import DialogController from '@/components/DialogController'
import StartFlow from './StartFlow'
import {paymentsReady, tokenizeUrl} from '@/lib/qb'

export const metadata = {title: 'Start a project · Mint 35'}
export const dynamic = 'force-dynamic'

// Step 1: build the order. Step 2 (?step=details): one form covering every package in it.
export default async function StartPage({searchParams}) {
  const {step, package: legacyPackage} = await searchParams
  const tokenUrl = (await paymentsReady()) ? tokenizeUrl() : null
  return (
    <>
      <Header />
      <main className="start-page">
        <div className="container">
          <StartFlow step={step === 'details' ? 'details' : 'order'} legacyPackage={legacyPackage || null} tokenUrl={tokenUrl} />
        </div>
      </main>
      <Footer />
      <FormatsModal />
      <DisclaimerModal />
      <DialogController />
    </>
  )
}
