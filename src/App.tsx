import {
  AnnouncementBar,
  CollectionSection,
  IngredientsSection,
  Marquee,
  RitualSection,
  SiteFooter,
  SplashScroll,
} from '@/components/site'

export default function App() {
  return (
    <div className="min-h-screen bg-cream text-espresso antialiased selection:bg-gold/40">
      <div className="fixed inset-x-0 top-0 z-50">
        <AnnouncementBar />
      </div>

      <main>
        <SplashScroll />
        <Marquee />
        <CollectionSection />
        <IngredientsSection />
        <RitualSection />
      </main>
      <SiteFooter />
    </div>
  )
}
