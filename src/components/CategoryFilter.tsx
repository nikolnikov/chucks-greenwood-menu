import type { CSSProperties } from 'react'
import { CATEGORIES, type CategoryKey } from '../utils/categories'
import styles from './CategoryFilter.module.scss'

interface CategoryFilterProps {
  selected: CategoryKey | null
  onToggle: (category: CategoryKey) => void
}

export function CategoryFilter({ selected, onToggle }: CategoryFilterProps) {
  return (
    <div className={styles.filters}>
      {CATEGORIES.map((category) => {
        const isActive = selected === null || selected === category.key
        return (
          <button
            key={category.key}
            type="button"
            className={isActive ? `${styles.filterButton} ${styles.active}` : styles.filterButton}
            style={{ '--category-color': category.color } as CSSProperties}
            onClick={() => onToggle(category.key)}
          >
            <span className={styles.dot} />
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
