/**
 * Alternative names for cities — covers exonyms, endonyms, historical names,
 * and common romanizations that are too different for fuzzy matching to catch.
 *
 * Key:   normalized alias (lowercase, accent-stripped)
 * Value: canonical nLower as it appears in the CITIES index
 */

export const CITY_ALIASES: ReadonlyMap<string, string> = new Map([
  // Chinese cities
  ['peking', 'beijing'],
  ['pekin', 'beijing'],
  ['canton', 'guangzhou'],

  // Indian cities — historical names
  ['bombay', 'mumbai'],
  ['calcutta', 'kolkata'],
  ['madras', 'chennai'],
  ['benares', 'varanasi'],
  ['poona', 'pune'],

  // European — local-language names
  ['wien', 'vienna'],
  ['praha', 'prague'],
  ['prag', 'prague'],
  ['roma', 'rome'],
  ['moskva', 'moscow'],
  ['moskau', 'moscow'],
  ['moskow', 'moscow'],
  ['moscou', 'moscow'],
  ['warszawa', 'warsaw'],
  ['warschau', 'warsaw'],
  ['athinai', 'athens'],
  ['athen', 'athens'],
  ['brussel', 'brussels'],
  ['bruxelles', 'brussels'],
  ['kobenhavn', 'copenhagen'],
  ['kopenhagen', 'copenhagen'],
  ['lissabon', 'lisbon'],
  ['lisboa', 'lisbon'],
  ['munchen', 'munich'],
  ['muenchen', 'munich'],
  ['napoli', 'naples'],
  ['firenze', 'florence'],
  ['florenz', 'florence'],
  ['venezia', 'venice'],
  ['venedig', 'venice'],
  ['mailand', 'milan'],
  ['milano', 'milan'],
  ['genova', 'genoa'],
  ['torino', 'turin'],
  ['cologne', 'koln'],
  ['gothenburg', 'goteborg'],
  ['nuremberg', 'nurnberg'],
  ['antwerp', 'antwerpen'],
  ['marrakech', 'marrakesh'],
  ['marrakesch', 'marrakesh'],
  ['den haag', 'the hague'],
  ['bukarest', 'bucharest'],
  ['bucuresti', 'bucharest'],
  ['belgrad', 'belgrade'],
  ['beograd', 'belgrade'],

  // Asian cities
  ['tokio', 'tokyo'],
  ['seul', 'seoul'],
  ['saigon', 'ho chi minh city'],
  ['rangoon', 'yangon'],
  ['batavia', 'jakarta'],
  ['krung thep', 'bangkok'],

  // Middle East / Africa
  ['konstantinopel', 'istanbul'],
  ['constantinople', 'istanbul'],
  ['kairo', 'cairo'],
  ['le caire', 'cairo'],
  ['tanger', 'tangier'],

  // Americas
  ['nueva york', 'new york city'],
  ['mexiko', 'mexico city'],
  ['ciudad de mexico', 'mexico city'],
]);

/** 2-char prefix index for O(1) bucket lookup during search. */
export const ALIAS_PREFIX_INDEX: ReadonlyMap<string, [alias: string, canonical: string][]> =
  buildPrefixIndex();

function buildPrefixIndex(): ReadonlyMap<string, [string, string][]> {
  const index = new Map<string, [string, string][]>();
  for (const [alias, canonical] of CITY_ALIASES) {
    const prefix = alias.slice(0, 2);
    const bucket = index.get(prefix);
    if (bucket) bucket.push([alias, canonical]);
    else index.set(prefix, [[alias, canonical]]);
  }
  return index;
}
