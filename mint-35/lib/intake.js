// Choices used by the order form, the intake API and the admin job page. The first entry of each
// "let us pick" list is the default the form pre-selects.

export const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Rabbi', 'Dr.', 'Other']

// Text and WhatsApp are not offered yet (the form sends 'email'); kept so old orders still show their choice.
export const ALERTS = [
  {value: 'sms', label: 'Text', icon: 'text'},
  {value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp'},
  {value: 'email', label: 'Email only', icon: 'mail'},
]

export const STYLES = [
  {value: 'pick', label: 'Let Mint 35 pick', hint: 'We’ll choose what fits your message best.'},
  {value: 'own', label: 'My own photos and videos only', hint: 'We build the video from your footage and images.'},
  {value: 'realistic', label: 'AI realistic characters', hint: 'Lifelike people (not look-alikes of real people).', sample: 'ImL5bp028ns'},
  {value: 'animated', label: '3D animated characters', hint: 'Cartoon-style 3D people.', sample: 'K2B9m_QTuGA'},
  {value: 'text', label: 'Animated graphics & text', hint: 'Motion graphics and bold text, no characters.'},
]

export const STORY = [
  {value: 'pick', label: 'Let Mint 35 decide'},
  {value: 'text', label: 'On-screen text only'},
  {value: 'narration_text', label: 'Narration + key text on screen'},
  {value: 'narration', label: 'Narration only'},
]

export const VOICES = [
  {value: 'pick', label: 'Let Mint 35 pick'},
  {value: 'male', label: 'Male'},
  {value: 'female', label: 'Female'},
]

export const TONES = [
  {value: 'pick', label: 'Let Mint 35 pick'},
  ...['Strong', 'Energetic', 'Warm', 'Calm', 'Upbeat', 'Serious'].map(t => ({value: t.toLowerCase(), label: t})),
]

export const MUSIC = [
  {value: 'pick', label: 'Let Mint 35 pick'},
  ...['Upbeat', 'Inspiring', 'Dramatic', 'Calm', 'Fun'].map(t => ({value: t.toLowerCase(), label: t})),
]

// File kinds a customer can upload, and whether they belong to the whole order or one video.
export const UPLOAD_KINDS = {
  logo: {label: 'Main logo', shared: true},
  brand_material: {label: 'Brand material', shared: true},
  design_file: {label: 'Open design file', shared: true},
  media: {label: 'Photo / video / graphic to use', shared: false},
  reference: {label: 'Character reference photo', shared: false},
  tax_exempt: {label: 'Tax-exempt certificate', shared: true},
}

export const labelOf = (list, value) => list.find(o => o.value === value)?.label || value || ''

// The key points a customer ticks before accepting the AI Production Disclaimer.
export const DISCLAIMER_POINTS = [
  'AI results can vary and may include imperfections.',
  'Customization isn’t included. One round of revisions covers basic changes, and Mint Media determines what counts as basic.',
  'Mint Media decides which changes can reasonably be made.',
]

// Billing address states (US only). Sales tax applies only to New Jersey billing addresses (lib/tax.js).
export const US_STATES = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
]

// Largest file a client can upload (order form and project page). 50 MB is Supabase's default per-file limit;
// the owner prefers clients share bigger footage from their own Google Drive or Dropbox (Oct 25).
export const MAX_UPLOAD_MB = 50
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
export const formatSize = b => (b >= 1024 * 1024 * 1024 ? `${(b / 1024 ** 3).toFixed(1)} GB`
  : b >= 1024 * 1024 ? `${(b / 1024 ** 2).toFixed(b >= 10 * 1024 ** 2 ? 0 : 1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
