// The three Mint 35 packages, shared by the homepage and the Start page.
export const PACKAGES = [
  {slug: 'single-35', name: 'Single 35', blurb: 'One commercial, one message.', items: ['1 commercial, 30–60 sec', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round'], cta: 'Start My Commercial'},
  {slug: 'campaign-3', name: 'Campaign 3', featured: true, blurb: 'Three spots around one campaign.', items: ['3 commercials', 'Shared look, different hooks', {text: '1 platform export', info: 'formats-dialog'}, '1 revision round each'], cta: 'Build My Campaign'},
  {slug: 'online-campaign', name: 'Online Campaign', blurb: 'A milestone video for every stage of your online campaign.', milestones: ['Live Now', '25%', '50%', '75%', 'We Made It!'], items: ['5 milestone videos, 35 sec each', '1 sample video to approve', 'All 5 follow the approved look', {text: '1 platform export for all 5', info: 'formats-dialog'}], cta: 'Launch My Campaign'},
]

export const NOT_SURE = {slug: 'not-sure', name: 'Not sure yet'}

// Every package name the form may send (used to validate submissions).
export const PACKAGE_NAMES = [...PACKAGES, NOT_SURE].map(p => p.name)

export const packageBySlug = slug => [...PACKAGES, NOT_SURE].find(p => p.slug === slug) || null
