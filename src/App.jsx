import Timeline from './components/Timeline/Timeline';
import styles from './App.module.css';

function App() {
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1>Jesse Miller</h1>
        <p>Career, education, projects, and achievements — across time.</p>
      </header>
      <Timeline />
    </main>
  );
}

export default App;
