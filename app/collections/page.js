import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SignupCTA from '../../components/SignupCTA'
import Link from 'next/link'
const collections=[
  ['All Videos','Browse the complete library','/category/all-videos','all-videos'],
  ['Stories','Human stories and meaningful moments','/category/stories','stories'],
  ['Documentaries','Longer-form films and profiles','/category/documentaries','documentaries'],
  ['Entertainment','Entertaining films and original content','/category/entertainment','entertainment'],
  ['Music Videos','Music videos and performances','/category/music-videos','music-videos'],
  ['Q&A','Questions, answers and conversations','/category/q-and-a','q-and-a'],
  ['Behind the Scenes','Go inside Mint Media productions','/category/behind-the-scenes','behind-the-scenes'],
  ['Events & Highlights','Event films, openers, and highlights','/category/events-and-highlights','events-and-highlights'],
  ['Shorts','Quick videos and short-form content','/category/shorts','shorts'],
  ['Premium Content','Yidly premium productions and previews','/category/premium-content','premium-content']
]
export default function Collections(){return <><Header/><main className="container simplePage"><div className="simpleHero"><span className="eyebrow">CURATED BY MINT</span><h1>Collections</h1><p>Explore the Mint Media library by type and viewing experience.</p></div><div className="collectionGrid collectionGridAll">{collections.map(([title,copy,href,icon])=><Link className="collectionTile" href={href} key={title}><img className="collectionIcon" src={`/assets/category-icons-svg/${icon}.svg`} alt=""/><div><strong>{title}</strong><span>{copy}</span></div><b>Explore →</b></Link>)}</div><SignupCTA/></main><Footer/></>}
