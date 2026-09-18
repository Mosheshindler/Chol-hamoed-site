'use client'
import {useRouter} from 'next/navigation'

// Goes back to wherever the visitor actually came from (category page, search results,
// homepage, etc.) instead of a hardcoded destination. Falls back to the homepage if there's
// no page to go back to (e.g. the watch page was opened directly in a new tab).
export default function BackButton(){
  const router=useRouter()
  function goBack(){
    if(typeof window!=='undefined' && window.history.length>1) router.back()
    else router.push('/')
  }
  return <button type="button" className="ghost btn watchBackBtn" onClick={goBack}>← Back</button>
}
