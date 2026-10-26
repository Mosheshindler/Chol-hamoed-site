// File retention (owner, Oct 26), run daily by /api/cron/delete-files:
// - Files clients send (logos, photos, videos, graphics) are deleted once the job has been Delivered for
//   CLIENT_FILE_DAYS and the file itself is that old (so something added after delivery still gets a week).
// - Deliverables uploaded to Mint 35 (script, cuts, final, extras) are deleted FINAL_DELETE_DAYS after delivery.
//   Clients are told FINAL_AVAILABLE_DAYS (owner: say 60, remove at 90). Shared links (Drive, Docs) aren't touched.
// Tax-exempt certificates and team-only files are kept.
export const CLIENT_FILE_DAYS = 7
export const CLIENT_FILE_KINDS = ['logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference']
export const FINAL_AVAILABLE_DAYS = 60
export const FINAL_DELETE_DAYS = 90
export const DELIVERABLE_KINDS = ['script', 'first_cut', 'final', 'cutdown', 'extra_format']

// The clock starts when the final is shared (the job's move to Delivered). Jobs delivered before retention
// went live (e.g. Agudah) count from this date instead, so nothing is removed sooner than promised.
export const RETENTION_START = '2026-10-26T12:00:00Z'

export const addDays = (at, days) => new Date(new Date(at).getTime() + days * 864e5)
