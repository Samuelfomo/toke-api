import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

export enum Status {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export const TenantDbStructure = {
  tableName: `${G.tableAp}_tenant`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Tenant',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_tenant_guid', msg: 'Tenant GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [2, 255],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Name (e.g. Cameroon)',
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { name: 'unique_tenant_key', msg: 'Tenant key must be unique' },
      validate: {
        len: [2, 100],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Key',
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        is: /^[A-Z]{2}$/,
        len: [2, 2],
      },
      comment: 'ISO 3166-1 alpha-2 country code (e.g. CM, FR, US)',
    },
    primary_currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        is: /^[A-Z]{3}$/,
        len: [3, 3],
      },
      comment: 'ISO 4217 primary currency code (e.g. XAF, USD, EUR)',
    },
    preferred_language_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'en',
      validate: {
        is: /^[a-z]{2}$/,
        len: [2, 2],
      },
      comment: 'ISO 639-1 preferred language code (e.g. fr, en)',
    },
    timezone: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'UTC',
      validate: {
        is: /^([A-Z][a-z]+\/[A-Za-z_]+|UTC[+-]\d{1,2}(:\d{2})?|UTC)$/,
        len: [1, 64],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Timezone',
    },
    tax_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        is: /^[A-Za-z0-9-_]{2,50}$/,
        len: [2, 50],
      },
      comment: 'Numéro TVA ou fiscal (ex. FR12345678901)',
    },
    is_tax_exempt: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the tenant tax exempt?',
    },
    billing_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        len: [2, 255],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Billing email',
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 65535],
      },
      comment: 'Billing address',
    },
    billing_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[0-9+\-\s()]+$/,
        len: [2, 20],
      },
      comment: 'Billing phone',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(Status)),
      allowNull: false,
      defaultValue: Status.ACTIVE,
      validate: {
        isIn: {
          args: [[Object.values(Status)]],
          msg: 'Status must be one of ACTIVE, SUSPENDED, TERMINATED',
        },
      },
      comment: 'Status',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableAp}_tenant`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'Tenant table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_tenant_guid',
      },
      {
        fields: ['name'],
        name: 'idx_tenant_name',
      },
      {
        fields: ['key'],
        name: 'idx_tenant_key',
      },
      {
        fields: ['country_code'],
        name: 'idx_tenant_country_code',
      },
      {
        fields: ['primary_currency_code'],
        name: 'idx_tenant_primary_currency_code',
      },
      {
        fields: ['preferred_language_code'],
        name: 'idx_tenant_preferred_language_code',
      },
      {
        fields: ['timezone'],
        name: 'idx_tenant_timezone',
      },
      {
        fields: ['tax_number'],
        name: 'idx_tenant_tax_number',
      },
      {
        fields: ['is_tax_exempt'],
        name: 'idx_tenant_is_tax_exempt',
      },
      {
        fields: ['billing_email'],
        name: 'idx_tenant_billing_email',
      },
      {
        fields: ['billing_address'],
        name: 'idx_tenant_billing_address',
      },
      {
        fields: ['billing_phone'],
        name: 'idx_tenant_billing_phone',
      },
      {
        fields: ['status'],
        name: 'idx_tenant_status',
      },
      {
        fields: ['created_at'],
        name: 'idx_tenant_created_at',
      },
      // {
      //   fields: ['updated_at'],
      //   name: 'idx_tenant_updated_at',
      // }
    ],
  } as ModelOptions,
  validation: {
    validateName: (name: string): boolean => {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 255;
    },
    validateKey: (key: string): boolean => {
      const trimmed = key.trim();
      return trimmed.length >= 2 && trimmed.length <= 100;
    },
    validateCountryCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[A-Z]{2}$/;
      return isoRegex.test(trimmed);
    },
    validatePrimaryCurrencyCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[A-Z]{3}$/;
      return isoRegex.test(trimmed);
    },
    validatePreferredLanguageCode: (code: string) => {
      const trimmed = code.trim().toUpperCase();
      const isoRegex = /^[a-z]{2}$/;
    },
    validateTimezone: (timezone: string): boolean => {
      const trimmed = timezone.trim();
      const timezoneRegex = /^([A-Z][a-z]+\/[A-Za-z_]+|UTC[+-]\d{1,2}(:\d{2})?|UTC)$/;
      return timezoneRegex.test(trimmed);
    },
    validateTaxNumber: (taxNumber: string): boolean => {
      const trimmed = taxNumber.trim();
      const taxNumberRegex = /^[A-Za-z0-9-_]{2,50}$/;
      return taxNumberRegex.test(trimmed);
    },
    validateIsTaxExcempt: (value: boolean): boolean => {
      return typeof value === 'boolean';
    },
    validateBillingEmail: (email: string): boolean => {
      const trimmed = email.trim();
      return trimmed.length >= 2 && trimmed.length <= 255 && email.includes('@');
    },
    validateAddress: (address: string): boolean => {
      const trimmed = address.trim();
      return trimmed.length >= 0 && trimmed.length <= 65535;
    },
    validatePhone: (phone: string): boolean => {
      const trimmed = phone.trim();
      return trimmed.length >= 2 && trimmed.length <= 20 && phone.includes('+');
    },
    validateStatus: (status: string): boolean => {
      return Object.values(Status).includes(status as Status);
    },

    cleanData: (data: any): void => {
      if (data.name) {
        data.name = data.name.trim();
      }
      if (data.key) {
        data.key = data.key.trim();
      }
      if (data.country_code) {
        data.country_code = data.country_code.trim().toUpperCase();
      }
      if (data.primary_currency_code) {
        data.primary_currency_code = data.primary_currency_code.trim().toUpperCase();
      }
      if (data.preferred_language_code) {
        data.preferred_language_code = data.preferred_language_code.trim().toUpperCase();
      }
      if (data.timezone) {
        data.timezone = data.timezone.trim();
      }
      if (data.tax_number) {
        data.tax_number = data.tax_number.trim();
      }
      if (data.billing_email) {
        data.billing_email = data.billing_email.trim();
      }
      if (data.billing_address) {
        data.billing_address = data.billing_address.trim();
      }
      if (data.billing_phone) {
        data.billing_phone = data.billing_phone.trim();
      }
      if (data.status) {
        data.status = data.status.trim().toUpperCase();
      }
      if (data.is_tax_exempt) {
        data.is_tax_exempt = data.is_tax_exempt === 'true';
      }
    },
  },
};
