import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

/**
 * Structure de la table countries
 */
export const CountryDbStructure = {
  tableName: `${G.tableConf}_country`,
  attributes: {
    id: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
        max: 65535,
      },
      comment: 'Country',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_country_guid', msg: 'Country GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: { name: 'unique_iso', msg: 'ISO must be unique' },
      validate: {
        is: /^[A-Z]{2}$/,
        len: [2, 2],
      },
      comment: 'ISO 3166-1 alpha-2 code (2 capital letters, e.g. CM)',
    },
    name_en: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        len: [2, 128],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Name (e.g. Cameroon and flag emoji (e.g. 🇨🇲))',
    },
    name_local: {
      type: DataTypes.STRING(128),
      allowNull: true,
      validate: {
        len: [2, 128],
      },
      comment: 'Local name (e.g. Cameroun)',
    },
    default_currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        is: /^[A-Z]{3}$/, // ISO 4217 → 3 lettres majuscules
        len: [3, 3],
        notEmpty: true,
        notNull: true,
      },
      comment: 'ISO 4217 currency code (e.g. XAF, USD, EUR)',
    },
    default_language_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        is: /^[a-z]{2}$/,
        // is: /^[a-zA-Z]{2}$/
        len: [2, 2],
      },
      comment: 'ISO 639-1 language code (e.g. fr, en)',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the country active?',
    },
    timezone_default: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'UTC',
      validate: {
        is: /^([A-Z][a-z]+\/[A-Za-z_]+|UTC[+-]\d{1,2}(:\d{2})?|UTC)$/,
        len: [1, 64],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Main time zone (e.g. Africa/Douala)',
    },
    phone_prefix: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        is: /^\+\d{1,5}$/, // commence par + suivi de 1 à 5 chiffres
        len: [2, 6], // min 2 ("+1") max 6 ("+99999")
        notEmpty: true,
        notNull: true,
      },
      comment: 'International dialing code (e.g. +237 for Cameroon)',
    },
  } as ModelAttributes,

  options: {
    tableName: `${G.tableConf}_country`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // paranoid: false,      // true si tu veux soft delete
    underscored: true, // snake_case pour tous les champs
    freezeTableName: true, // empêche la pluralisation
    comment: 'Country table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_country_guid',
      },
      {
        fields: ['code'],
        name: 'idx_country_iso_code',
      },
      {
        fields: ['name_en'],
        name: 'idx_country_name_en',
      },
      {
        fields: ['name_local'],
        name: 'idx_country_name_local',
      },
      {
        fields: ['default_currency_code'],
        name: 'idx_country_currency_code',
      },
      {
        fields: ['default_language_code'],
        name: 'idx_country_language_code',
      },
      {
        fields: ['active'],
        name: 'idx_country_is_active',
      },
      {
        fields: ['timezone_default'],
        name: 'idx_country_timezone_default',
      },
      {
        fields: ['phone_prefix'],
        name: 'idx_country_phone_prefix',
      },
    ],
  } as ModelOptions,

  // Méthodes de validation
  validation: {
    /**
     * Valide le code ISO 3166-1 alpha-2
     */
    validateCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[A-Z]{2}$/;
      return isoRegex.test(trimmed);
    },

    /**
     * Valide le nom du pays
     */
    validateName: (name: string): boolean => {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 128;
    },

    /**
     * Valide le fuseau horaire
     */
    validateTimezone: (timezone: string): boolean => {
      const trimmed = timezone.trim();
      // Format basique: Continent/Ville ou UTC±offset
      const timezoneRegex = /^([A-Z][a-z]+\/[A-Za-z_]+|UTC[+-]\d{1,2}(:\d{2})?|UTC)$/;
      return timezoneRegex.test(trimmed);
    },

    /**
     * Valide le code devise ISO 4217
     */
    validateCurrencyCode: (currencyCode: string): boolean => {
      const trimmed = currencyCode.trim().toUpperCase();
      const currencyRegex = /^[A-Z]{3}$/;
      return currencyRegex.test(trimmed);
    },

    validateLanguageCode: (languageCode: string): boolean => {
      const trimmed = languageCode.trim();
      const languageRegex = /^[a-z]{2}$/;
      return languageRegex.test(trimmed);
    },

    isActive: (isActive: boolean): boolean => {
      return typeof isActive === 'boolean';
    },

    validateTime: (time: string): boolean => {
      const trimmed = time.trim();
      const timeRegex = /^([A-Z][a-z]+\/[A-Za-z_]+|UTC[+-]\d{1,2}(:\d{2})?|UTC)$/;
      return timeRegex.test(trimmed);
    },

    validatePhonePrefix: (phonePrefix: string): boolean => {
      const trimmed = phonePrefix.trim();
      const phonePrefixRegex = /^\+\d{1,5}$/;
      return phonePrefixRegex.test(trimmed);
    },

    /**
     * Nettoie les données avant insertion/update
     */
    cleanData: (data: any): void => {
      if (data.code) {
        data.code = data.code.trim().toUpperCase();
      }
      if (data.name_en) {
        data.name_en = data.name_en.trim();
      }
      if (data.name_local) {
        data.name_local = data.name_local.trim();
      }
      if (data.default_currency_code) {
        data.default_currency_code = data.default_currency_code.trim().toUpperCase();
      }
      if (data.default_language_code) {
        data.default_language_code = data.default_language_code.trim().toLowerCase();
      }
      if (data.timezone_default) {
        data.timezone_default = data.timezone_default.trim();
      }
      if (data.phone_prefix) {
        data.phone_prefix = data.phone_prefix.trim();
      }
      if (data.active) {
        data.active = data.active === 'true';
      }
    },
  },
};
