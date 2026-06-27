import styles from './TimelineControls.module.css';

export default function TimelineControls({
  statusText,
  disablePrev,
  disableNext,
  onPrev,
  onNext,
}) {
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.button}
        onClick={onPrev}
        disabled={disablePrev}
        aria-label="Previous event"
      >
        ‹
      </button>
      <span className={styles.status} aria-live="polite">
        {statusText}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={onNext}
        disabled={disableNext}
        aria-label="Next event"
      >
        ›
      </button>
    </div>
  );
}
