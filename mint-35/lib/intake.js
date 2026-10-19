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
}

export const labelOf = (list, value) => list.find(o => o.value === value)?.label || value || ''

// The key points a customer ticks before accepting the AI Production Disclaimer.
export const DISCLAIMER_POINTS = [
  'AI results can vary and may include imperfections.',
  'Customization isn’t included. One round of revisions covers basic changes, and Mint Media determines what counts as basic.',
  'Mint Media decides which changes can reasonably be made.',
]
