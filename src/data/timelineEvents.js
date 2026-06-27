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
 * @property {'career'|'project'|'personal'} category
 * @property {string} [image] - imported asset; omit for a text-only card
 * @property {string} [imageAlt] - required if image is present
 * @property {string} [link] - external URL ("read more")
 * @property {string} [endDate] - ISO date, for ranged events (e.g. a job)
 */

/** @type {TimelineEvent[]} */
const timelineEvents = [
  {
    id: 'started-cs-degree',
    date: '2016-09',
    title: 'Started Computer Science Degree',
    description:
      'Began undergraduate studies in Computer Science, focusing on software fundamentals and systems design.',
    category: 'career',
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
    id: 'graduated-university',
    date: '2020-05',
    title: 'Graduated University',
    description:
      'Earned my Computer Science degree after four years of coursework, projects, and internships.',
    category: 'personal',
    image: graduationImg,
    imageAlt: 'Illustration representing a university graduation',
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
      'Designed and built a data-driven, horizontally-scrolling timeline to showcase my career, projects, and milestones.',
    category: 'project',
    image: portfolioTimelineImg,
    imageAlt: 'Illustration representing this portfolio timeline project',
    link: 'https://github.com/Jesse-D-Miller/portfolio_timeline',
  },
];

const REQUIRED_FIELDS = ['id', 'date', 'title', 'description', 'category'];
const VALID_CATEGORIES = ['career', 'project', 'personal'];

function validateTimelineEvents(events) {
  const seenIds = new Set();

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
