export const site = {
  brand: {
    name: 'ORRIS',
    sub: '',
    tagline: 'Cream House · Quiet Skin Rituals',
  },
  announcements: [
    'Complimentary shipping over $55',
    'Formulated for quiet skin, daily',
    'Meet every note before you buy',
  ],
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'The Ritual', href: '#ritual' },
    { label: 'Ingredients', href: '#ingredients' },
    { label: 'Shop', href: '#collection' },
  ],
  hero: {
    eyebrow: 'Cream House',
    headline: ['Creams that', 'open into ritual'],
    body: 'Scroll the jar open. Meet what melts in. Feel the finish before you buy.',
    primaryCta: 'Begin the ritual',
    aside: {
      label: 'Inside the jar',
      title: 'Formulated for quiet skin',
      body: 'Four actives do the heavy lifting — the rest is texture, scent, and the way it disappears.',
      cta: 'Shop the house',
    },
    slides: ['Daily Veil', 'Night Balm', 'Body Silk', 'The Ritual'],
  },
  marquee: [
    'Squalane',
    'Shea Butter',
    'Centella',
    'Niacinamide',
    'Whipped',
    'Melting',
    'Settled',
  ],
  collection: {
    eyebrow: 'The cream house',
    title: 'Choose your ritual',
    body: 'Three textures. One house. Built for daily softness.',
    items: [
      {
        name: 'Daily Veil',
        origin: '50 ml',
        note: 'A light morning cream with a satin finish.',
        price: '$48',
        image: '/daily-veil.png',
        imageFit: 'cover' as 'cover' | 'contain',
        imagePosition: 'center',
      },
      {
        name: 'Night Balm',
        origin: '50 ml',
        note: 'Overnight repair with a whipped texture.',
        price: '$58',
        image: '/night-balm.png?v=10',
        imageFit: 'cover' as 'cover' | 'contain',
        /** Frame the jar in-center without a zoomed crop. */
        imagePosition: '50% 36%',
      },
      {
        name: 'Body Silk',
        origin: '200 ml',
        note: 'From elbows to ankles — one slow glide.',
        price: '$42',
        image: '/body-silk.png?v=9',
        imageFit: 'cover' as 'cover' | 'contain',
        imagePosition: '50% 58%',
      },
    ],
  },
  ritual: {
    eyebrow: 'The experience',
    title: 'From cloud to calm in three beats',
    body: 'One slow scroll lifts the lid and reveals the whip. Key ingredients arrive before the purchase decision.',
    steps: [
      {
        title: 'Open the cream',
        body: 'One slow scroll lifts the lid and reveals the whip.',
      },
      {
        title: 'See what melts in',
        body: 'Rich texture rises as the formula comes into view.',
      },
      {
        title: 'Know every note',
        body: 'Key ingredients arrive before the purchase decision.',
      },
      {
        title: 'Feel the finish',
        body: 'Skin looks calm, never shiny or tight — settled softness.',
      },
    ],
  },
  ingredients: [
    {
      name: 'Squalane',
      note: 'Locks in moisture without heaviness',
    },
    {
      name: 'Shea Butter',
      note: 'Cushiony richness that melts on contact',
    },
    {
      name: 'Centella',
      note: 'Calms redness and softens the barrier',
    },
    {
      name: 'Niacinamide',
      note: 'Evens tone while the cream settles',
    },
  ],
  stats: [
    { value: '4', label: 'Key actives' },
    { value: '50ml', label: 'House size' },
    { value: '3', label: 'Textures' },
  ],
  footer: {
    columns: [
      {
        title: 'Shop',
        links: ['Daily Veil', 'Night Balm', 'Body Silk', 'Gift Sets'],
      },
      {
        title: 'House',
        links: ['Our Story', 'Ingredients', 'The Ritual', 'Journal'],
      },
      {
        title: 'Support',
        links: ['Shipping', 'Returns', 'Contact', 'FAQ'],
      },
    ],
    note: 'Cream house for skin that wants quiet luxury.',
  },
}
