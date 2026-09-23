'use client'
import {sendGAEvent} from '@next/third-parties/google'

export default function MostlyMusicButton({video}){
  return <a className="yidlyPurchaseBtn" href={video.purchaseUrl} target="_blank" rel="noopener noreferrer" onClick={()=>sendGAEvent('event','mostly_music_click',{video_title:video.title,video_slug:video.slug})}>WATCH THE FULL VIDEO <span>→</span></a>
}
