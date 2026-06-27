import { useMemo } from 'react';
import {
  AXIS_START_YEAR,
  getAxisEndYear,
  dateToPixels,
} from '../../utils/timelineScale';
import styles from './TimelineAxis.module.css';

export default function TimelineAxis({ pixelsPerYear }) {
  const years = useMemo(() => {
    const endYear = getAxisEndYear();
    const list = [];
    for (let year = AXIS_START_YEAR; year <= endYear; year++) {
      list.push(year);
    }
    return list;
  }, []);

  return (
    <div className={styles.axis} aria-hidden="true">
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
