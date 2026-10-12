// Extras customers can request from their project page once a video is approved.
// Set `price` (dollars) to show a price; null shows "Price confirmed by our team".
export const ADDONS = [
  {key: 'orientation', label: 'Extra orientation', desc: 'The same video in another shape, like 1:1 or 16:9.', price: null, perVideo: true, askOrientation: true},
  {key: 'cutdown', label: '15-second cutdown', desc: 'A short version for ads and stories.', price: null, perVideo: true},
  {key: 'captions', label: 'Captions', desc: 'Burned-in captions for sound-off viewing.', price: null, perVideo: true},
  {key: 'revision', label: 'Extra revision round', desc: 'Another round of changes.', price: null},
  {key: 'rush', label: 'Rush delivery', desc: 'Move your next project up in our queue.', price: null},
]

export const ADDON_STATUSES = ['approved', 'delivered']

export const addonByKey = key => ADDONS.find(a => a.key === key) || null
