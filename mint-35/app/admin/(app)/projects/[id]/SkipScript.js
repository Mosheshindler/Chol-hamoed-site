'use client'

import {useTransition} from 'react'
import {skipScriptStep, addScriptStep} from '../../../actions'

// Momentum jobs start with a script, then a sample video. `mode` 'skip' lets the team go straight to the sample
// video; 'add' gives an older (sample-only) Momentum job a script step first.
export default function SkipScript({id, mode = 'skip'}) {
  const [pending, start] = useTransition()
  const add = mode === 'add'
  return (
    <p className="muted small skip-script">
      {add ? 'Momentum Pack: this job approves only a sample video.' : 'Momentum Pack: the client approves a script, then a sample video.'}{' '}
      <button type="button" className="link-btn" disabled={pending} onClick={() => {
        if (!confirm(add ? 'Add a script for the client to approve before the sample video?' : 'Skip the script and go straight to the sample video?')) return
        start(async () => { const fd = new FormData(); fd.set('id', id); await (add ? addScriptStep(fd) : skipScriptStep(fd)) })
      }}>{pending ? 'Saving…' : add ? 'Add a script step' : 'Skip the script for this job'}</button>
    </p>
  )
}
