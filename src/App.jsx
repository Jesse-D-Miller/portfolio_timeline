import Timeline from './components/Timeline/Timeline';
import styles from './App.module.css';

function App() {
  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1>Jesse Miller</h1>
        <p>Career, projects, and milestones — in order.</p>
      </header>
      <Timeline />
    </main>
  );
}

export default App;
