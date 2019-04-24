
export const str_type = { type: String };
export const number_type = { type: Number };
export const bilingual = (name,type) => ({
  [`${name}_en`] : type,
  [`${name}_fr`] : type,
});

export const bilingual_str = name => bilingual(name, str_type);

export const pkey_type = () => ({
  ...str_type,
  required: true,
  unique: true,
  index: true,
});

// This probably shouldn't be used outside of the case of optional subdocuments, but it IS required for subdocuments whenever
// the subdocument schema needs a pkey but isn't itself a required field of the parent. If multiple parents ARE
// missing a subdocument which has a required unique index then the database will throw a "dup key: { : null }" error.
// The only solution is to not put unique indexes on the subdocuments or to make sure they're sparse.
export const sparse_pkey_type = () => ({
  ...str_type,
  sparse: true,
  unique: true,
  index: true,
});

export const parent_fkey_type = () => ({
  ...str_type,
  required: true,
  index: true,
})

export const fyear_type = () => ({
  type: Number,
  index: true,
})