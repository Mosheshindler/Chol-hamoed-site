import Image from 'next/image'
import Link from 'next/link'

export default function VideoCard({video}){
  return (
    <article className="card">
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="cardImage">
        <Image src={video.image} alt={video.title} width={300} height={410} sizes="(max-width:640px) 50vw, 240px"/>
        {video.isNew && <span className="badge">New</span>}
      </a>
      <div className="cardBody">
        <h3>{video.title}</h3>
        <p className="cardPeople">{video.people.join(' · ')}</p>
        <div className="cardActions">
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn btnYellow btnSmall">
            {video.price ? `Get it · ${video.price}` : 'Get it'}
          </a>
          {video.page && <Link href={video.page} className="cardMore">More →</Link>}
        </div>
      </div>
    </article>
  )
}
