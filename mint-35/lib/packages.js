// The three Mint 35 packages, shared by the homepage and the Start page.
export const PACKAGES = [
  {slug: 'single-35', name: 'Single 35', blurb: 'One commercial, one message.', items: ['1 commercial, 30–60 sec', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round'], cta: 'Start My Commercial'},
  {slug: 'campaign-3', name: 'Campaign 3', featured: true, blurb: 'Three spots around one campaign.', items: ['3 commercials', 'Shared look, different hooks', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round each'], cta: 'Build My Campaign'},
  {slug: 'always-on', name: 'Always On', blurb: 'Fresh spots every month.', items: ['Set number of spots per month', 'Priority production queue', 'Your brand assets on file'], cta: 'Go Always On'},
]

export const NOT_SURE = {slug: 'not-sure', name: 'Not sure yet'}

export const packageBySlug = slug => [...PACKAGES, NOT_SURE].find(p => p.slug === slug) || null
