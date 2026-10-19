// Job pipeline. `waitingOn` says who has the next move, which drives the dashboard.
export const STATUSES = {
  submitted:      {label: 'New request',          waitingOn: 'team',     tone: 'new'},
  quoted:         {label: 'Waiting for card',     waitingOn: 'customer', tone: 'wait'},
  card_saved:     {label: 'Ready to start (card on file)', waitingOn: 'team', tone: 'go'},
  in_progress:    {label: 'Writing script',       waitingOn: 'team',     tone: 'work'},
  script_sent:    {label: 'Script with customer', waitingOn: 'customer', tone: 'wait'},
  in_production:  {label: 'In production',        waitingOn: 'team',     tone: 'work'},
  first_cut_sent: {label: 'First cut with customer', waitingOn: 'customer', tone: 'wait'},
  approved:       {label: 'Approved, finalizing', waitingOn: 'team',     tone: 'go'},
  revising:       {label: 'Revising',             waitingOn: 'team',     tone: 'work'},
  delivered:      {label: 'Delivered',            waitingOn: null,       tone: 'done'},
  declined:       {label: 'Declined',             waitingOn: null,       tone: 'off'},
  cancelled:      {label: 'Cancelled',            waitingOn: null,       tone: 'off'},
}

export const ACTIVE = ['submitted', 'quoted', 'card_saved', 'in_progress', 'script_sent', 'in_production', 'first_cut_sent', 'approved', 'revising']

export const projectRef = n => `M35-${n}`

export function formatMoney(cents) {
  if (cents == null) return '—'
  return (cents / 100).toLocaleString('en-US', {style: 'currency', currency: 'USD'})
}

// Next-step buttons per status. `needs` marks steps that collect extra input.
export const TRANSITIONS = {
  submitted:      [{to: 'quoted', label: 'Accept & set price', primary: true, needs: 'price'}, {to: 'declined', label: 'Decline', danger: true}],
  quoted:         [{to: 'in_progress', label: 'Start job (paid another way)', needs: 'confirm'}, {to: 'cancelled', label: 'Cancel', danger: true}],
  card_saved:     [{to: 'in_progress', label: 'Start job & charge card', primary: true, needs: 'confirm'}, {to: 'in_progress', label: 'Start without charging', needs: 'confirm', skipCharge: true}, {to: 'cancelled', label: 'Cancel', danger: true}],
  in_progress:    [{to: 'script_sent', label: 'Script sent to customer', primary: true}, {to: 'cancelled', label: 'Cancel', danger: true}],
  script_sent:    [{to: 'in_production', label: 'Script approved', primary: true}, {to: 'in_progress', label: 'Customer asked for script changes'}],
  in_production:  [{to: 'first_cut_sent', label: 'First cut sent', primary: true}],
  first_cut_sent: [{to: 'approved', label: 'Customer approved', primary: true}, {to: 'revising', label: 'Revision notes received'}],
  approved:       [{to: 'delivered', label: 'Final delivered', primary: true}],
  revising:       [{to: 'delivered', label: 'Final delivered', primary: true}],
  delivered: [],
  declined: [{to: 'submitted', label: 'Reopen'}],
  cancelled: [{to: 'submitted', label: 'Reopen'}],
}

// What the customer sees on their project page.
export const CUSTOMER_STAGES = ['Received', 'Accepted', 'Script', 'Production', 'First cut', 'Delivered']
const STAGE_OF = {submitted: 0, quoted: 1, card_saved: 1, in_progress: 2, script_sent: 2, in_production: 3, first_cut_sent: 4, revising: 4, approved: 4, delivered: 5}
export const customerStage = status => STAGE_OF[status] ?? -1

// Momentum Pack approves a sample video instead of a script.
export const scriptWord = pkg => (pkg === 'Momentum Pack' ? 'sample video' : 'script')

export function customerStatus(p) {
  const w = scriptWord(p.package)
  switch (p.status) {
    case 'submitted': return 'We’re reviewing your project.'
    case 'quoted':
    case 'card_saved': return 'Accepted. Your project will start soon, and we’ll email you when it does.'
    case 'in_progress': return `We’re working on your ${w}.`
    case 'script_sent': return `Your ${w} is ready for your review.`
    case 'in_production': return 'In production.'
    case 'first_cut_sent': return 'Your first cut is ready for your review.'
    case 'revising': return 'We’re making your revisions.'
    case 'approved': return 'Approved! We’re preparing your final files.'
    case 'delivered': return 'Delivered. Your final files are below.'
    default: return 'This project is closed.'
  }
}
