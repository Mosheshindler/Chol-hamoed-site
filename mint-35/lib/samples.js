// Work shown on the homepage. `id` is the YouTube video id (from youtu.be/<id> or youtube.com/shorts/<id>); `kind` is the
// style it shows. `vertical: true` for Shorts (9:16); they sit in their own row under the wide videos. Add real projects only.
export const SAMPLES = [
  {id: 'K2B9m_QTuGA', title: 'AllFit', kind: '3D animated characters'},
  {id: 'ImL5bp028ns', title: 'Due 5', kind: 'AI realistic characters'},
  {id: 'T8xA5fHuLlU', title: 'Agudah: Go Vote', kind: 'AI realistic characters', vertical: true},
  {id: 'Bswpp6_FOuo', title: 'Khal Hampshire Hills', kind: 'Your own photos & videos', vertical: true},
]

// A Momentum Pack shown as a series (owner, Nov 25): one production, a video per campaign milestone. `milestone` must be one of
// the Momentum Pack's milestones in lib/packages.js; the card lists all of them and marks the ones shown here.
export const SERIES = [
  {
    title: 'Orlando Torah Academy',
    kind: 'Momentum Pack',
    videos: [
      {id: 't5hypa-rZT0', milestone: 'Live', label: 'Campaign launch'},
      {id: '-cZfgsGZOPA', milestone: 'We made it!', label: 'Goal reached'},
    ],
  },
]
