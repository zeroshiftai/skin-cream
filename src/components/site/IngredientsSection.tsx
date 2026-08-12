import { Reveal, SplitHeading } from '@/components/motion'
import { site } from '@/config/site'

export function IngredientsSection() {
  const items = site.ingredients

  return (
    <section
      id="ingredients"
      className="relative bg-[linear-gradient(180deg,#e8f2f4_0%,#f0f7f8_100%)] px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-16 max-w-xl">
          <Reveal duration={0.85}>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[10px] tracking-[0.4em] text-mocha uppercase">Inside the jar</span>
            </div>
          </Reveal>
          <SplitHeading className="font-display text-espresso text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.05] font-light tracking-[-0.015em]">
            Formulated for quiet skin
          </SplitHeading>
          <Reveal delay={0.1} duration={0.95}>
            <p className="text-espresso/65 mt-6 max-w-md text-[15px] leading-relaxed">
              Four actives do the heavy lifting — the rest is texture, scent, and the way it
              disappears.
            </p>
          </Reveal>
        </div>

        <ol className="divide-y divide-espresso/10 border-y border-espresso/10">
          {items.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.06} duration={0.9} as="li">
              <div className="grid grid-cols-[auto_1fr] items-baseline gap-6 py-8 md:gap-12">
                <span className="font-display text-2xl font-light text-gold md:text-3xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-espresso text-2xl font-normal md:text-[28px]">
                    {item.name}
                  </h3>
                  <p className="text-espresso/65 mt-2 max-w-lg text-[14px] leading-relaxed">
                    {item.note}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
