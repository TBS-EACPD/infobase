const EMPTY_FINANCE_DATA = {
  program_spending: [],
  program_fte: [],
  org_vote_stat_pa: [],
  org_vote_stat_estimates: [],
  org_sobjs: [],
  org_transfer_payments: [],
  program_sobjs: [],
  program_vote_stat: [],
  gov_program_spending: [],
  gov_program_fte: [],
  gov_org_vote_stat_pa: [],
  gov_org_vote_stat_estimates: [],
  gov_org_sobjs: [],
  gov_org_transfer_payments: [],
};

const by_guid = new Map();
const loaded_keys_by_guid = new Map();

export const empty_finance_data = () => ({ ...EMPTY_FINANCE_DATA });

export const gov_store_key = (field) => `gov_${field}`;

export const get_loaded_finance_data = (subject) => by_guid.get(subject?.guid);

export const has_loaded_finance_fields = (subject, fields, gov_fields) => {
  const loaded = loaded_keys_by_guid.get(subject?.guid);
  if (!loaded) {
    return false;
  }
  return (
    fields.every((field) => loaded.has(field)) &&
    gov_fields.every((field) => loaded.has(gov_store_key(field)))
  );
};

export const merge_loaded_finance_data = (subject, partial, keys) => {
  const prev = by_guid.get(subject.guid) || empty_finance_data();
  by_guid.set(subject.guid, { ...prev, ...partial });

  const loaded = loaded_keys_by_guid.get(subject.guid) || new Set();
  keys.forEach((key) => loaded.add(key));
  loaded_keys_by_guid.set(subject.guid, loaded);
};

export const with_loaded_finance_data = (subject, calculate_fn) => {
  const finance_data = get_loaded_finance_data(subject);
  if (!finance_data) {
    return false;
  }
  return calculate_fn(finance_data);
};
