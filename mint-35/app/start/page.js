import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FormatsModal from '@/components/FormatsModal'
import DialogController from '@/components/DialogController'
import StartFlow from './StartFlow'

export const metadata = {title: 'Start a project · Mint 35'}

// Step 1: build the order. Step 2 (?step=details): one form covering every package in it.
export default async function StartPage({searchParams}) {
  const {step, package: legacyPackage} = await searchParams
  return (
    <>
      <Header />
      <main className="start-page">
        <div className="container">
          <StartFlow step={step === 'details' ? 'details' : 'order'} legacyPackage={legacyPackage || null} />
        </div>
      </main>
      <Footer />
      <FormatsModal />
      <DialogController />
    </>
  )
}
