import { site } from '@/config/site'
import { useScrolledPast } from '@/hooks/useScrolledPast'

/** Overlay nav — ivory on teal hero, frosted bar once scrolled. */
export function SiteHeader() {
  const condensed = useScrolledPast(40)

  return (
    <header
      className={`relative z-40 transition-[background-color,backdrop-filter,border-color,padding,color] duration-500 ${
        condensed
          ? 'border-b border-espresso/10 bg-cream/94 py-3 text-espresso backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent py-5 text-cream'
      }`}
    >
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 md:px-8">
        <a href="#home" className="shrink-0 leading-none">
          <span className="font-display block text-2xl tracking-[0.04em] md:text-[26px]">
            {site.brand.name}
          </span>
          {site.brand.sub ? (
            <span
              className={`mt-1 block text-[9px] tracking-[0.42em] uppercase ${
                condensed ? 'text-mocha' : 'text-gold-light'
              }`}
            >
              {site.brand.sub}
            </span>
          ) : null}
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {site.nav.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`group relative text-[12px] tracking-[0.14em] uppercase transition-colors ${
                condensed
                  ? index === 0
                    ? 'text-espresso'
                    : 'text-espresso/55 hover:text-espresso'
                  : index === 0
                    ? 'text-cream'
                    : 'text-cream/60 hover:text-cream'
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-400 ${
                  index === 0 ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            aria-label="Search"
            className={`grid size-9 place-items-center rounded-full border transition-colors ${
              condensed
                ? 'border-espresso/15 text-espresso/70 hover:border-gold hover:text-espresso'
                : 'border-cream/25 text-cream/75 hover:border-gold hover:text-gold-light'
            }`}
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.2 13.2 3.3 3.3" strokeLinecap="round" />
            </svg>
          </button>

          <a
            href="#collection"
            className="group relative overflow-hidden rounded-full border border-gold/60 bg-gradient-to-r from-gold-light to-gold px-5 py-2.5 text-[11px] tracking-[0.18em] whitespace-nowrap text-espresso uppercase shadow-[0_10px_30px_-12px_rgba(212,175,55,0.85)] transition-transform duration-400 hover:-translate-y-0.5 md:px-7"
          >
            <span className="relative z-10">Shop the house</span>
            <span className="absolute inset-0 -translate-x-full bg-cream/45 transition-transform duration-600 group-hover:translate-x-0" />
          </a>
        </div>
      </div>
    </header>
  )
}
