// Job pipeline. `waitingOn` says who has the next move, which drives the dashboard.
export const STATUSES = {
  submitted:      {label: 'New request',          waitingOn: 'team',     tone: 'new'},
  quoted:         {label: 'Waiting for card',     waitingOn: 'customer', tone: 'wait'},
  card_saved:     {label: 'Ready to start',       waitingOn: 'team',     tone: 'go'},
  in_progress:    {label: 'Writing script',       waitingOn: 'team',     tone: 'work'},
  script_sent:    {label: 'Script with customer', waitingOn: 'customer', tone: 'wait'},
  in_production:  {label: 'In production',        waitingOn: 'team',     tone: 'work'},
  first_cut_sent: {label: 'First cut with customer', waitingOn: 'customer', tone: 'wait'},
  revising:       {label: 'Revising',             waitingOn: 'team',     tone: 'work'},
  delivered:      {label: 'Delivered',            waitingOn: null,       tone: 'done'},
  declined:       {label: 'Declined',             waitingOn: null,       tone: 'off'},
  cancelled:      {label: 'Cancelled',            waitingOn: null,       tone: 'off'},
}

export const ACTIVE = ['submitted', 'quoted', 'card_saved', 'in_progress', 'script_sent', 'in_production', 'first_cut_sent', 'revising']

export const projectRef = n => `M35-${n}`

export function formatMoney(cents) {
  if (cents == null) return '—'
  return (cents / 100).toLocaleString('en-US', {style: 'currency', currency: 'USD'})
}

// Next-step buttons per status. `needs` marks steps that collect extra input.
export const TRANSITIONS = {
  submitted:      [{to: 'quoted', label: 'Accept & set price', primary: true, needs: 'price'}, {to: 'declined', label: 'Decline', danger: true}],
  quoted:         [{to: 'in_progress', label: 'Start job (paid another way)', needs: 'confirm'}, {to: 'cancelled', label: 'Cancel', danger: true}],
  card_saved:     [{to: 'in_progress', label: 'Start job', primary: true, needs: 'confirm'}, {to: 'cancelled', label: 'Cancel', danger: true}],
  in_progress:    [{to: 'script_sent', label: 'Script sent to customer', primary: true}, {to: 'cancelled', label: 'Cancel', danger: true}],
  script_sent:    [{to: 'in_production', label: 'Script approved', primary: true}, {to: 'in_progress', label: 'Customer asked for script changes'}],
  in_production:  [{to: 'first_cut_sent', label: 'First cut sent', primary: true}],
  first_cut_sent: [{to: 'revising', label: 'Revision notes received', primary: true}, {to: 'delivered', label: 'No changes, delivered'}],
  revising:       [{to: 'delivered', label: 'Final delivered', primary: true}],
  delivered: [],
  declined: [{to: 'submitted', label: 'Reopen'}],
  cancelled: [{to: 'submitted', label: 'Reopen'}],
}
