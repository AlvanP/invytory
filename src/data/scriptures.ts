/**
 * Verses parents can add to a child dedication with one tap. King James Version
 * (public domain), so they can be shown freely.
 */
export interface Scripture {
  reference: string
  text: string
}

export const dedicationScriptures: Scripture[] = [
  { reference: '1 Samuel 1:27', text: 'For this child I prayed; and the LORD hath given me my petition which I asked of him.' },
  { reference: 'Psalm 127:3', text: 'Lo, children are an heritage of the LORD: and the fruit of the womb is his reward.' },
  { reference: 'Proverbs 22:6', text: 'Train up a child in the way he should go: and when he is old, he will not depart from it.' },
  { reference: 'Numbers 6:24-26', text: 'The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace.' },
  { reference: 'Luke 2:52', text: 'And Jesus increased in wisdom and stature, and in favour with God and man.' },
  { reference: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.' },
  { reference: 'Mark 10:14', text: 'Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God.' },
]

export const scriptureAsText = (s: Scripture) => `“${s.text}” (${s.reference})`
