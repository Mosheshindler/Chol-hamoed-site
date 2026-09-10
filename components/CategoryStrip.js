import Link from 'next/link'
import {categorySlug} from '../lib/site'
export default function CategoryStrip({categories}){
  return <div className="categoryScroller"><div className="categoryGrid lockedCategoryGrid">{categories.map(c=>{let slug=categorySlug(c); if(c==='Q&A') slug='q-and-a'; return <Link href={`/category/${slug}`} className="cat lockedCat" key={c}><div className="catIcon lockedCatIcon"><img src={`/assets/category-icons-svg/${slug}.svg`} alt=""/></div><span>{c}</span></Link>})}</div></div>
}
