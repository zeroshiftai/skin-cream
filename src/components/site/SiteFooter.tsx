import { Reveal } from '@/components/motion'
import { site } from '@/config/site'

export function SiteFooter() {
  return (
    <footer
      id="journal"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#0d5c6b_0%,#062f38_100%)] px-5 pt-20 pb-10 text-cream md:px-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 size-[400px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px]">
        <Reveal duration={0.9}>
          <div className="flex flex-col gap-10 border-b border-cream/12 pb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="font-display block text-[clamp(2.6rem,6vw,4.6rem)] leading-none font-light tracking-[0.02em] text-cream">
                {site.brand.name}
              </span>
              <span className="mt-3 block text-[10px] tracking-[0.44em] text-gold-light uppercase">
                {site.brand.tagline}
              </span>
            </div>

            <form
              className="flex w-full max-w-sm items-center gap-2 border-b border-cream/25 pb-3"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email"
                aria-label="Email address"
                className="w-full bg-transparent text-[13px] text-cream placeholder:text-cream/40 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 text-[10px] tracking-[0.24em] text-gold-light uppercase transition-colors hover:text-gold"
              >
                Subscribe
              </button>
            </form>
          </div>
        </Reveal>

        <div className="grid gap-10 py-14 sm:grid-cols-3">
          {site.footer.columns.map((column, index) => (
            <Reveal key={column.title} delay={index * 0.06} duration={0.85}>
              <div>
                <h4 className="mb-5 text-[10px] tracking-[0.3em] text-gold-light uppercase">
                  {column.title}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#collection"
                        className="text-[13px] text-cream/65 transition-colors hover:text-cream"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-cream/12 pt-8 text-[11px] tracking-[0.14em] text-cream/45 uppercase md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} {site.brand.name}
            {site.brand.sub ? ` ${site.brand.sub}` : ''}
          </span>
          <span className="normal-case tracking-normal">{site.footer.note}</span>
        </div>
      </div>
    </footer>
  )
}
