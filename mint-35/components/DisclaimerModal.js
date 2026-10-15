import Modal from './Modal'
import DisclaimerText from './DisclaimerText'
import {DISCLAIMER_TITLE} from '@/lib/disclaimer'

export default function DisclaimerModal() {
  return (
    <Modal id="disclaimer-dialog" titleId="disclaimer-title">
      <p className="eyebrow">Before you order</p>
      <h2 id="disclaimer-title">{DISCLAIMER_TITLE}</h2>
      <DisclaimerText />
    </Modal>
  )
}
