import G from '../tools/glossary';

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
  IS_ACTIVE: 'is_active',
  TIMEZONE_DEFAULT: 'timezone_default',
  PHONE_PREFIX: 'phone_prefix',

  NAME: 'name',
  SYMBOL: 'symbol',
  DECIMAL_PLACES: 'decimal_places',

  FROM_CURRENCY_CODE: 'from_currency_code',
  TO_CURRENCY_CODE: 'to_currency_code',
  EXCHANGE_RATE: 'exchange_rate',
  IS_CURRENT: 'is_current',
  CREATED_BY: 'created_by',

  COUNTRY_CODE: 'country_code',
  TAX_TYPE: 'tax_type',
  TAX_NAME: 'tax_name',
  TAX_RATE: 'tax_rate',
  APPLIES_TO: 'applies_to',
  REQUIRED_TAX_NUMBER: 'required_tax_number',
  EFFECTIVE_DATE: 'effective_date',
  EXPIRY_DATE: 'expiry_date',

  KEY: 'key',
  PRIMARY_CURRENCY_CODE: 'primary_currency_code',
  PREFERRED_LANGUAGE_CODE: 'preferred_language_code',
  TIMEZONE: 'timezone',
  TAX_NUMBER: 'tax_number',
  TAX_EXEMPT: 'tax_exempt',
  BILLING_EMAIL: 'billing_email',
  BILLING_ADDRESS: 'billing_address',
  BILLING_PHONE: 'billing_phone',
  STATUS: 'status',
  SUBDOMAIN: 'subdomain',
  DATABASE_NAME: 'database_name',
  DATABASE_USERNAME: 'database_username',
} as const;

export const tableStructure = {
  COUNTRY: `${G.tableConf}_country`,
  CURRENCY: `${G.tableConf}_currency`,
  EXCHANGE_RATE: `${G.tableConf}_exchange_rate`,
  LANGUAGE: `${G.tableConf}_language`,
  TAX_RULE: `${G.tableConf}_tax_rule`,
  TENANT: `${G.tableAp}_tenant`,
} as const;

export const EntityRoute = {
  MASTER: 'master',
  TENANT: 'tenant',
} as const;
