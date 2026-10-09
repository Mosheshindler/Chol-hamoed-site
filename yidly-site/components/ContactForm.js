'use client'
import {useState} from 'react'
import {LINKS} from '../lib/site'

export default function ContactForm(){
  const [status,setStatus]=useState('idle')
  async function onSubmit(e){
    e.preventDefault()
    setStatus('sending')
    const data=Object.fromEntries(new FormData(e.currentTarget))
    try{
      const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      setStatus(res.ok?'sent':'error')
    }catch{setStatus('error')}
  }
  if(status==='sent') return <p className="formNote">Thanks! We got your message and will get back to you soon.</p>
  return (
    <form className="contactForm" onSubmit={onSubmit}>
      <label>Name<input name="name" required autoComplete="name"/></label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel"/></label>
      <label>Email<input name="email" type="email" required autoComplete="email"/></label>
      <label>Message<textarea name="message" rows={4} required/></label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="srOnly" aria-hidden="true"/>
      <button type="submit" className="btn btnYellow" disabled={status==='sending'}>{status==='sending'?'Sending…':'Send Message'}</button>
      {status==='error' && <p className="formNote">Sorry, that didn&apos;t go through. Please email us at <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>.</p>}
    </form>
  )
}
