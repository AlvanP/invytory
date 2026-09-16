type ClassValue = string | number | boolean | null | undefined | ClassValue[]

/** Small dependency-free classnames combiner, used instead of pulling in `clsx`. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  for (const v of values) {
    if (!v) continue
    if (Array.isArray(v)) {
      const nested = cn(...v)
      if (nested) out.push(nested)
    } else {
      out.push(String(v))
    }
  }
  return out.join(' ')
}
