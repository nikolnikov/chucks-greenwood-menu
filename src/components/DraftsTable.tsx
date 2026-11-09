import { useMemo, useState, type CSSProperties } from 'react'
import type { Draft } from '../types/draft'
import { getCategoryColor } from '../utils/categories'
import { getFreshness } from '../utils/freshness'
import { FreshnessMeter } from './FreshnessMeter'
import styles from './DraftsTable.module.scss'

interface DraftsTableProps {
  drafts: Draft[]
}

type SortKey = 'number' | 'beer' | 'freshness' | 'location' | 'abv' | 'full' | 'half'
type SortDirection = 'asc' | 'desc'

interface Column {
  key: SortKey
  label: string
  /** Direction used the first time a column is selected. */
  defaultDirection: SortDirection
  className?: string
  value: (draft: Draft) => string | number
}

const price = (value: string) => Number.parseFloat(value) || 0

/** "10.00" -> "$10", "6.50" -> "$6.5"; unparseable values are shown as given. */
function formatPrice(value: string): string {
  const amount = Number.parseFloat(value)
  return `$${Number.isNaN(amount) ? value : amount}`
}

const COLUMNS: Column[] = [
  { key: 'number', label: '#', defaultDirection: 'asc', value: (d) => d.number },
  {
    key: 'beer',
    label: 'Beer',
    defaultDirection: 'asc',
    className: styles.nameHeader,
    value: (d) => `${d.brewery} ${d.name}`.toLowerCase(),
  },
  { key: 'freshness', label: 'Freshness', defaultDirection: 'desc', value: (d) => getFreshness(d) },
  {
    key: 'location',
    label: 'Loc',
    defaultDirection: 'asc',
    className: styles.hideOnMobile,
    value: (d) => d.location.toLowerCase(),
  },
  {
    key: 'abv',
    label: 'ABV',
    defaultDirection: 'asc',
    className: styles.hideOnMobile,
    value: (d) => d.abv,
  },
  {
    key: 'full',
    label: 'Full',
    defaultDirection: 'asc',
    className: styles.hideOnMobile,
    value: (d) => price(d['full-price']),
  },
  {
    key: 'half',
    label: 'Half',
    defaultDirection: 'asc',
    className: styles.hideOnMobile,
    value: (d) => price(d['half-price']),
  },
]

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

export function DraftsTable({ drafts }: DraftsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('number')
  const [direction, setDirection] = useState<SortDirection>('asc')

  const sortedDrafts = useMemo(() => {
    const column = COLUMNS.find((candidate) => candidate.key === sortKey)!
    const sign = direction === 'asc' ? 1 : -1
    // Tap number breaks ties so the order is stable.
    return [...drafts].sort(
      (a, b) => sign * compare(column.value(a), column.value(b)) || a.number - b.number,
    )
  }, [drafts, sortKey, direction])

  function handleSort(column: Column) {
    if (column.key === sortKey) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(column.key)
      setDirection(column.defaultDirection)
    }
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const active = column.key === sortKey
              return (
                <th
                  key={column.key}
                  className={column.className}
                  aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <button
                    type="button"
                    className={active ? styles.sortActive : styles.sortButton}
                    onClick={() => handleSort(column)}
                  >
                    {column.label}
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedDrafts.map((draft) => (
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
              <td className={styles.hideOnMobile}>{formatPrice(draft['full-price'])}</td>
              <td className={styles.hideOnMobile}>{formatPrice(draft['half-price'])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
