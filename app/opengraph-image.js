import {ImageResponse} from 'next/og'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {getVideos,getCategoryOrder,sortByPublishDate} from '../lib/data'

export const size={width:1200,height:630}
export const contentType='image/png'
export const alt='Entertain-Mint — Watch Stories, Documentaries & More'

// Same selection logic as the homepage itself (app/page.js) — kept as its own copy since
// this file is its own isolated route handler, not something the page component can share
// a function with directly.
function getHeroVideos(videos,heroOrder){
  const heroFeatured=sortByPublishDate(videos.filter(v=>v.featured))
  return [...heroFeatured].sort((a,b)=>{
    const ao=a.id in heroOrder?heroOrder[a.id]:Infinity
    const bo=b.id in heroOrder?heroOrder[b.id]:Infinity
    return ao-bo
  }).slice(0,8)
}

export default async function Image(){
  const [videos,heroOrder,logoBuffer]=await Promise.all([
    getVideos(),
    getCategoryOrder('hero-carousel'),
    readFile(path.join(process.cwd(),'public/assets/entertain-mint-logo-og.png'))
  ])
  const top=getHeroVideos(videos,heroOrder)[0]
  const bg=top?.heroImage?.trim()||top?.thumbnail?.trim()||''
  const logoSrc=`data:image/png;base64,${logoBuffer.toString('base64')}`
  const eyebrow=top?(top.premium?'PREMIUM CONTENT':(top.categories?.[0]||top.category||'')):''
  const title=(top?.title||'Watch Stories, Documentaries & More').slice(0,90)

  return new ImageResponse(
    (
      <div style={{
        height:'100%',width:'100%',display:'flex',position:'relative',
        backgroundColor:'#050d0a',
        ...(bg?{backgroundImage:`url(${bg})`,backgroundSize:'cover',backgroundPosition:'center'}:{})
      }}>
        <div style={{
          position:'absolute',inset:0,display:'flex',
          background:'linear-gradient(100deg, rgba(2,7,6,0.97) 0%, rgba(2,7,6,0.82) 40%, rgba(2,7,6,0.35) 75%, rgba(2,7,6,0.15) 100%)'
        }}/>
        {/* satori (the renderer behind ImageResponse) needs an explicit numeric height —
            unlike a real browser, it can't resolve `height:'auto'` from the image's own
            aspect ratio, so the logo silently rendered as a zero-height box without this. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={280} height={42} style={{position:'absolute',top:56,left:64}}/>
        <div style={{position:'relative',display:'flex',flexDirection:'column',justifyContent:'flex-end',height:'100%',width:'100%',padding:'0 64px 64px'}}>
          {eyebrow&&<div style={{
            display:'flex',color:'#88C040',fontSize:26,fontWeight:700,letterSpacing:4,marginBottom:18,
            textTransform:'uppercase'
          }}>{eyebrow}</div>}
          <div style={{display:'flex',color:'#ffffff',fontSize:60,fontWeight:800,lineHeight:1.1,width:880}}>{title}</div>
        </div>
      </div>
    ),
    {...size}
  )
}
