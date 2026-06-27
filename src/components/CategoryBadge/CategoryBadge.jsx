import styles from './CategoryBadge.module.css';

const CATEGORY_LABELS = {
  career: 'Career',
  project: 'Project',
  personal: 'Personal',
};

const CATEGORY_COLOR_VARS = {
  career: 'var(--color-career)',
  project: 'var(--color-project)',
  personal: 'var(--color-personal)',
};

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
