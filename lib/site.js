export const SITE_LINKS={
  newsletter:'https://mailchi.mp/bfbaca4e33f3/mint-media-newsletter-sign-up',
  website:'https://mintmediallc.com/home/',
  youtube:'https://www.youtube.com/channel/UC--cmMC2hDngoYXYnqpasEQ/feed?view_as=public',
  vimeo:'https://vimeo.com/mintmediavideo',
  instagram:'https://www.instagram.com/mint_media_llc/',
  whatsapp:'https://us.list-manage.com/PNkKxpwYW4e?e=62f224f32e&c2id=dac1993af6d35d622563f4772a6c21d2&m=3hu36aQULLjmb2MWMkayqHpcckltW6xVoyCgZKpEHnJ690DgByYdDQDuE1S9',
  email:'info@mintmediallc.com',
  phone:'732-813-4222'
}
export const CATEGORIES=['Stories','Documentaries','Entertainment','Music Videos','Q&A','Behind the Scenes','Events & Highlights','Shorts','Premium Content']
export const ALL_CATEGORIES=['All Videos',...CATEGORIES]
export const categorySlug=(c)=>c==='Q&A'?'q-and-a':c.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
