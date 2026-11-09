interface KeyFields {
  number: number
  brewery: string | null
  name: string
}

const clean = (value: string | null) => (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * Identifies a beer on a specific tap. Shared by the tracking Worker and the
 * frontend so both sides agree on what counts as "the same beer".
 */
export function draftKey({ number, brewery, name }: KeyFields): string {
  return `${number}|${clean(brewery)}|${clean(name)}`
}
