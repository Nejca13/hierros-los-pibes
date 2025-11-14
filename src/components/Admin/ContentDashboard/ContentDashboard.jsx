import styles from './ContentDashboard.module.css'

const ContentDashboard = ({ children }) => {
  return <div className={styles.container}>{children}</div>
}

export default ContentDashboard
