export interface Draft {
  number: number
  name: string
  brewery: string
  style: string
  abv: number
  location: string
  'full-price': string
  'half-price': string
  /** When tracking first saw this beer on tap (ISO); absent if untracked. */
  firstSeen?: string
  /** True when the beer was already on tap when tracking began (start unknown). */
  baseline?: boolean
}
