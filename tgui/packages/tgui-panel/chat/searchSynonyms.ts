import {
  MESSAGE_TYPE_ADMINCHAT,
  MESSAGE_TYPE_ADMINLOG,
  MESSAGE_TYPE_ADMINPM,
  MESSAGE_TYPE_ATTACKLOG,
  MESSAGE_TYPE_COMBAT,
  MESSAGE_TYPE_DEADCHAT,
  MESSAGE_TYPE_DEBUG,
  MESSAGE_TYPE_ENTERTAINMENT,
  MESSAGE_TYPE_INFO,
  MESSAGE_TYPE_LOCALCHAT,
  MESSAGE_TYPE_MODCHAT,
  MESSAGE_TYPE_OOC,
  MESSAGE_TYPE_PRAYER,
  MESSAGE_TYPE_RADIO,
  MESSAGE_TYPE_SYSTEM,
  MESSAGE_TYPE_WARNING,
} from './constants';
import type { Page } from './types';

type SearchGroup = {
  /** Message types a tab must accept for this group to count as a match */
  types: string[];
  /** Lowercase EN/RU terms that resolve to this group */
  terms: string[];
};

/**
 * Tab names are free text, so a search can't rely on a fixed dictionary of
 * tab names. Instead it resolves the query to the message type(s) it refers
 * to (in either language) and checks which tabs accept that type - the same
 * data already used to build tab content in the first place.
 */
const SEARCH_GROUPS: SearchGroup[] = [
  { types: [MESSAGE_TYPE_SYSTEM], terms: ['system', 'система', 'системные'] },
  {
    types: [MESSAGE_TYPE_LOCALCHAT],
    terms: ['local', 'say', 'локал', 'локальный'],
  },
  { types: [MESSAGE_TYPE_RADIO], terms: ['radio', 'радио'] },
  {
    types: [MESSAGE_TYPE_ENTERTAINMENT],
    terms: ['entertainment', 'развлечения'],
  },
  { types: [MESSAGE_TYPE_INFO], terms: ['info', 'инфо', 'информация'] },
  {
    types: [MESSAGE_TYPE_WARNING],
    terms: ['warning', 'предупреждение', 'варнинг'],
  },
  {
    types: [MESSAGE_TYPE_DEADCHAT],
    terms: ['deadchat', 'dchat', 'дедчат', 'мертвый чат'],
  },
  { types: [MESSAGE_TYPE_OOC], terms: ['ooc', 'оос', 'внеигровой'] },
  {
    types: [MESSAGE_TYPE_ADMINPM],
    terms: ['adminpm', 'adminhelp', 'ahelp', 'ахелп', 'помощь админа'],
  },
  {
    types: [MESSAGE_TYPE_COMBAT, MESSAGE_TYPE_ATTACKLOG],
    terms: ['combat', 'attack log', 'бой', 'боевой лог', 'лог атак'],
  },
  {
    // "Aghost" has no dedicated message type of its own - it shows up as
    // admin chat/log/pm content, so the jargon is aliased to that whole group
    types: [MESSAGE_TYPE_ADMINCHAT, MESSAGE_TYPE_ADMINLOG, MESSAGE_TYPE_ADMINPM],
    terms: [
      'admin',
      'админ',
      'админка',
      'asay',
      'асай',
      'aghost',
      'admin ghost',
      'агост',
      'админ-гост',
      'админ призрак',
    ],
  },
  {
    types: [MESSAGE_TYPE_MODCHAT],
    terms: ['mod', 'msay', 'модер', 'мсай'],
  },
  {
    types: [MESSAGE_TYPE_PRAYER],
    terms: ['prayer', 'pray', 'молитва', 'молитвы'],
  },
  { types: [MESSAGE_TYPE_DEBUG], terms: ['debug', 'дебаг', 'отладка'] },
];

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function resolveTypesForQuery(query: string): Set<string> {
  const types = new Set<string>();
  for (const group of SEARCH_GROUPS) {
    const isMatch = group.terms.some(
      (term) => term.includes(query) || query.includes(term),
    );
    if (isMatch) {
      group.types.forEach((type) => types.add(type));
    }
  }
  return types;
}

/** Whether a tab should stay visible for the given free-text search query */
export function matchesTabSearch(page: Page, rawQuery: string): boolean {
  const query = normalize(rawQuery);
  if (!query) {
    return true;
  }

  if (normalize(page.name).includes(query)) {
    return true;
  }

  const matchingTypes = resolveTypesForQuery(query);
  if (matchingTypes.size === 0) {
    return false;
  }

  return Object.entries(page.acceptedTypes).some(
    ([type, accepted]) => accepted && matchingTypes.has(type),
  );
}
