// Files clients send (logos, photos, videos, graphics) are deleted this many days after a job is
// marked Delivered (owner, Oct 26). Deliverables (script, cuts, final, extras), tax-exempt
// certificates and team-only files are kept. Runs daily from /api/cron/delete-files.
export const CLIENT_FILE_DAYS = 7
export const CLIENT_FILE_KINDS = ['logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference']

// How long the client's project page promises their final videos (owner, Oct 26). Not enforced by code.
export const FINAL_AVAILABLE_DAYS = 60

export const addDays = (at, days) => new Date(new Date(at).getTime() + days * 864e5)
