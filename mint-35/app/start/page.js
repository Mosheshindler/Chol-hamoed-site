import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PackageCards from '@/components/PackageCards'
import ProjectForm from '@/components/ProjectForm'
import FormatsModal from '@/components/FormatsModal'
import DialogController from '@/components/DialogController'
import {packageBySlug, NOT_SURE} from '@/lib/packages'

export const metadata = {title: 'Start a project · Mint 35'}

// Step 1: pick a package. Step 2 (?package=…): the project questionnaire.
export default async function StartPage({searchParams}) {
  const {package: slug} = await searchParams
  const pkg = packageBySlug(slug)

  return (
    <>
      <Header />
      <main className="start-page">
        <div className="container">
          <ol className="stepper" aria-label="Progress">
            <li className={pkg ? 'done' : 'current'}><span>1</span>Choose a package</li>
            <li className={pkg ? 'current' : undefined}><span>2</span>Tell us about your project</li>
          </ol>

          {!pkg ? (
            <section aria-labelledby="choose-title">
              <h1 id="choose-title">Choose your Mint 35</h1>
              <p className="lead">Pick a package to continue. Nothing is charged until we accept your project and start the job.</p>
              <PackageCards ctaLabel="Choose" />
              <p className="package-note">
                Not sure which fits? <Link href={`/start?package=${NOT_SURE.slug}`}>Continue without choosing →</Link> and we&rsquo;ll recommend one.
              </p>
            </section>
          ) : (
            <section className="start-form" aria-labelledby="form-title">
              <div className="chosen">
                <span className="chosen-label">Package</span>
                <b>{pkg.name}</b>
                <Link href="/start" className="chosen-change">Change</Link>
              </div>
              <ProjectForm packageName={pkg.name} />
            </section>
          )}
        </div>
      </main>
      <Footer />
      <FormatsModal />
      <DialogController />
    </>
  )
}
