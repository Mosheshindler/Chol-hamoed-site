const clean=(v,max)=>String(v||'').trim().slice(0,max)
const escape=(s)=>s.replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))

export async function POST(req){
  let body
  try{body=await req.json()}catch{return Response.json({error:'Bad request'},{status:400})}
  // Honeypot: bots fill every field, people never see this one.
  if(body.website) return Response.json({ok:true})

  const name=clean(body.name,120), email=clean(body.email,200), phone=clean(body.phone,40), message=clean(body.message,5000)
  if(!name||!email||!message||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return Response.json({error:'Please fill in your name, email and message.'},{status:400})
  }

  const key=process.env.RESEND_API_KEY
  if(!key) return Response.json({error:'Contact form is not configured yet.'},{status:503})

  const res=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      from:process.env.CONTACT_FROM||'Yidly Website <website@yidly.co>',
      to:[process.env.CONTACT_TO||'info@yidly.co'],
      reply_to:email,
      subject:`Yidly website message from ${name}`,
      html:`<p><b>Name:</b> ${escape(name)}<br/><b>Email:</b> ${escape(email)}<br/><b>Phone:</b> ${escape(phone)||'-'}</p><p>${escape(message).replace(/\n/g,'<br/>')}</p>`,
    }),
  })
  if(!res.ok) return Response.json({error:'Could not send message.'},{status:502})
  return Response.json({ok:true})
}
