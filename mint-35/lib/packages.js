import {ADDONS, addonByKey} from './addons.js'

// The three Mint 35 packages, shared by the homepage and the Start page. `videos` = finished videos in the package.
export const PACKAGES = [
  {slug: 'single-35', name: 'Single 35', price: 2800, videos: 1, blurb: 'One video, one message.', items: ['1 video, 30–60 sec', {text: '1 video format: vertical, square or horizontal', info: 'formats-dialog'}, '1 revision round'], cta: 'Start My Video'},
  {slug: 'campaign-3', name: 'Campaign 3', price: 7200, videos: 3, priceNote: 'Save $1,200 vs. 3 singles', featured: true, blurb: 'Three different videos, one campaign.', items: ['3 videos, 30–60 sec each', '3 different stories, one shared style', {text: '1 video format, same for all\u00a03', info: 'formats-dialog'}, '1 revision round each'], cta: 'Build My Campaign'},
  {slug: 'online-campaign', name: 'Momentum Pack', price: 3800, videos: 5, tag: 'For online fundraisers', orgOnly: true, blurb: '5 videos that follow your campaign from launch to goal.', why: 'We produce one video, then update the numbers, photos and text for each milestone. 5 videos, one production.', milestones: ['Launch', '25%', '50%', '75%', 'Goal!'], items: ['5 videos, 35–45 sec each', 'Photos and text can vary', '1 sample to approve first', '1 revision round for all\u00a05', {text: '1 video format, same for all\u00a05', info: 'formats-dialog'}, 'All 5 delivered before launch'], cta: 'Launch My Campaign'},
]

export const NOT_SURE = {slug: 'not-sure', name: 'Not sure yet'}

// Packages that need an organization name on the form.
export const ORG_ONLY_NAMES = PACKAGES.filter(p => p.orgOnly).map(p => p.name)

// Every package name the form may send (used to validate submissions).
export const PACKAGE_NAMES = [...PACKAGES, NOT_SURE].map(p => p.name)

export const formatPrice = dollars => '$' + dollars.toLocaleString('en-US')

export const packageByName = name => PACKAGES.find(p => p.name === name) || null

export const packageBySlug = slug => [...PACKAGES, NOT_SURE].find(p => p.slug === slug) || null

// Extra formats chosen at checkout: the extra-orientation add-on price, per format, for every video in the package.
export const EXTRA_FORMAT_PRICE = addonByKey('orientation').price
export const extraFormatsCost = (pkg, count) => (pkg?.price ? count * EXTRA_FORMAT_PRICE * (pkg.videos || 1) : 0)

// Other extras offered on Review & pay (formats are picked under Orientation). Priced ones are per video;
// the rest are quoted by the team before anything is charged.
export const CHECKOUT_EXTRAS = ADDONS.filter(a => a.key !== 'orientation')
export const checkoutExtrasCost = (pkg, keys = []) =>
  pkg?.price ? CHECKOUT_EXTRAS.filter(a => keys.includes(a.key) && a.price != null).reduce((s, a) => s + a.price * (pkg.videos || 1), 0) : 0
