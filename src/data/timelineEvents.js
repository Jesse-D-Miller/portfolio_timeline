import { AXIS_START_YEAR, getAxisEndYear } from '../utils/timelineScale';

/**
 * @typedef {Object} TimelineEvent
 * @property {string} id - unique slug, used as React key
 * @property {string} date - ISO "YYYY-MM-DD" or "YYYY-MM"
 * @property {string} title
 * @property {string} description
 * @property {'career'|'education'|'project'|'achievement'} category
 * @property {'career'|'education'|'independent'} [trackAffiliation] - required
 *   for category 'project'|'achievement'. The Achievement/Project line
 *   always hosts its own marker; this controls how that line deviates at
 *   this event's date — 'career'/'education' make it dip partway toward
 *   that trunk's line (crossing whatever lines sit between them), while
 *   'independent' gives it a small standalone bump. Not used for
 *   'career'|'education' events — they ARE their own trunk.
 * @property {string} [image] - imported asset; omit for a text-only card
 * @property {string} [imageAlt] - required if image is present
 * @property {string} [link] - external URL ("read more")
 * @property {string} [endDate] - ISO date, for ranged events (e.g. a job or degree)
 */

// NOTE: the source resume only gives years for this section, not months —
// each date below defaults to January of the stated year. Replace with
// exact months if you have them; the dev-time validation below won't flag
// this, since "YYYY-MM" with January is a perfectly valid date, it's just
// an assumption worth double-checking against your records.
// NOTE: exact elementary school dates weren't given — extrapolated
// backward from high school's known start (Sept 2008) assuming a standard
// Kindergarten-through-Grade-7 span (8 school years), each running
// September to June. Replace with exact dates if you have them.
/** @type {TimelineEvent[]} */
const timelineEvents = [
  {
    id: 'born',
    date: '1994-10',
    title: 'Born',
    description: 'Jesse Miller is born in October 1994.',
    category: 'achievement',
    trackAffiliation: 'independent',
  },
  {
    id: 'elementary-school',
    date: '2000-09',
    endDate: '2008-06',
    title: 'Elementary School',
    description: 'Kindergarten through Grade 7.',
    category: 'education',
  },
  {
    id: 'high-school',
    date: '2008-09',
    endDate: '2013-06',
    title: 'High School',
    description: 'Grade 8 through Grade 12.',
    category: 'education',
  },
  {
    id: 'outrigger-world-championships',
    date: '2012-06',
    title: 'Outrigger World Championships',
    description: 'Competed as a member of the Canadian National Team.',
    category: 'achievement',
    trackAffiliation: 'independent',
  },
  {
    id: 'pta-award',
    date: '2013-05',
    title: 'PTA Award',
    description:
      'Awarded for outstanding leadership, athletics, and academics.',
    category: 'achievement',
    trackAffiliation: 'education',
  },
  {
    id: 'row-to-podium',
    date: '2014-05',
    title: 'Row to Podium',
    description:
      "Selected for Rowing Canada's national elite talent identification program, which recruits high-performing athletes from any sport background and develops them toward Olympic and Paralympic competition.",
    category: 'achievement',
    trackAffiliation: 'independent',
  },
  {
    id: 'governors-general-medal',
    date: '2013-06',
    title: "Governor General's Academic Medal",
    description:
      "Awarded the Governor General's Academic Medal for highest academic standing in the graduating class.",
    category: 'achievement',
    trackAffiliation: 'education',
  },
  {
    id: 'capilano-entrance-scholarship',
    date: '2013-09',
    title: 'Capilano University Entrance Scholarship',
    description:
      'Awarded an entrance scholarship upon admission to Capilano University.',
    category: 'achievement',
    trackAffiliation: 'education',
    labelPositionHint: 'above',
  },
  {
    id: 'capilano-university',
    date: '2013-09',
    endDate: '2014-12',
    title: 'Capilano University — BASc Engineering Science',
    description: 'Engineering Science coursework in North Vancouver, BC.',
    category: 'education',
  },
  {
    id: 'sfu-engineering-science',
    date: '2015-01',
    endDate: '2017-04',
    title: 'Simon Fraser University — BASc Engineering Science (Incomplete)',
    description:
      'Completed coursework in physics, calculus, systems design, and programming in Burnaby, BC.',
    category: 'education',
  },
  {
    id: 'folklore-tree-planter-2015',
    date: '2015-05',
    endDate: '2015-08',
    title: 'Folklore Ltd. — Tree Planter',
    description:
      'Planted 270,000 trees over two seasons to fund university education. Demonstrated strong work ethic by consistently being one of the highest production planters in a camp of more than 60 people.',
    category: 'career',
  },
  {
    id: 'folklore-tree-planter-2017',
    date: '2017-05',
    endDate: '2017-08',
    title: 'Folklore Ltd. — Tree Planter',
    description:
      'Planted 270,000 trees over two seasons to fund university education. Demonstrated strong work ethic by consistently being one of the highest production planters in a camp of more than 60 people.',
    category: 'career',
  },
  {
    id: 'beer-farmers-2018',
    date: '2018-10',
    endDate: '2019-04',
    title: 'The Beer Farmers — Taproom Server',
    description:
      'Provided friendly, professional customer service in a busy taproom environment. Maintained a clean, organized workspace to support safe and efficient service.',
    category: 'career',
  },
  {
    id: 'beer-farmers-2019',
    date: '2019-10',
    endDate: '2020-04',
    title: 'The Beer Farmers — Taproom Server',
    description:
      'Provided friendly, professional customer service in a busy taproom environment. Maintained a clean, organized workspace to support safe and efficient service.',
    category: 'career',
  },
  {
    id: 'beer-farmers-2020',
    date: '2020-10',
    endDate: '2021-04',
    title: 'The Beer Farmers — Taproom Server',
    description:
      'Provided friendly, professional customer service in a busy taproom environment. Maintained a clean, organized workspace to support safe and efficient service.',
    category: 'career',
  },
  {
    id: 'beer-farmers-2021',
    date: '2021-10',
    endDate: '2022-04',
    title: 'The Beer Farmers — Taproom Server',
    description:
      'Provided friendly, professional customer service in a busy taproom environment. Maintained a clean, organized workspace to support safe and efficient service.',
    category: 'career',
  },
  {
    id: 'bcws-above-and-beyond',
    date: '2024-10',
    title: 'BC Wildfire — Above & Beyond Award',
    description:
      'Received the Above & Beyond award for exceptional performance during the 2024 wildfire season.',
    category: 'achievement',
    trackAffiliation: 'career',
  },
  {
    id: 'bcws-operations-conference',
    date: '2024-03',
    title: 'BC Wildfire Operations Conference — Presenter',
    description:
      'Selected to present at the annual BC Wildfire Operations Conference, an opportunity typically extended to senior leadership.',
    category: 'achievement',
    trackAffiliation: 'career',
  },
  {
    id: 'bcws-hiring-team',
    date: '2023-10',
    title: 'BC Wildfire — Coastal Fire Centre Hiring Team',
    description: 'Chosen to join the hiring team for the Coastal Fire Centre.',
    category: 'achievement',
    trackAffiliation: 'career',
  },
  {
    id: 'bc-wildfire-crew-member',
    date: '2018-01',
    endDate: '2021-01',
    title: 'BC Wildfire Service — Crew Member',
    description:
      'Supported wildfire suppression operations in rapidly changing environments, executing field tasks with a focus on safety, speed, and team coordination amid shifting priorities.',
    category: 'career',
  },
  {
    id: 'bc-wildfire-crew-leader',
    date: '2021-01',
    endDate: '2023-01',
    title: 'BC Wildfire Service — Crew Leader',
    description:
      'Led wildfire suppression operations in rapidly changing environments, managing on-the-ground coordination and facilitating clear communication between crews, command centers, and the public during interface emergencies.',
    category: 'career',
  },
  {
    id: 'bc-wildfire-crew-supervisor',
    date: '2023-01',
    endDate: '2025-01',
    title: 'BC Wildfire Service — Crew Supervisor',
    description:
      'Supervised five Initial Attack crews across two bases, ensuring safety, readiness, and performance; coordinated emergency logistics and personnel movements during high-pressure wildfire incidents; mentored new leaders through structured coaching programs.',
    category: 'career',
  },
  {
    id: 'lighthouse-labs-bootcamp',
    date: '2025-03',
    endDate: '2025-07',
    title: 'Lighthouse Labs — Full-Stack Web Development Bootcamp',
    description:
      'Completed an intensive 12-week full-stack program focused on modern web development. Built multiple full-stack applications using React, Node.js, Express, and PostgreSQL. Developed RESTful APIs, dynamic front-end interfaces, and database-driven features. Applied testing practices including unit, integration, and end-to-end testing (Mocha, Chai, Cypress). Worked with Git-based workflows for version control and collaborative development. Emphasized responsive design, clean code practices, and maintainable architecture.',
    category: 'education',
  },
  {
    id: 'portfolio-timeline',
    date: '2026-06',
    title: 'Portfolio Timeline',
    description:
      'A data-driven interactive timeline portfolio built with Vite, React, and plain CSS. Features a subway-map design with octolinear geometry, four concurrent track streams, branch lanes for overlapping jobs, and dynamic achievement routing.',
    category: 'project',
    trackAffiliation: 'independent',
  },
  {
    id: 'supernatural-landscapes',
    date: '2026-05',
    endDate: '2026-11',
    title: 'Super Natural Landscapes — Landscaper',
    description:
      'Performed landscape maintenance including weeding, planting, trimming, mowing, and tree felling across residential and commercial properties. Applied a strong working knowledge of plant species and their specific care requirements to ensure healthy, well-maintained outdoor environments.',
    category: 'career',
  },
  {
    id: 'bcit-ecet-diploma',
    date: '2027-01',
    endDate: '2029-01',
    title: 'BCIT — Electrical and Computer Engineering Technology Diploma',
    description: 'A 2-year diploma program.',
    category: 'education',
  },
];

