import { CATEGORY_LABELS, CATEGORY_COLOR_VARS } from '../../utils/categories';
import { TRACK_IDS } from '../../utils/trackCurve';
import styles from './TimelineLegend.module.css';

export default function TimelineLegend() {
  return (
    <ul className={styles.legend}>
      {TRACK_IDS.map((trackId) => (
        <li key={trackId} className={styles.item}>
          <span
            className={styles.lineSwatch}
            style={{ backgroundColor: CATEGORY_COLOR_VARS[trackId] }}
          />
          {CATEGORY_LABELS[trackId]}
        </li>
      ))}
    </ul>
  );
}
