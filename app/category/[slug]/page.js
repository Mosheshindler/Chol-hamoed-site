import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import SignupCTA from '../../../components/SignupCTA'
import CategoryBrowser from '../../../components/CategoryBrowser'
import {getVideos} from '../../../lib/data'

export default async function CategoryPage({params,searchParams}){
  const {slug:resolvedSlug}=await params
  const resolvedSearch=await searchParams
  const slug=resolvedSlug||'stories'
  const name=slug.split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ').replace('And','&')
  const videos=await getVideos()
  const initialQuery=typeof resolvedSearch?.q==='string'?resolvedSearch.q:''
  const autoFocus=resolvedSearch?.focus==='1'
  return <><Header/><main className="container"><CategoryBrowser slug={slug} name={name} videos={videos} initialQuery={initialQuery} autoFocus={autoFocus}/><SignupCTA/></main><Footer/></>
}
