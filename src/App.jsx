import Timeline from './components/Timeline/Timeline';
import { siteMeta } from './data/siteMeta';
import styles from './App.module.css';

function App() {
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1>{siteMeta.name}</h1>
        <p className={styles.title}>{siteMeta.title}</p>
        <p className={styles.meta}>
          {siteMeta.location} ·{' '}
          <span className={styles.availability}>{siteMeta.availability}</span>
        </p>
        <nav className={styles.links} aria-label="Contact links">
          <a href={`mailto:${siteMeta.links.email}`}>Email</a>
          <a href={siteMeta.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={siteMeta.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={siteMeta.links.resumePdf} target="_blank" rel="noreferrer">
            Resume
          </a>
        </nav>
      </header>
      <Timeline />
    </main>
  );
}

export default App;