const REQUIRED_FIELDS = ['id', 'date', 'title', 'description', 'category'];
const VALID_CATEGORIES = ['career', 'education', 'project', 'achievement'];
const AFFILIATION_REQUIRED_CATEGORIES = ['project', 'achievement'];
const VALID_TRACK_AFFILIATIONS = ['career', 'education', 'independent'];

function validateTimelineEvents(events) {
  const seenIds = new Set();
  const axisStart = AXIS_START_YEAR;
  const axisEnd = getAxisEndYear(events);

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

    if (AFFILIATION_REQUIRED_CATEGORIES.includes(event.category)) {
      if (!event.trackAffiliation) {
        console.warn(
          `[timelineEvents] Event "${event.id}" has category "${event.category}" and requires a trackAffiliation ('career'|'education'|'independent').`,
        );
      } else if (!VALID_TRACK_AFFILIATIONS.includes(event.trackAffiliation)) {
        console.warn(
          `[timelineEvents] Event "${event.id}" has an invalid trackAffiliation "${event.trackAffiliation}". Expected one of: ${VALID_TRACK_AFFILIATIONS.join(', ')}.`,
        );
      }
    } else if (event.trackAffiliation) {
      console.warn(
        `[timelineEvents] Event "${event.id}" has category "${event.category}" and should not set trackAffiliation (career/education events are their own trunk).`,
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
