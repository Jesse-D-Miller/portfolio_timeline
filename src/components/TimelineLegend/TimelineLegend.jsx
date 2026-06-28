import { CATEGORY_LABELS, CATEGORY_COLOR_VARS } from '../../utils/categories';
import { TRACK_IDS } from '../../utils/trackCurve';
import { TRACK_LABELS, TRACK_COLOR_VARS } from '../../utils/tracks';
import styles from './TimelineLegend.module.css';

const MARKER_CATEGORIES = ['project', 'achievement'];

export default function TimelineLegend() {
  return (
    <div className={styles.legend}>
      <ul className={styles.group}>
        {TRACK_IDS.map((trackId) => (
          <li key={trackId} className={styles.item}>
            <span
              className={styles.lineSwatch}
              style={{ backgroundColor: TRACK_COLOR_VARS[trackId] }}
            />
            {TRACK_LABELS[trackId]}
          </li>
        ))}
      </ul>
      <ul className={styles.group}>
        {MARKER_CATEGORIES.map((category) => (
          <li key={category} className={styles.item}>
            <span
              className={styles.dotSwatch}
              style={{ backgroundColor: CATEGORY_COLOR_VARS[category] }}
            />
            {CATEGORY_LABELS[category]}
          </li>
        ))}
      </ul>
    </div>
  );
}
