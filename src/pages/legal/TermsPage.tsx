import { Bullets, CONTACT_EMAIL, LegalPage, Section } from './LegalPage'
import { pricingPlans } from '@/data/pricingPlans'

export function TermsPage() {
  const [essential, signature] = pricingPlans
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms apply when you use Invytory (invytory.com) to create, share or open a digital invitation. By using the site you agree to them. If you do not agree, please do not use it."
    >
      <Section title="What Invytory does">
        <p>
          Invytory lets hosts build animated invitations for events such as weddings, child dedications, birthdays, corporate
          events and funerals, share them by link, and collect RSVPs, messages and photos from guests.
        </p>
      </Section>

      <Section title="Your account">
        <Bullets
          items={[
            'You must be 18 or older, or have a parent or guardian’s permission, to create an invitation.',
            'Keep your sign-in details safe. You are responsible for what happens under your account.',
            'Give accurate information, especially event details guests rely on.',
          ]}
        />
      </Section>

      <Section title="Plans, payment and hosting">
        <Bullets
          items={[
            `${essential.name}: ₦${essential.price.toLocaleString('en-NG')}, up to ${essential.maxGuests} guests, hosted for ${essential.hostingDays} days.`,
            `${signature.name}: ₦${signature.price.toLocaleString('en-NG')}, up to ${signature.maxGuests} guests, hosted for at least 180 days, extended to cover your last ceremony, up to ${signature.hostingDays} days, and includes the guest photo album.`,
            'Payment is made once per invitation through Paystack. The hosting period starts when your payment is confirmed.',
            'When the hosting period ends, the invitation stops showing to guests. You can ask us about extending it.',
            'Prices are in Nigerian naira and may change for future purchases. A price you have already paid does not change.',
          ]}
        />
      </Section>

      <Section title="Refunds">
        <p>
          Because your invitation is made and published straight away, payments are generally not refundable once it is live. If
          you were charged but your invitation was not activated, or you were charged twice, contact us with your Paystack
          payment reference and we will put it right.
        </p>
      </Section>

      <Section title="Your content and what you can upload">
        <p>
          You keep ownership of everything you add: text, photos, music and guest details. You give us permission to store, display and
          deliver it as part of your invitation, and to make copies as needed to run the service.
        </p>
        <p>You promise that:</p>
        <Bullets
          items={[
            'You own what you upload or have the right to use it, including any music you upload.',
            'You have the consent of people shown in photos or named in the invitation, and of a child’s parent or guardian where a child is involved.',
            'Your content is not unlawful, hateful, harassing, sexually explicit, misleading or an infringement of anyone’s rights.',
            'You will not use Invytory to send spam, scams or anything intended to harm others.',
          ]}
        />
        <p>
          Music from our library is licensed for use in invitations on Invytory only. Do not download it for other uses.
        </p>
      </Section>

      <Section title="Guests, message wall and photo album">
        <p>
          Guests who post a message, RSVP or add photos are responsible for what they add. Hosts can remove messages and album
          photos from their dashboard. Anyone with the link can view an invitation and its message wall, and anyone with the album
          link can see the album, so share links only with people you want to see them.
        </p>
      </Section>

      <Section title="AI Assist">
        <p>
          AI Assist suggests wording. Suggestions can be wrong or not suit you, so read them and edit before you publish. You are
          responsible for the final text. Do not enter private or sensitive information.
        </p>
      </Section>

      <Section title="Removing content">
        <p>
          We may remove content or suspend an invitation that breaks these terms or the law, or if someone reports a genuine
          problem. If you believe something on Invytory infringes your rights or involves you without your consent, write to{' '}
          <a className="text-wine underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and tell us which invitation it is.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          We work to keep Invytory running, but we cannot promise it will always be available or error free. Check your invitation
          and share it well before your event. Back up photos you want to keep.
        </p>
      </Section>

      <Section title="Limits on our responsibility">
        <p>
          Invytory is provided as it is. To the extent the law allows, we are not responsible for indirect losses, for events
          affected by a link not reaching guests, or for content added by hosts and guests. Our total responsibility to you for any
          claim is limited to the amount you paid for the invitation involved.
        </p>
      </Section>

      <Section title="Changes and governing law">
        <p>
          We may update these terms and will change the date above when we do. Continuing to use Invytory after a change means you
          accept it. These terms are governed by the laws of the Federal Republic of Nigeria.
        </p>
      </Section>
    </LegalPage>
  )
}
