// Keeps the files a customer picked on the order form in their own browser (IndexedDB), so a reload
// doesn't lose them. Nothing leaves the device until the order is submitted. Saved files are dropped
// after submitting, or after 14 days.
const DB = 'mint35-files'
const STORE = 'stash'
const MAX_AGE = 14 * 24 * 60 * 60 * 1000
const MAX_FILE = 300 * 1024 * 1024 // very large videos are skipped (they'd need picking again)

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run(mode, fn) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => { db.close(); resolve(req?.result) }
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error) }
  })
}

// Returns {fieldName: File[]} saved for this form, or {}.
export async function loadFiles(key) {
  try {
    const rec = await run('readonly', s => s.get(key))
    if (!rec || Date.now() - rec.at > MAX_AGE) return {}
    return rec.fields || {}
  } catch { return {} }
}

// Saves (or, with an empty list, forgets) the files chosen in one field.
export async function saveFiles(key, field, files) {
  try {
    const rec = (await run('readonly', s => s.get(key))) || {fields: {}}
    const keep = [...files].filter(f => f.size <= MAX_FILE)
    if (keep.length) rec.fields[field] = keep
    else delete rec.fields[field]
    rec.at = Date.now()
    await run('readwrite', s => Object.keys(rec.fields).length ? s.put(rec, key) : s.delete(key))
  } catch {}
}

export async function clearFiles(key) {
  try { await run('readwrite', s => s.delete(key)) } catch {}
}
