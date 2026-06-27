import { AXIS_START_YEAR, getAxisEndYear } from '../utils/timelineScale';
import internshipImg from '../assets/images/internship.svg';
import graduationImg from '../assets/images/graduation.svg';
import cliToolImg from '../assets/images/cli-tool.svg';
import portfolioTimelineImg from '../assets/images/portfolio-timeline.svg';

/**
 * @typedef {Object} TimelineEvent
 * @property {string} id - unique slug, used as React key
 * @property {string} date - ISO "YYYY-MM-DD" or "YYYY-MM"
 * @property {string} title
 * @property {string} description
 * @property {'career'|'education'|'project'|'achievement'} category
 * @property {string} [image] - imported asset; omit for a text-only card
 * @property {string} [imageAlt] - required if image is present
 * @property {string} [link] - external URL ("read more")
 * @property {string} [endDate] - ISO date, for ranged events (e.g. a job or degree)
 */

/** @type {TimelineEvent[]} */
const timelineEvents = [
  {
    id: 'cs-degree',
    date: '2016-09',
    endDate: '2020-05',
    title: 'Computer Science Degree',
    description:
      'Undergraduate studies in Computer Science, focusing on software fundamentals and systems design.',
    category: 'education',
    image: graduationImg,
    imageAlt: 'Illustration representing a university degree',
  },
  {
    id: 'first-internship',
    date: '2019-06',
    title: 'First Software Engineering Internship',
    description:
      'Joined a product team as a summer intern, shipping my first features to production users.',
    category: 'career',
    image: internshipImg,
    imageAlt: 'Illustration representing a software engineering internship',
  },
  {
    id: 'launched-cli-tool',
    date: '2021-03',
    title: 'Launched Open-Source CLI Tool',
    description:
      'Released a developer productivity CLI on GitHub that grew an active community of contributors.',
    category: 'project',
    image: cliToolImg,
    imageAlt: 'Illustration representing an open-source command line tool',
    link: 'https://github.com/Jesse-D-Miller',
  },
  {
    id: 'cli-tool-1k-stars',
    date: '2023-02',
    title: 'Open-Source CLI Tool Hits 1,000 GitHub Stars',
    description:
      'The CLI tool crossed 1,000 stars and 40 contributors, becoming a community-maintained project.',
    category: 'achievement',
  },
  {
    id: 'first-fulltime-role',
    date: '2022-08',
    endDate: '2024-12',
    title: 'Joined First Full-Time Engineering Role',
    description:
      'Started as a full-time software engineer, working across the stack on customer-facing products.',
    category: 'career',
  },
  {
    id: 'built-portfolio-timeline',
    date: '2026-06',
    title: 'Built This Portfolio Timeline',
    description:
      'Designed and built a data-driven timeline with parallel career, education, project, and achievement lanes.',
    category: 'project',
    image: portfolioTimelineImg,
    imageAlt: 'Illustration representing this portfolio timeline project',
    link: 'https://github.com/Jesse-D-Miller/portfolio_timeline',
  },
];

const REQUIRED_FIELDS = ['id', 'date', 'title', 'description', 'category'];
const VALID_CATEGORIES = ['career', 'education', 'project', 'achievement'];

function validateTimelineEvents(events) {
  const seenIds = new Set();
  const axisStart = AXIS_START_YEAR;
  const axisEnd = getAxisEndYear();

  for (const event of events) {
    const missing = REQUIRED_FIELDS.filter((field) => !event[field]);
    if (missing.length > 0) {
      console.warn(
        `[timelineEvents] Event "${event.id ?? '(no id)'}" is missing required field(s): ${missing.join(', ')}.`,
      );
    }

    if (event.category && !VALID_CATEGORIES.includes(event.category)) {
      console.warn(
        `[timelineEvents] Event "${event.id}" has an invalid category "${event.category}". Expected one of: ${VALID_CATEGORIES.join(', ')}.`,
      );
    }

    if (event.date && Number.isNaN(new Date(event.date).getTime())) {
      console.warn(
        `[timelineEvents] Event "${event.id}" has an unparseable date "${event.date}".`,
      );
    }

    if (event.endDate) {
      if (Number.isNaN(new Date(event.endDate).getTime())) {
        console.warn(
          `[timelineEvents] Event "${event.id}" has an unparseable endDate "${event.endDate}".`,
        );
      } else if (new Date(event.endDate) < new Date(event.date)) {
        console.warn(
          `[timelineEvents] Event "${event.id}" has an endDate before its date.`,
        );
      }
    }

    for (const field of ['date', 'endDate']) {
      const value = event[field];
      if (!value) continue;
      const year = new Date(value).getUTCFullYear();
      if (year < axisStart || year > axisEnd) {
        console.warn(
          `[timelineEvents] Event "${event.id}" has a ${field} (${value}) outside the timeline axis range ${axisStart}–${axisEnd}.`,
        );
      }
    }

    if (event.image && !event.imageAlt) {
      console.warn(
        `[timelineEvents] Event "${event.id}" has an image but no imageAlt. Add descriptive alt text.`,
      );
    }

    if (event.id) {
      if (seenIds.has(event.id)) {
        console.warn(`[timelineEvents] Duplicate event id "${event.id}".`);
      }
      seenIds.add(event.id);
    }
  }
}

if (import.meta.env.DEV) {
  validateTimelineEvents(timelineEvents);
}

/**
 * Returns all timeline events sorted chronologically by date.
 * This is the only way consumers should read timeline data — it guarantees
 * a newly added event always renders in the correct position automatically.
 * @returns {TimelineEvent[]}
 */
export function getSortedTimelineEvents() {
  return [...timelineEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
}
