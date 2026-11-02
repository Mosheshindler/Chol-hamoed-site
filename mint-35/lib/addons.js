// Extras customers can request from their project page at any stage, from ordering to delivery.
// Set `price` (dollars) to show a price; null shows "Custom quote" and the team prices it when confirming.
export const ADDONS = [
  {key: 'orientation', label: 'Extra format', desc: 'The same video in another shape, like 1:1 or 16:9.', pitch: 'Run it everywhere: Reels, feeds, YouTube and screens.', price: 450, perVideo: true, askOrientation: true},
  {key: 'cutdown', label: '15-second cutdown', desc: 'A short version for ads and Reels.', pitch: 'A punchy 15-second version for ads, Stories and Reels.', price: 175, perVideo: true},
  {key: 'captions', label: 'Subtitles', desc: 'Full burned-in subtitles for sound-off viewing.', pitch: 'Most social video is watched on mute. Subtitles keep people watching.', price: 150, perVideo: true},
  {key: 'revision', label: 'Extra revision round', desc: 'Another round of changes. We quote based on the changes you need.', pitch: 'Want another pass? Add a round of changes.', price: null},
  {key: 'rush', label: 'Rush delivery', desc: 'Move your project up in our queue. We quote based on the current queue.', pitch: 'Need it sooner? Move up in our queue.', price: null},
]

export const ADDON_STATUSES = ['submitted', 'quoted', 'card_saved', 'in_progress', 'script_sent', 'in_production', 'first_cut_sent', 'approved', 'revising', 'delivered']

export const addonByKey = key => ADDONS.find(a => a.key === key) || null
