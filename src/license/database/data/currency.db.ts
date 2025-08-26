import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

/**
 * Structure de la table currency
 */
export const CurrencyDbStructure = {
  tableName: `${G.tableConf}_currency`,
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
      comment: 'Currency',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_currency_guid', msg: 'Currency GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: { name: 'unique_code', msg: 'CODE must be unique' },
      validate: {
        is: /^[A-Z]{3}$/,
        len: [3, 3],
      },
      comment: 'ISO 4217 currency code (e.g. XAF, USD, EUR)',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Name (e.g. Cameroonian Franc)',
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        len: [1, 10],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Symbol (e.g. FCFA)',
    },
    decimal_places: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 2,
      validate: {
        isInt: true,
        min: 0,
        max: 10,
      },
      comment: 'Number of decimal places',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the currency active?',
    },
  } as ModelAttributes,

  options: {
    tableName: `${G.tableConf}_currency`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // paranoid: false,      // true si tu veux soft delete
    underscored: true, // snake_case pour tous les champs
    freezeTableName: true, // empêche la pluralisation
    comment: 'Currency table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_currency_guid',
      },
      {
        fields: ['code'],
        name: 'idx_currency_code',
      },
      {
        fields: ['name'],
        name: 'idx_currency_name',
      },
      {
        fields: ['symbol'],
        name: 'idx_currency_symbol',
      },
      {
        fields: ['decimal_places'],
        name: 'idx_currency_decimal_places',
      },
      {
        fields: ['active'],
        name: 'idx_currency_is_active',
      },
    ],
  } as ModelOptions,

  // Méthodes de validation
  validation: {
    validateCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[A-Z]{3}$/;
      return isoRegex.test(trimmed);
    },
    validateName: (name: string): boolean => {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 128;
    },

    validateSymbol: (symbol: string): boolean => {
      const trimmed = symbol.trim();
      return trimmed.length >= 1 && trimmed.length <= 10;
    },

    validateDecimalPlaces: (decimalPlaces: number): boolean => {
      const trimmed = decimalPlaces.toString().trim();
      const decimalPlacesRegex = /^[0-9]+$/;
      return decimalPlacesRegex.test(trimmed);
    },

    isActive: (isActive: boolean): boolean => {
      return typeof isActive === 'boolean';
    },

    /**
     * Nettoie les données avant insertion/update
     */
    cleanData: (data: any): void => {
      if (data.code) {
        data.code = data.code.trim().toUpperCase();
      }
      if (data.name) {
        data.name = data.name.trim();
      }
      if (data.symbol) {
        data.symbol = data.symbol.trim();
      }
      if (data.decimal_places) {
        data.decimal_places = data.decimal_places.trim();
      }
      if (data.active) {
        data.active = data.active === 'true';
      }
    },
  },
};
