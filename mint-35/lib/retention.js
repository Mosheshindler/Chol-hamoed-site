// Files clients send (logos, photos, videos, graphics) are deleted this many days after a job is
// marked Delivered (owner, Oct 26). Deliverables (script, cuts, final, extras), tax-exempt
// certificates and team-only files are kept. Runs daily from /api/cron/delete-files.
export const CLIENT_FILE_DAYS = 7
export const CLIENT_FILE_KINDS = ['logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference']

export const deleteDate = deliveredAt => new Date(new Date(deliveredAt).getTime() + CLIENT_FILE_DAYS * 864e5)
