import { useMemo, useState } from 'react'
import { CategoryFilter } from '../components/CategoryFilter'
import { DraftsTable } from '../components/DraftsTable'
import { Spinner } from '../components/Spinner'
import { useDrafts } from '../hooks/useDrafts'
import { getCategoryKey, type CategoryKey } from '../utils/categories'
import styles from './HomePage.module.scss'

export function HomePage() {
  const { drafts, loading, error } = useDrafts()
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null)

  const visibleDrafts = useMemo(() => {
    if (selectedCategory === null) return drafts
    return drafts.filter((draft) => getCategoryKey(draft.style) === selectedCategory)
  }, [drafts, selectedCategory])

  function handleToggle(category: CategoryKey) {
    setSelectedCategory((current) => (current === category ? null : category))
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <img src="/chucks-logo.webp" alt="Chuck's Greenwood Draft List" />

        <div className={styles.status}>
          {error && <span className={styles.error}>Failed to refresh: {error}. </span>}
        </div>
      </header>

      <CategoryFilter selected={selectedCategory} onToggle={handleToggle} />

      {loading ? <Spinner /> : <DraftsTable drafts={visibleDrafts} />}
    </main>
  )
}
