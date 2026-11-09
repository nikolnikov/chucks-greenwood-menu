import styles from './Spinner.module.scss'

export function Spinner() {
  return <div className={styles.spinner} role="status" aria-label="Loading" />
}
