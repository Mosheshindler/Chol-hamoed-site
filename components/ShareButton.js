'use client'
import {useState} from 'react'
export default function ShareButton(){const [copied,setCopied]=useState(false);async function share(){const url=window.location.href;try{if(navigator.share){await navigator.share({title:document.title,url})}else{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1500)}}catch{}}return <button className="ghost btn shareOnly" onClick={share}>{copied?'✓ Link Copied':'↗ Share'}</button>}
