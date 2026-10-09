// The Yidly catalog. Every video is sold on Mostly Music; `url` is its product page.
// Newest first — the first entry is what the homepage features.
export const GADGET_GUY={
  slug:'the-gadget-guy',
  title:'The Gadget Guy',
  credit:'A story by Meir Ben-Dayan',
  presentedBy:'Yidly & Ziv Studios',
  // TODO: replace with the Mostly Music product page once it's live.
  url:'https://mostlymusic.com/search?q=gadget+guy',
  image:'/images/gadget-guy/poster-card.jpg',
  runTime:'1:24',
  ages:'9+',
  isNew:true,
  // TODO: Vimeo ID of the trailer, e.g. '1037619120'. Leave null to show "Trailer coming soon".
  trailerVimeoId:null,
  synopsis:[
    'Gershy has always been the gadget guy. His inventions are incredible, but everything he builds seems to be about him. Then he creates something no one else in the world has managed, and a ruthless villain will stop at nothing to take it. With his new neighbor Nachi dragged along for the ride, Gershy is swept into a night of drones, traps, and heart-pounding chases.',
    'But this adventure is about more than gadgets. As the stakes rise, Gershy has to face a question that’s bigger than any invention: who is he when it really counts, and what is his talent for? It’s a story about friendship, growing beyond yourself, and discovering that true greatness is measured by what you give, not what you have.',
  ],
}

export const VIDEOS=[
  {
    slug:GADGET_GUY.slug,
    title:GADGET_GUY.title,
    people:['Meir Ben-Dayan'],
    price:null,
    url:GADGET_GUY.url,
    image:GADGET_GUY.image,
    isNew:true,
    page:'/gadget-guy',
  },
  {
    slug:'musical-challenge-episode-2',
    title:'Musical Challenge Episode 2',
    people:['Joey Newcomb'],
    price:'$21.99',
    url:'https://mostlymusic.com/products/yidly-musical-challenge-episode-2-interactive-video',
    image:'/images/videos/musical-challenge-2.jpg',
  },
  {
    slug:'chanukah-gameshow',
    title:'Chanukah Gameshow',
    people:['Boruch Perlowitz'],
    price:'$24.99',
    url:'https://mostlymusic.com/products/yidly-chanukah-gameshow-interactive-video',
    image:'/images/videos/chanukah-gameshow.jpg',
  },
  {
    slug:'musical-challenge',
    title:'Musical Challenge',
    people:['Joey Newcomb'],
    price:'$21.99',
    url:'https://mostlymusic.com/products/yidly-musical-challenge-interactive-video',
    image:'/images/videos/musical-challenge.jpg',
  },
  {
    slug:'musical-challenge-junior',
    title:'Musical Challenge Junior',
    people:['Joey Newcomb'],
    price:'$14.99',
    url:'https://mostlymusic.com/products/yidly-musical-challenge-junior-interactive-video',
    image:'/images/videos/musical-challenge-jr.jpg',
  },
  {
    slug:'buried-treasure',
    title:'Buried Treasure',
    people:['Rabbi Yoel Ferber'],
    price:'$14.99',
    url:'https://mostlymusic.com/products/rabbi-yoel-ferber-buried-treasure-video',
    image:'/images/videos/buried-treasure.jpg',
  },
  {
    slug:'the-chanukah-program',
    title:'The Chanukah Program',
    people:['Boruch Perlowitz','Rabbi Yechiel Spero','Rabbi Yoel Ferber'],
    price:'$39.99',
    url:'https://mostlymusic.com/products/yidly-the-chanukah-program-interactive-video',
    image:'/images/videos/chanukah-program.jpg',
  },
]
