// Work shown on the homepage, in display order, as one swipeable row (components/WorkStrip.js). Add real projects only.
// `id` is the YouTube video id (from youtu.be/<id> or youtube.com/shorts/<id>); `kind` is the style it shows;
// `vertical: true` for Shorts (9:16).
// A Momentum Pack shows as a series (owner, Nov 25): one card holding its milestone videos. `milestone` must be one of the
// Momentum Pack's milestones in lib/packages.js.
export const WORK = [
  {id: 'K2B9m_QTuGA', title: 'AllFit', kind: '3D animated characters'},
  {id: 'T8xA5fHuLlU', title: 'Agudah: Go Vote', kind: 'AI realistic characters', vertical: true},
  {
    series: true,
    title: 'Orlando Torah Academy',
    kind: 'Momentum Pack series',
    videos: [
      {id: 't5hypa-rZT0', milestone: 'Live', label: 'Campaign launch'},
      {id: '-cZfgsGZOPA', milestone: 'We made it!', label: 'Goal reached'},
    ],
  },
  {id: 'ImL5bp028ns', title: 'Due 5', kind: 'AI realistic characters'},
  {id: 'Bswpp6_FOuo', title: 'Khal Hampshire Hills', kind: 'Your own photos & videos', vertical: true},
]
