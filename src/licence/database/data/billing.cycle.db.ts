import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

export enum BillingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export const BillingCycleDbStructure = {
  tableName: `${G.tableAp}_billing_cycle`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Billing cycle',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_billing_cycle_guid', msg: 'Billing cycle GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    global_license: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: `${G.tableAp}_global_license`,
        key: 'id',
      },
      comment: 'Global license',
    },
    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
      comment: 'Start date of the billing cycle',
    },
    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterPeriodStart(value: Date) {
          if (this.period_start && value <= this.period_start) {
            throw new Error('Period end must be after period start');
          }
        },
      },
      comment: 'End date of the billing cycle',
    },
    base_employee_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Base employee count',
    },
    final_employee_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Final employee count',
    },
    base_amount_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Base amount in USD',
    },
    adjustments_amount_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Adjustments amount in USD (can be negative)',
    },
    subtotal_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Subtotal in USD',
    },
    tax_amount_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Tax amount in USD',
    },
    total_amount_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
        isCorrectTotal() {
          const subtotal = parseFloat(this.subtotal_usd?.toString() || '0');
          const tax = parseFloat(this.tax_amount_usd?.toString() || '0');
          const total = parseFloat(this.total_amount_usd?.toString() || '0');

          if (Math.abs(total - (subtotal + tax)) > 0.01) {
            throw new Error('Total amount must equal subtotal + tax amount');
          }
        },
      },
      comment: 'Total amount in USD',
    },
    billing_currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        is: /^[A-Z]{3}$/,
        len: [3, 3],
        // Validation basique du format ISO 4217 uniquement
        // La validation métier des devises supportées doit se faire au niveau service
      },
      comment: 'ISO 4217 currency code (e.g. XAF, USD, EUR)',
    },
    exchange_rate_used: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0.000001, // Éviter division par zéro
        max: 999999.999999,
      },
      comment: 'Exchange rate used',
    },
    base_amount_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Base amount in local currency',
    },
    adjustments_amount_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Adjustments amount in local currency (can be negative)',
    },
    subtotal_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
        isCorrectSubtotal() {
          const base = parseFloat(this.base_amount_local?.toString() || '0');
          const adjustments = parseFloat(this.adjustments_amount_local?.toString() || '0');
          const subtotal = parseFloat(this.subtotal_local?.toString() || '0');

          if (Math.abs(subtotal - (base + adjustments)) > 0.01) {
            throw new Error('Local subtotal must equal base amount + adjustments');
          }
        },
      },
      comment: 'Subtotal in local currency',
    },
    tax_amount_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Tax amount in local currency',
    },
    total_amount_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
        isCorrectTotalLocal() {
          const subtotal = parseFloat(this.subtotal_local?.toString() || '0');
          const tax = parseFloat(this.tax_amount_local?.toString() || '0');
          const total = parseFloat(this.total_amount_local?.toString() || '0');

          if (Math.abs(total - (subtotal + tax)) > 0.01) {
            throw new Error('Local total amount must equal subtotal + tax amount');
          }
        },
      },
      comment: 'Total amount in local currency',
    },
    tax_rules_applied: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isJsonArray(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('tax_rules_applied must be a JSON array');
          }
          // Validation plus stricte de la structure des règles de taxe
          value.forEach((rule: any, index: number) => {
            if (typeof rule !== 'object' || rule === null) {
              throw new Error(`Tax rule at index ${index} must be an object`);
            }
            if (!rule.hasOwnProperty('rate') || typeof rule.rate !== 'number') {
              throw new Error(`Tax rule at index ${index} must have a numeric rate`);
            }
          });
        },
      },
      comment: 'Tax rules applied',
    },
    billing_status: {
      type: DataTypes.ENUM(...Object.values(BillingStatus)),
      allowNull: false,
      defaultValue: BillingStatus.PENDING,
      validate: {
        isIn: {
          args: [[...Object.values(BillingStatus)]],
          msg: 'Invalid billing status',
        },
      },
      comment: 'Billing status',
    },
    invoice_generated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isRequiredForCompleted() {
          if (this.billing_status === BillingStatus.COMPLETED && !this.invoice_generated_at) {
            throw new Error('Invoice generated date is required when billing status is COMPLETED');
          }
        },
      },
      comment: 'Date of the invoice generation',
    },
    payment_due_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterPeriodEnd(value: Date) {
          if (this.period_end && value <= this.period_end) {
            throw new Error('Payment due date must be after period end');
          }
        },
      },
      comment: 'Payment due date',
    },
    payment_completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        isRequiredForCompleted() {
          if (this.billing_status === BillingStatus.COMPLETED && !this.payment_completed_at) {
            throw new Error('Payment completed date is required when billing status is COMPLETED');
          }
        },
        isBeforeDueDate(value: Date) {
          if (value && this.payment_due_date && value > this.payment_due_date) {
            // Avertissement plutôt qu'erreur pour les paiements en retard
            console.warn('Payment was completed after due date');
          }
        },
      },
      comment: 'Date of the payment completion',
    },
  } as ModelAttributes,

  options: {
    tableName: `${G.tableAp}_billing_cycle`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'Billing cycle table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_billing_cycle_guid',
        unique: true,
      },
      {
        fields: ['global_license'],
        name: 'idx_billing_cycle_global_license',
      },
      {
        fields: ['period_start', 'period_end'],
        name: 'idx_billing_cycle_period',
      },
      {
        fields: ['billing_status'],
        name: 'idx_billing_cycle_billing_status',
      },
      {
        fields: ['payment_due_date'],
        name: 'idx_billing_cycle_payment_due_date',
      },
      {
        fields: ['billing_currency_code'],
        name: 'idx_billing_cycle_billing_currency_code',
      },
      // Index composite pour les requêtes de recherche courantes
      {
        fields: ['global_license', 'billing_status'],
        name: 'idx_billing_cycle_license_status',
      },
      {
        fields: ['period_start', 'billing_status'],
        name: 'idx_billing_cycle_period_status',
      },
    ],

    // Validation au niveau du modèle
    validate: {
      periodDatesLogical() {
        if (this.period_start && this.period_end && this.period_start >= this.period_end) {
          throw new Error('Period start must be before period end');
        }
      },

      paymentDueDateLogical() {
        if (this.payment_due_date && this.period_end && this.payment_due_date <= this.period_end) {
          throw new Error('Payment due date must be after period end');
        }
      },

      currencyConsistency() {
        if (this.billing_currency_code === 'USD' && this.exchange_rate_used !== 1) {
          throw new Error('Exchange rate must be 1 when billing currency is USD');
        }
      },

      amountConsistency() {
        // Vérification de la cohérence entre USD et local
        const baseUsd = parseFloat(this.base_amount_usd?.toString() || '0');
        const baseLocal = parseFloat(this.base_amount_local?.toString() || '0');
        const exchangeRate = parseFloat(this.exchange_rate_used?.toString() || '1');

        const expectedLocal = baseUsd * exchangeRate;
        if (Math.abs(baseLocal - expectedLocal) > 0.01) {
          throw new Error(
            'Base amount local currency inconsistent with USD amount and exchange rate',
          );
        }
      },

      statusDependentFields() {
        if (this.billing_status === BillingStatus.COMPLETED) {
          if (!this.invoice_generated_at) {
            throw new Error('Invoice generated date is required for completed billing cycles');
          }
          if (!this.payment_completed_at) {
            throw new Error('Payment completed date is required for completed billing cycles');
          }
        }

        if (this.billing_status === BillingStatus.OVERDUE) {
          const now = new Date();
          if (!this.payment_due_date || this.payment_due_date >= now) {
            throw new Error('Billing cycle can only be OVERDUE if payment due date has passed');
          }
        }
      },
    },
  } as ModelOptions,

  validation: {
    // Validation des formats d'entrée (pour les données string)
    validateGuid(guid: string): boolean {
      const trimmed = guid.trim();
      const guidRegex = /^\d+$/;
      const num = parseInt(trimmed);
      return guidRegex.test(trimmed) && num >= 100000;
    },

    validateGlobalLicense(globalLicense: string): boolean {
      const trimmed = globalLicense.trim();
      return /^\d+$/.test(trimmed) && parseInt(trimmed) > 0;
    },

    validateDateFormat(dateStr: string): boolean {
      const trimmed = dateStr.trim();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(trimmed)) return false;

      const date = new Date(trimmed);
      return date instanceof Date && !isNaN(date.getTime());
    },

    validateDateTimeFormat(dateTimeStr: string): boolean {
      const trimmed = dateTimeStr.trim();
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!dateTimeRegex.test(trimmed)) return false;

      const date = new Date(trimmed);
      return date instanceof Date && !isNaN(date.getTime());
    },

    validatePositiveInteger(value: string): boolean {
      const trimmed = value.trim();
      const regex = /^\d+$/;
      return regex.test(trimmed) && parseInt(trimmed) >= 0;
    },

    validateDecimalAmount(value: string): boolean {
      const trimmed = value.trim();
      const regex = /^\d+(\.\d{1,2})?$/;
      return regex.test(trimmed) && parseFloat(trimmed) >= 0;
    },

    validateSignedDecimalAmount(value: string): boolean {
      const trimmed = value.trim();
      const regex = /^-?\d+(\.\d{1,2})?$/;
      return regex.test(trimmed);
    },

    validateCurrencyCode(currencyCode: string): boolean {
      const trimmed = currencyCode.trim().toUpperCase();
      const regex = /^[A-Z]{3}$/;
      // Validation basique du format ISO 4217 uniquement
      // La validation des devises supportées doit se faire au niveau service/configuration
      return regex.test(trimmed);
    },

    validateExchangeRate(rate: string): boolean {
      const trimmed = rate.trim();
      const regex = /^\d+(\.\d{1,6})?$/;
      return regex.test(trimmed) && parseFloat(trimmed) > 0;
    },

    validateJsonArray(jsonStr: string): boolean {
      try {
        const parsed = JSON.parse(jsonStr.trim());
        return Array.isArray(parsed);
      } catch {
        return false;
      }
    },

    validateBillingStatus(status: string): boolean {
      const trimmed = status.trim().toUpperCase();
      return Object.values(BillingStatus).includes(trimmed as BillingStatus);
    },

    // Nettoyage et transformation des données
    cleanData(data: any): void {
      // Normalisation des chaînes
      if (data.billing_currency_code) {
        data.billing_currency_code = data.billing_currency_code.toString().trim().toUpperCase();
      }

      if (data.billing_status) {
        data.billing_status = data.billing_status.toString().trim().toUpperCase();
      }

      // Parsing des JSON
      if (data.tax_rules_applied && typeof data.tax_rules_applied === 'string') {
        try {
          data.tax_rules_applied = JSON.parse(data.tax_rules_applied);
        } catch (error) {
          throw new Error('Invalid JSON format for tax_rules_applied');
        }
      }

      // Conversion des dates
      const dateFields = ['period_start', 'period_end', 'payment_due_date'];
      const dateTimeFields = ['invoice_generated_at', 'payment_completed_at'];

      dateFields.forEach((field) => {
        if (data[field] && typeof data[field] === 'string') {
          const date = new Date(data[field]);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format for ${field}`);
          }
          data[field] = date;
        }
      });

      dateTimeFields.forEach((field) => {
        if (data[field] && typeof data[field] === 'string') {
          const date = new Date(data[field]);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid datetime format for ${field}`);
          }
          data[field] = date;
        }
      });

      // Conversion des nombres
      const integerFields = [
        'guid',
        'global_license',
        'base_employee_count',
        'final_employee_count',
      ];
      const decimalFields = [
        'base_amount_usd',
        'adjustments_amount_usd',
        'subtotal_usd',
        'tax_amount_usd',
        'total_amount_usd',
        'base_amount_local',
        'adjustments_amount_local',
        'subtotal_local',
        'tax_amount_local',
        'total_amount_local',
        'exchange_rate_used',
      ];

      integerFields.forEach((field) => {
        if (data[field] !== undefined && data[field] !== null) {
          const parsed = parseInt(data[field].toString());
          if (isNaN(parsed)) {
            throw new Error(`Invalid integer value for ${field}`);
          }
          data[field] = parsed;
        }
      });

      decimalFields.forEach((field) => {
        if (data[field] !== undefined && data[field] !== null) {
          const parsed = parseFloat(data[field].toString());
          if (isNaN(parsed)) {
            throw new Error(`Invalid decimal value for ${field}`);
          }
          data[field] = parsed;
        }
      });
    },
  },
};
