
export const str_type = { type: String };
export const number_type = { type: Number };
export const bilingual = (name,type) => ({
  [`${name}_en`] : type,
  [`${name}_fr`] : type,
});

export const bilingual_str = name => bilingual(name,str_type);

export const pkey_type = () => ({
  ...str_type,
  required: true,
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