import { site } from '@/config/site'

export function Marquee() {
  const items = [...site.marquee, ...site.marquee]

  return (
    <div className="relative z-30 overflow-hidden border-y border-gold/20 bg-teal-deep py-4">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-10">
            <span className="font-display text-[15px] tracking-[0.28em] text-cream/85 uppercase">
              {item}
            </span>
            <span className="size-1.5 rotate-45 bg-gold" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  )
}
