export const responseModel = ['min', 'full'] as const;

export type ViewMode = (typeof responseModel)[number];

export const responseValue = {
  MINIMAL: 'min',
  FULL: 'full',
} as const;

export const responseStructure = {
  ID: 'id',
  GUID: 'guid',
  CODE: 'code',
  NAME_EN: 'name_en',
  NAME_LOCAL: 'name_local',
  DEFAULT_CURRENCY_CODE: 'default_currency_code',
  DEFAULT_LANGUAGE_CODE: 'default_language_code',
  IS_ACTIVE: 'active',
  TIMEZONE_DEFAULT: 'timezone_default',
  PHONE_PREFIX: 'phone_prefix',
} as const;
