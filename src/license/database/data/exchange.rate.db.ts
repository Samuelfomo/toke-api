import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

export const ExchangeRateDbStructure = {
  tableName: `${G.tableConf}_exchange_rate`,
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
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_exchange_rate_guid', msg: 'Exchange rate GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    from_currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      references: {
        model: `${G.tableConf}_currency`,
        key: 'code',
      },
      validate: {
        is: /^[A-Z]{3}$/,
        len: [3, 3],
      },
      comment: 'ISO 4217 currency code (e.g. XAF, USD, EUR)',
    },
    to_currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      references: {
        model: `${G.tableConf}_currency`,
        key: 'code',
      },
      validate: {
        is: /^[A-Z]{3}$/,
        len: [3, 3],
      },
      comment: 'ISO 4217 currency code (e.g. XAF, USD, EUR)',
    },
    exchange_rate: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 1,
        max: 999999.999999,
      },
      comment: 'Exchange rate',
    },
    current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the exchange rate current?',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'User ID of the creator',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableConf}_exchange_rate`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // paranoid: false,      // true si tu veux soft delete
    underscored: true, // snake_case pour tous les champs
    freezeTableName: true, // empêche la pluralisation
    comment: 'Exchange rate table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_exchange_rate_guid',
      },
      {
        fields: ['from_currency_code'],
        name: 'idx_exchange_rate_from_currency_code',
      },
      {
        fields: ['to_currency_code'],
        name: 'idx_exchange_rate_to_currency_code',
      },
      {
        fields: ['exchange_rate'],
        name: 'idx_exchange_rate_exchange_rate',
      },
      {
        fields: ['current'],
        name: 'idx_exchange_rate_is_current',
      },
      {
        fields: ['created_by'],
        name: 'idx_exchange_rate_created_by',
      },
    ],
  } as ModelOptions,

  validation: {
    validateFromCurrencyCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[A-Z]{3}$/;
      return isoRegex.test(trimmed);
    },
    validateToCurrencyCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[A-Z]{3}$/;
      return isoRegex.test(trimmed);
    },
    validateExchangeRate(rate: number): boolean {
      const trimmed = rate.toString().trim();
      const rateRegex = /^[0-9]+(\.[0-9]{1,6})?$/;
      return rateRegex.test(trimmed) && parseFloat(trimmed) > 0;
    },
    isCurrent(current: boolean): boolean {
      return typeof current === 'boolean';
      // const trimmed = current.toString().trim();
      // const isCurrentRegex = /^(true|false)$/;
      // return isCurrentRegex.test(trimmed);
    },
    validateCreatedBy(id: number): boolean {
      const trimmed = id.toString().trim();
      const idRegex = /^[0-9]+$/;
      return idRegex.test(trimmed);
    },

    cleanData: (data: any): void => {
      if (data.from_currency_code) {
        data.from_currency_code = data.from_currency_code.trim().toUpperCase();
      }
      if (data.to_currency_code) {
        data.to_currency_code = data.to_currency_code.trim().toUpperCase();
      }
      if (data.exchange_rate) {
        data.exchange_rate = data.exchange_rate.trim();
      }
      if (data.current) {
        data.current = data.current === 'true';
      }
      if (data.created_by) {
        data.created_by = data.created_by.trim();
      }
    },
  },
};
