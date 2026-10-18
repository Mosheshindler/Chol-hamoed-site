// The three Mint 35 packages, shared by the homepage and the Start page.
export const PACKAGES = [
  {slug: 'single-35', name: 'Single 35', price: 2800, blurb: 'One video, one message.', items: ['1 video, 30–60 sec', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round'], cta: 'Start My Video'},
  {slug: 'campaign-3', name: 'Campaign 3', price: 7200, priceNote: 'Save $1,200 vs. 3 singles', featured: true, blurb: 'Three different videos, one campaign.', items: ['3 videos, 30–60 sec each', '3 different stories, one shared style', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round each'], cta: 'Build My Campaign'},
  {slug: 'online-campaign', name: 'Momentum Pack', price: 3800, tag: 'For online fundraisers', orgOnly: true, blurb: 'One video that keeps pace with your campaign.', why: 'Designed once, updated at every milestone. That’s why it costs less.', milestones: ['Launch', '25%', '50%', '75%', 'Goal!'], items: ['5 videos, 35–45 sec each', '1 sample to approve first', '1 revision round', {text: '1 platform export for all 5', info: 'formats-dialog'}], cta: 'Launch My Campaign'},
]

export const NOT_SURE = {slug: 'not-sure', name: 'Not sure yet'}

// Packages that need an organization name on the form.
export const ORG_ONLY_NAMES = PACKAGES.filter(p => p.orgOnly).map(p => p.name)

// Every package name the form may send (used to validate submissions).
export const PACKAGE_NAMES = [...PACKAGES, NOT_SURE].map(p => p.name)

export const formatPrice = dollars => '$' + dollars.toLocaleString('en-US')

export const packageByName = name => PACKAGES.find(p => p.name === name) || null

export const packageBySlug = slug => [...PACKAGES, NOT_SURE].find(p => p.slug === slug) || null
