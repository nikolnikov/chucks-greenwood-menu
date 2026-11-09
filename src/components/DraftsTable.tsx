import type { CSSProperties } from 'react'
import type { Draft } from '../types/draft'
import { getCategoryColor } from '../utils/categories'
import { getFreshness } from '../utils/freshness'
import { FreshnessMeter } from './FreshnessMeter'
import styles from './DraftsTable.module.scss'

interface DraftsTableProps {
  drafts: Draft[]
}

export function DraftsTable({ drafts }: DraftsTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th className={styles.nameHeader}>Beer</th>
            <th>Freshness</th>
            <th className={styles.hideOnMobile}>Loc</th>
            <th className={styles.hideOnMobile}>ABV</th>
            <th className={styles.hideOnMobile}>Full</th>
            <th className={styles.hideOnMobile}>Half</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => (
            <tr
              key={draft.number}
              style={{ '--category-color': getCategoryColor(draft.style) } as CSSProperties}
            >
              <td className={styles.stripe}>{draft.number}</td>
              <td className={styles.nameCell}>
                {draft.brewery}: {draft.name}
              </td>
              <td>
                <FreshnessMeter level={getFreshness(draft)} />
              </td>
              <td className={styles.hideOnMobile}>{draft.location}</td>
              <td className={styles.hideOnMobile}>{draft.abv}%</td>
              <td className={styles.hideOnMobile}>${draft['full-price']}</td>
              <td className={styles.hideOnMobile}>${draft['half-price']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
