import CategoryBadge from '../CategoryBadge/CategoryBadge';
import { formatDate } from '../../utils/formatDate';
import styles from './TimelineEventCard.module.css';

export default function TimelineEventCard({ event, asListItem = true }) {
  const dateLabel = event.endDate
    ? `${formatDate(event.date)} – ${formatDate(event.endDate)}`
    : formatDate(event.date);

  const Tag = asListItem ? 'li' : 'div';

  return (
    <Tag
      className={styles.card}
      role="article"
      aria-label={`${event.title}, ${dateLabel}`}
      data-event-id={event.id}
    >
      {event.image && (
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={event.image}
            alt={event.imageAlt ?? ''}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
      )}
      <div className={styles.meta}>
        <span className={styles.date}>{dateLabel}</span>
        <CategoryBadge category={event.category} />
      </div>
      <h3 className={styles.title}>{event.title}</h3>
      <p className={styles.description}>{event.description}</p>
      {(event.link || event.videoLink) && (
        <div className={styles.links}>
          {event.link && (
            <a
              className={styles.link}
              href={event.link}
              target="_blank"
              rel="noreferrer"
            >
              View code
            </a>
          )}
          {event.videoLink && (
            <a
              className={`${styles.link} ${styles.videoLink}`}
              href={event.videoLink}
              target="_blank"
              rel="noreferrer"
            >
              ▶ Watch demo
            </a>
          )}
        </div>
      )}
    </Tag>
  );
}
