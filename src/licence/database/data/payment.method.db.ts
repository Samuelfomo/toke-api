import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

export const PaymentMethodDbStructure = {
  tableName: `${G.tableAp}_payment_method`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Payment method',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_payment_method_guid', msg: 'Payment method GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: { name: 'unique_code', msg: 'CODE must be unique' },
      validate: {
        is: /^[a-zA-Z0-9_]{1,20}$/,
        len: [1, 20],
      },
      comment:
        'Payment method code (e.g. CASH, CARD, CHECK, MTN_MOMO, ORANGE_MONEY, STRIPE, BANK_TRANSFER)',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Payment method name (e.g. MTN Mobile Money, Orange Money)',
    },
    method_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^[a-zA-Z0-9_]{1,20}$/,
        len: [1, 20],
      },
      comment:
        'Payment method type (e.g. CASH, CARD, CHECK, MTN_MOMO, ORANGE_MONEY, STRIPE, BANK_TRANSFER)',
    },
    supported_currencies: {
      type: DataTypes.ARRAY(DataTypes.STRING(3)),
      allowNull: true,
      validate: {
        isCurrencyArray(value: string[] | null) {
          if (!value) return; // nullable
          if (!Array.isArray(value)) {
            throw new Error('supported_currencies must be an array');
          }
          for (const curr of value) {
            if (!/^[A-Z]{3}$/.test(curr)) {
              throw new Error('Each supported currency must be a 3-letter uppercase code');
            }
          }
        },
      },
      comment: 'Supported currencies (e.g. XAF, USD, EUR)',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the payment method active?',
    },
    processing_fee_rate: {
      type: DataTypes.DECIMAL(6, 4),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: true,
        min: 0,
        max: 99.9999,
      },
      comment: 'Processing fee rate',
    },
    min_amount_usd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.0,
      validate: {
        isDecimal: true,
        min: 0, // 1.0 selon le contexte
        max: 99999999.99,
      },
      comment: 'Minimum amount in USD',
    },
    max_amount_usd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 99999999.99,
      },
      comment: 'Maximum amount in USD',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableAp}_payment_method`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'Payment method table with validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_payment_method_guid',
      },
      {
        fields: ['code'],
        name: 'idx_payment_method_code',
      },
      {
        fields: ['name'],
        name: 'idx_payment_method_name',
      },
      {
        fields: ['method_type'],
        name: 'idx_payment_method_method_type',
      },
      {
        fields: ['supported_currencies'],
        name: 'idx_payment_method_supported_currencies',
      },
    ],
  } as ModelOptions,

  validation: {
    validateCode: (code: string): boolean => {
      const trimmed = code.trim();
      const codeRegex = /^[a-zA-Z0-9_]{1,20}$/;
      return codeRegex.test(trimmed);
    },

    validateName: (name: string): boolean => {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 50 && trimmed !== '';
    },

    validateMethodType: (methodType: string): boolean => {
      const trimmed = methodType.trim();
      const methodTypeRegex = /^[a-zA-Z0-9_]{1,20}$/;
      return methodTypeRegex.test(trimmed);
    },

    validateSupportedCurrencies: (currencies: string[] | null | undefined): boolean => {
      if (currencies == null) return true;
      if (!Array.isArray(currencies)) return false;

      for (const curr of currencies) {
        if (!/^[A-Z]{3}$/.test(curr)) {
          return false;
        }
      }
      return true;
    },

    validateProcessingFeeRate: (rate: number): boolean => {
      return rate >= 0 && rate <= 99.9999;
    },

    validateMinAmountUsd: (amount: number): boolean => {
      return amount >= 0 && amount <= 99999999.99;
    },

    validateMaxAmountUsd: (amount: number): boolean => {
      return amount >= 0 && amount <= 99999999.99;
    },

    cleanData: (data: any): void => {
      if (data.guid) {
        data.guid = parseInt(data.guid.toString().trim());
      }
      if (data.code) {
        data.code = data.code.trim().toUpperCase();
      }
      if (data.name) {
        data.name = data.name.trim();
      }
      if (data.method_type) {
        data.method_type = data.method_type.trim().toUpperCase();
      }
      if (data.supported_currencies && Array.isArray(data.supported_currencies)) {
        data.supported_currencies = data.supported_currencies.map((curr: string) =>
          curr.trim().toUpperCase(),
        );
      }
      if (data.processing_fee_rate) {
        data.processing_fee_rate = parseFloat(data.processing_fee_rate.toString());
      }
      if (data.min_amount_usd) {
        data.min_amount_usd = parseFloat(data.min_amount_usd.toString());
      }
      if (data.max_amount_usd) {
        data.max_amount_usd = parseFloat(data.max_amount_usd.toString());
      }
    },
  },
};
