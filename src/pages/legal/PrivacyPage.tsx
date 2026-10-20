import { Bullets, CONTACT_EMAIL, LegalPage, Section } from './LegalPage'

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Invytory (invytory.com) helps you build and share digital invitations. This page explains what information we collect, why, who can see it, and the choices you have. We handle personal data in line with the Nigeria Data Protection Act 2023."
    >
      <Section title="Who we are">
        <p>
          Invytory is the data controller for information collected through invytory.com. You can reach us at{' '}
          <a className="text-wine underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>

      <Section title="What we collect">
        <p>It depends on whether you are creating an invitation (a host) or opening one (a guest).</p>
        <p className="font-medium text-ink">If you are a host</p>
        <Bullets
          items={[
            'Account details: your email address and sign-in information.',
            'Invitation content you enter: names, event dates, venues, your story, schedule, dress code, gift details, colours and design choices.',
            'Files you upload: photos for your gallery and cover, and music if you upload your own.',
            'Text you send to our AI Assist feature, so it can suggest wording. Do not put sensitive details in it.',
            'Guest lists and special-guest names you add, so each person can get a personal link.',
            'Payment records: the plan you chose, the amount and the Paystack payment reference.',
          ]}
        />
        <p className="font-medium text-ink">If you are a guest</p>
        <Bullets
          items={[
            'RSVP answers: your name, whether you are attending and any details the host asks for.',
            'Messages you post on the invitation’s message wall, which show your name and message.',
            'Photos you add to a guest album, where the host has turned one on.',
            'If you open a personal link, we record that your link was opened so the host can see who has viewed it.',
            'Basic view counts for the invitation.',
          ]}
        />
      </Section>

      <Section title="Who can see what">
        <Bullets
          items={[
            'Anyone with an invitation’s link can see the invitation, including its photos, names, venue and the message wall.',
            'Guest album photos are visible to anyone who has the album link, not only to people you invited. Share that link carefully.',
            'The host sees RSVPs, guest messages, album photos and which personal links were opened.',
            'We use the music, photos and text only to run your invitation. We do not sell your information or use it for advertising.',
          ]}
        />
      </Section>

      <Section title="Why we use your information">
        <Bullets
          items={[
            'To create, host and show your invitation, and to collect RSVPs, messages and photos.',
            'To take payment and activate your plan.',
            'To keep the service secure, prevent abuse and fix problems.',
            'To reply to you when you contact us.',
          ]}
        />
      </Section>

      <Section title="Services that help us run Invytory">
        <p>We rely on a small number of providers. They only handle data to provide their service to us.</p>
        <Bullets
          items={[
            'Supabase: database, sign-in and file storage.',
            'Vercel: hosting of the website.',
            'Paystack: card and bank payments. We never see or store your card details.',
            'An AI provider: processes text you submit to AI Assist.',
            'Google Fonts: loads the fonts used on the site.',
          ]}
        />
        <p>Some of these providers are based outside Nigeria, so your information may be processed in other countries.</p>
      </Section>

      <Section title="How long we keep it">
        <p>
          An invitation stays online for the hosting period of your plan (90 days for Essential, 365 days for Signature), counted
          from payment. After it expires the invitation stops showing to guests. We may delete expired invitations and their
          uploads, RSVPs, messages and album photos after a reasonable period. If you want something removed sooner, ask us.
          Payment records are kept as long as the law requires.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <p>You can ask us to give you a copy of your data, correct it, or delete it, and you can object to how we use it.</p>
        <Bullets
          items={[
            'Hosts can edit or remove invitation content, guests and album photos from the dashboard.',
            'Guests who want a message, RSVP or photo removed can ask the host, or write to us.',
            'To delete your account or any data, email us from the address on your account.',
          ]}
        />
        <p>
          If you are not happy with how we handle your data, you can also complain to the Nigeria Data Protection Commission.
        </p>
      </Section>

      <Section title="Children">
        <p>
          Hosts may include a child’s name and photos, for example in a child dedication or birthday invitation. Only a parent or
          guardian, or someone they have authorised, should add a child’s details. Invytory is not meant for children to use on their own.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use encrypted connections and access controls. No online service is completely secure, so please choose strong
          sign-in details and only share links with people you trust.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>If we change this policy in a way that matters, we will update the date at the top and, where we can, tell you.</p>
      </Section>
    </LegalPage>
  )
}
