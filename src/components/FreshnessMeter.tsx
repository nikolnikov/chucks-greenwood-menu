import { MAX_FRESHNESS } from '../utils/freshness'
import styles from './FreshnessMeter.module.scss'

const LABELS: Record<number, string> = {
  5: 'Freshness 5 of 5: on tap within 3 days',
  4: 'Freshness 4 of 5: on tap within a week',
  3: 'Freshness 3 of 5: on tap within 2 weeks',
  2: 'Freshness 2 of 5: on tap within 4 weeks',
  1: 'Freshness 1 of 5: on tap 4 weeks or longer',
}

interface FreshnessMeterProps {
  /** 1–5 */
  level: number
}

export function FreshnessMeter({ level }: FreshnessMeterProps) {
  return (
    <span className={styles.meter} role="img" aria-label={LABELS[level]} title={LABELS[level]}>
      {Array.from({ length: MAX_FRESHNESS }, (_, index) => (
        <span key={index} className={index < level ? styles.filled : styles.empty} />
      ))}
    </span>
  )
}
