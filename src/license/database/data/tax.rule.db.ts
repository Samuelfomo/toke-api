import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

export const TaxRuleDbStructure = {
  tableName: `${G.tableConf}_tax_rule`,
  attributes: {
    id: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Tax rule',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_tax_rule_guid', msg: 'Tax rule GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    country_code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      references: {
        model: `${G.tableConf}_country`,
        key: 'code',
      },
      validate: {
        is: /^[A-Z]{2}$/,
        len: [2, 2],
      },
      comment: 'ISO 3166-1 alpha-2 code (2 capital letters, e.g. CM)',
    },
    tax_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        is: /^[a-zA-Z0-9_]{1,20}$/,
        len: [1, 20],
      },
      comment: 'Tax type (e.g. TVA, TVA_Hors_Socio)',
    },
    tax_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Tax name (e.g. TVA)',
    },
    tax_rate: {
      type: DataTypes.DECIMAL(6, 4), // 0.1925 pour 19.25%
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 1,
      },
      comment: 'Tax rate',
    },
    applies_to: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'license_fee',
      validate: {
        is: /^[a-zA-Z0-9_]{1,20}$/,
        len: [1, 20],
      },
      comment: 'Applies to (e.g. license_fee, adjustment)',
    },
    required_tax_number: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the tax number required?',
    },
    effective_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
      comment: 'Effective date',
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Expiry date',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the tax rule active?',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableConf}_tax_rule`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // paranoid: false,      // true si tu veux soft delete
    underscored: true, // snake_case pour tous les champs
    freezeTableName: true, // empêche la pluralisation
    comment: 'Tax rule table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_tax_rule_guid',
      },
      {
        fields: ['country_code'],
        name: 'idx_tax_rule_country_code',
      },
      {
        fields: ['tax_type'],
        name: 'idx_tax_rule_tax_type',
      },
      {
        fields: ['tax_name'],
        name: 'idx_tax_rule_tax_name',
      },
      {
        fields: ['tax_rate'],
        name: 'idx_tax_rule_tax_rate',
      },
      {
        fields: ['applies_to'],
        name: 'idx_tax_rule_applies_to',
      },
      {
        fields: ['required_tax_number'],
        name: 'idx_tax_rule_required_tax_number',
      },
      {
        fields: ['effective_date'],
        name: 'idx_tax_rule_effective_date',
      },
      {
        fields: ['expiry_date'],
        name: 'idx_tax_rule_expiry_date',
      },
      {
        fields: ['active'],
        name: 'idx_tax_rule_is_active',
      },
      // {
      //   fields: ['created_at'],
      //   name: 'idx_tax_rule_created_at',
      // }
    ],
  } as ModelOptions,

  validation: {
    validateCountryCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[A-Z]{2}$/;
      return isoRegex.test(trimmed);
    },
    validateTaxType: (taxType: string): boolean => {
      const trimmed = taxType.trim();
      const taxTypeRegex = /^[a-zA-Z0-9_]{1,20}$/;
      return taxTypeRegex.test(trimmed);
    },
    validateTaxName: (taxName: string): boolean => {
      const trimmed = taxName.trim();
      return trimmed.length >= 2 && trimmed.length <= 50;
    },
    // validateTaxRate: (taxRate: string): boolean => {
    //   const trimmed = taxRate.trim();
    //   const taxRateRegex = /^[0-9]+(\.[0-9]{1,4})?$/;
    //   return taxRateRegex.test(trimmed);
    // },
    validateTaxRate: (taxRate: number | string): boolean => {
      const rate = typeof taxRate === 'string' ? parseFloat(taxRate) : taxRate;
      return !isNaN(rate) && rate >= 0 && rate <= 1;
    },
    validateAppliesTo: (appliesTo: string): boolean => {
      const trimmed = appliesTo.trim();
      const appliesToRegex = /^[a-zA-Z0-9_]{1,20}$/;
      return appliesToRegex.test(trimmed);
    },
    validateBoolean(value: boolean): boolean {
      return typeof value === 'boolean';
    },
    validateDate: (date: Date | string): boolean => {
      const d = new Date(date);
      return d instanceof Date && !isNaN(d.getTime());
    },

    cleanData: (data: any): void => {
      if (data.country_code) {
        data.country_code = data.country_code.trim().toUpperCase();
      }
      if (data.tax_type) {
        data.tax_type = data.tax_type.trim();
      }
      if (data.tax_name) {
        data.tax_name = data.tax_name.trim();
      }
      if (data.tax_rate) {
        data.tax_rate = data.tax_rate.trim();
      }
      if (data.applies_to) {
        data.applies_to = data.applies_to.trim();
      }
      if (data.required_tax_number !== undefined) {
        data.required_tax_number =
          data.required_tax_number === true || data.required_tax_number === 'true';
      }
      if (data.effective_date) {
        data.effective_date = new Date(data.effective_date);
      }
      if (data.expiry_date) {
        data.expiry_date = new Date(data.expiry_date);
      }
      if (data.active) {
        data.active = data.active === 'true';
      }
    },
  },
};
