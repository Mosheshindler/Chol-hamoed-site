// The three Mint 35 packages, shared by the homepage and the Start page.
export const PACKAGES = [
  {slug: 'single-35', name: 'Single 35', price: 2800, blurb: 'One commercial, one message.', items: ['1 commercial, 30–60 sec', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round'], cta: 'Start My Commercial'},
  {slug: 'campaign-3', name: 'Campaign 3', price: 6400, priceNote: 'Save $2,000 vs. 3 singles', featured: true, blurb: 'Three spots around one campaign.', items: ['3 commercials, 30–60 sec each', '3 unique videos, one shared style', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round each'], cta: 'Build My Campaign'},
  {slug: 'online-campaign', name: 'Road to Goal', price: 3800, priceNote: '$760 per video', tag: 'Organizations only', orgOnly: true, blurb: 'Milestone videos for your fundraising campaign, at a lower price.', milestones: ['Live Now', '25%', '50%', '75%', 'We Made It!'], items: ['5 milestone videos, 35–45 sec each', '1 sample video to approve', '1 revision round on the first video', 'The other 4 follow the approved look', {text: '1 platform export for all 5', info: 'formats-dialog'}], footnote: 'For organizations running a fundraising campaign.', cta: 'Launch My Campaign'},
]

export const NOT_SURE = {slug: 'not-sure', name: 'Not sure yet'}

// Packages that need an organization name on the form.
export const ORG_ONLY_NAMES = PACKAGES.filter(p => p.orgOnly).map(p => p.name)

// Every package name the form may send (used to validate submissions).
export const PACKAGE_NAMES = [...PACKAGES, NOT_SURE].map(p => p.name)

export const formatPrice = dollars => '$' + dollars.toLocaleString('en-US')

export const packageByName = name => PACKAGES.find(p => p.name === name) || null

export const packageBySlug = slug => [...PACKAGES, NOT_SURE].find(p => p.slug === slug) || null
