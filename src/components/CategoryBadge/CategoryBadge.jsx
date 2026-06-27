import { CATEGORY_LABELS, CATEGORY_COLOR_VARS } from '../../utils/categories';
import styles from './CategoryBadge.module.css';

export default function CategoryBadge({ category }) {
  return (
    <span
      className={styles.badge}
      style={{ '--badge-color': CATEGORY_COLOR_VARS[category] }}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}
