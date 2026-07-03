import { useMemo } from 'react';
import { AXIS_START_YEAR, dateToPixels } from '../../utils/timelineScale';
import styles from './TimelineAxis.module.css';

export default function TimelineAxis({ pixelsPerYear, axisEndYear }) {
  const years = useMemo(() => {
    const list = [];
    for (let year = AXIS_START_YEAR; year <= axisEndYear; year++) {
      list.push(year);
    }
    return list;
  }, [axisEndYear]);

  // Unlabeled month ticks (Feb–Dec; January is already the year tick) so
  // the axis reads finer-grained without cluttering it with 12x the text.
  const months = useMemo(() => {
    const list = [];
    for (let year = AXIS_START_YEAR; year <= axisEndYear; year++) {
      for (let month = 2; month <= 12; month++) {
        list.push(`${year}-${String(month).padStart(2, '0')}`);
      }
    }
    return list;
  }, [axisEndYear]);

  return (
    <div className={styles.axis} aria-hidden="true">
      {months.map((monthKey) => (
        <span
          key={monthKey}
          className={styles.monthTick}
          style={{ left: dateToPixels(monthKey, pixelsPerYear) }}
        />
      ))}
      {years.map((year) => (
        <div
          key={year}
          className={styles.tick}
          style={{ left: dateToPixels(`${year}-01`, pixelsPerYear) }}
        >
          <span className={styles.tickMark} />
          <span className={styles.tickLabel}>{year}</span>
        </div>
      ))}
    </div>
  );
}
