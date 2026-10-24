import { Logo } from '@/components/brand/Logo'
import { BRAND_LINKS } from '@/data/brandLinks'
import { ICONS } from '@/components/brand/SocialIcons'

const ORDER = ['instagram', 'tiktok', 'linkedin', 'facebook', 'x', 'whatsapp'] as const

/** The small footer on a guest's invitation: the brand, how to reach it, and an invitation to make one. */
export function InvitationFooter() {
  const social = ORDER.filter((k) => BRAND_LINKS[k])
  return (
    <footer className="bg-wine text-ivory">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-12 text-center">
        <a href={BRAND_LINKS.website} target="_blank" rel="noopener noreferrer" aria-label="Invytory home" className="group inline-flex items-center gap-3">
          <Logo tone="light" className="h-12 transition-transform duration-500 group-hover:scale-[1.03]" />
        </a>
        <p className="font-display text-lg italic opacity-90">Tell a story, with your invites.</p>

        <a
          href={`${BRAND_LINKS.website}/create`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-ivory px-6 py-2.5 text-sm font-medium text-wine transition-transform hover:scale-[1.04]"
        >
          Create your own invitation
        </a>

        <ul className="flex flex-wrap items-center justify-center gap-3">
          {social.map((k) => (
            <li key={k}>
              <a
                href={BRAND_LINKS[k]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ICONS[k].label}
                title={ICONS[k].label}
                className="flex size-10 items-center justify-center rounded-full border border-ivory/35 transition-colors hover:bg-ivory hover:text-wine"
              >
                {ICONS[k].icon}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-1 border-t border-ivory/20 pt-5 text-xs opacity-85">
          <a href={BRAND_LINKS.website} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
            www.invytory.com
          </a>
          <p>&copy; {new Date().getFullYear()} Invytory. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
