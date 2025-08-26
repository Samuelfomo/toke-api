import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export const LicenseAdjustmentDbStructure = {
  tableName: `${G.tableAp}_license_adjustment`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'License adjustment',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        name: 'unique_license_adjustment_guid',
        msg: 'License adjustment GUID must be unique',
      },
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
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Global Licence',
    },
    adjustment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
      comment: 'Date of the adjustment',
    },
    employees_added_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Number of employees added',
    },
    months_remaining: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 99.99,
      },
      comment: 'Months remaining',
    },
    price_per_employee_usd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 99999999.99,
      },
      comment: 'Price per employee (XAF,USD,EUR, ...etc)',
    },
    subtotal_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Subtotal (USD)',
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
      comment: 'Tax amount (USD)',
    },
    total_amount_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Total amount (USD)',
    },
    billing_currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      validate: {
        is: /^[A-Z]{3}$/,
        len: [3, 3],
      },
      comment: 'Billing currency code (e.g. XAF, USD, EUR)',
    },
    exchange_rate_used: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 999999.999999,
      },
      comment: 'Exchange rate used',
    },
    subtotal_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Subtotal (local currency)',
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
      comment: 'Tax amount (local currency)',
    },
    total_amount_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Total amount (local currency)',
    },
    tax_rules_applied: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isJsonArray(value: any) {
          if (!Array.isArray(value)) {
            throw new Error('tax_rules_applied must be a JSON array with at least one element:');
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
    payment_status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
      validate: {
        isIn: {
          args: [[...Object.values(PaymentStatus)]],
          msg: 'Invalid payment status',
        },
      },
      comment: 'Payment status',
    },
    payment_due_immediately: {
      type: DataTypes.BOOLEAN,
      allowNull: false, // Toujours TRUE pour les avenants
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Payment due immediately',
    },
    invoice_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Date of the invoice sent',
    },
    payment_completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Date of the payment completion',
    },
  } as ModelAttributes,

  options: {
    tableName: `${G.tableAp}_license_adjustment`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'License adjustment table with validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_license_adjustment_guid',
      },
      {
        fields: ['global_license'],
        name: 'idx_license_adjustment_global_license',
      },
      {
        fields: ['adjustment_date'],
        name: 'idx_license_adjustment_date',
      },
      {
        fields: ['billing_currency_code'],
        name: 'idx_license_adjustment_currency_code',
      },
      {
        fields: ['payment_status'],
        name: 'idx_license_adjustment_payment_status',
      },
      {
        fields: ['payment_due_immediately'],
        name: 'idx_license_adjustment_payment_due',
      },
      {
        fields: ['invoice_sent_at'],
        name: 'idx_license_adjustment_invoice_sent_at',
      },
      {
        fields: ['payment_completed_at'],
        name: 'idx_license_adjustment_payment_completed_at',
      },
    ],
  } as ModelOptions,

  validation: {
    validateGlobalLicense: (globalLicense: number): boolean => {
      const trimmed = globalLicense.toString().trim();
      const globalLicenseRegex = /^[0-9]+$/;
      return globalLicenseRegex.test(trimmed) && globalLicense >= 1;
    },

    validateAdjustmentDate: (value: Date): boolean => {
      return !isNaN(new Date(value).getTime());
    },

    validateEmployeesAddedCount: (count: number): boolean => {
      return Number.isInteger(count) && count >= 1;
    },

    validateMonthsRemaining: (months: number): boolean => {
      return months >= 0 && months <= 99.99;
    },

    validatePricePerEmployeeUsd: (price: number): boolean => {
      return price >= 0 && price <= 99999999.99;
    },

    validateSubtotalUsd: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateTaxAmountUsd: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateTotalAmountUsd: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateBillingCurrencyCode: (currencyCode: string): boolean => {
      const trimmed = currencyCode.trim();
      const currencyRegex = /^[A-Z]{3}$/;
      return currencyRegex.test(trimmed);
    },

    validateExchangeRateUsed: (rate: number): boolean => {
      return rate >= 0 && rate <= 999999.999999;
    },

    validateSubtotalLocal: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateTaxAmountLocal: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateTotalAmountLocal: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateTaxRulesApplied: (taxRules: any[]): boolean => {
      if (!Array.isArray(taxRules)) return false;

      return taxRules.every((rule: any, index: number) => {
        if (typeof rule !== 'object' || rule === null) return false;
        if (!rule.hasOwnProperty('rate') || typeof rule.rate !== 'number') return false;
        return rule.rate >= 0 && rule.rate <= 1; // Taux entre 0 et 100%
      });
    },

    validatePaymentStatus: (paymentStatus: string): boolean => {
      return Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus);
    },

    validateInvoiceSentAt: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },

    validatePaymentCompletedAt: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },

    // Validations logiques métier
    validateAmountCalculation: (data: {
      employees_added_count: number;
      months_remaining: number;
      price_per_employee_usd: number;
      subtotal_usd: number;
    }): boolean => {
      const calculatedSubtotal =
        data.employees_added_count * data.months_remaining * data.price_per_employee_usd;
      const tolerance = 0.01;
      return Math.abs(calculatedSubtotal - data.subtotal_usd) <= tolerance;
    },

    validateTotalCalculation: (data: {
      subtotal_usd: number;
      tax_amount_usd: number;
      total_amount_usd: number;
    }): boolean => {
      const calculatedTotal = data.subtotal_usd + data.tax_amount_usd;
      const tolerance = 0.01;
      return Math.abs(calculatedTotal - data.total_amount_usd) <= tolerance;
    },

    validateLocalAmountsConsistency: (data: {
      subtotal_usd: number;
      tax_amount_usd: number;
      total_amount_usd: number;
      exchange_rate_used: number;
      subtotal_local: number;
      tax_amount_local: number;
      total_amount_local: number;
    }): boolean => {
      const tolerance = 0.01;
      const calculatedSubtotalLocal = data.subtotal_usd * data.exchange_rate_used;
      const calculatedTaxLocal = data.tax_amount_usd * data.exchange_rate_used;
      const calculatedTotalLocal = data.total_amount_usd * data.exchange_rate_used;

      return (
        Math.abs(calculatedSubtotalLocal - data.subtotal_local) <= tolerance &&
        Math.abs(calculatedTaxLocal - data.tax_amount_local) <= tolerance &&
        Math.abs(calculatedTotalLocal - data.total_amount_local) <= tolerance
      );
    },

    validatePaymentCompletedAfterInvoice: (
      invoice_sent_at: Date | null,
      payment_completed_at: Date | null,
    ): boolean => {
      if (invoice_sent_at == null || payment_completed_at == null) return true;
      return new Date(payment_completed_at).getTime() >= new Date(invoice_sent_at).getTime();
    },

    validatePaymentCompletedAfterAdjustment: (
      adjustment_date: Date,
      payment_completed_at: Date | null,
    ): boolean => {
      if (payment_completed_at == null) return true;
      return new Date(payment_completed_at).getTime() >= new Date(adjustment_date).getTime();
    },

    // Validation globale du modèle
    validateAdjustmentModel: (data: any): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Vérification calcul subtotal
      if (
        data.employees_added_count &&
        data.months_remaining &&
        data.price_per_employee_usd &&
        data.subtotal_usd
      ) {
        const calculatedSubtotal =
          data.employees_added_count * data.months_remaining * data.price_per_employee_usd;
        const tolerance = 0.01;
        if (Math.abs(calculatedSubtotal - data.subtotal_usd) > tolerance) {
          errors.push(
            'Subtotal calculation error: employees_added_count * months_remaining * price_per_employee_usd must equal subtotal_usd (±0.01)',
          );
        }
      }

      // Vérification calcul total USD
      if (data.subtotal_usd && data.tax_amount_usd && data.total_amount_usd) {
        const calculatedTotal = data.subtotal_usd + data.tax_amount_usd;
        const tolerance = 0.01;
        if (Math.abs(calculatedTotal - data.total_amount_usd) > tolerance) {
          errors.push(
            'Total calculation error: subtotal_usd + tax_amount_usd must equal total_amount_usd (±0.01)',
          );
        }
      }

      // Vérification cohérence montants locaux
      if (
        data.exchange_rate_used &&
        data.subtotal_usd &&
        data.tax_amount_usd &&
        data.total_amount_usd &&
        data.subtotal_local &&
        data.tax_amount_local &&
        data.total_amount_local
      ) {
        const tolerance = 0.01;
        const calculatedSubtotalLocal = data.subtotal_usd * data.exchange_rate_used;
        const calculatedTaxLocal = data.tax_amount_usd * data.exchange_rate_used;
        const calculatedTotalLocal = data.total_amount_usd * data.exchange_rate_used;

        if (Math.abs(calculatedSubtotalLocal - data.subtotal_local) > tolerance) {
          errors.push(
            'Local subtotal inconsistency: subtotal_usd * exchange_rate_used must equal subtotal_local (±0.01)',
          );
        }
        if (Math.abs(calculatedTaxLocal - data.tax_amount_local) > tolerance) {
          errors.push(
            'Local tax inconsistency: tax_amount_usd * exchange_rate_used must equal tax_amount_local (±0.01)',
          );
        }
        if (Math.abs(calculatedTotalLocal - data.total_amount_local) > tolerance) {
          errors.push(
            'Local total inconsistency: total_amount_usd * exchange_rate_used must equal total_amount_local (±0.01)',
          );
        }
      }

      // Vérification dates logiques
      if (data.adjustment_date && data.payment_completed_at) {
        if (
          new Date(data.payment_completed_at).getTime() < new Date(data.adjustment_date).getTime()
        ) {
          errors.push('payment_completed_at must be after adjustment_date');
        }
      }

      if (data.invoice_sent_at && data.payment_completed_at) {
        if (
          new Date(data.payment_completed_at).getTime() < new Date(data.invoice_sent_at).getTime()
        ) {
          errors.push('payment_completed_at must be after invoice_sent_at');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },

    cleanData: (data: any): void => {
      if (data.guid) {
        data.guid = parseInt(data.guid.toString().trim());
      }
      if (data.global_license) {
        data.global_license = parseInt(data.global_license.toString().trim());
      }
      if (data.adjustment_date) {
        data.adjustment_date = new Date(data.adjustment_date);
      }
      if (data.employees_added_count) {
        data.employees_added_count = parseInt(data.employees_added_count.toString().trim());
      }
      if (data.months_remaining) {
        data.months_remaining = parseFloat(data.months_remaining.toString());
      }
      if (data.price_per_employee_usd) {
        data.price_per_employee_usd = parseFloat(data.price_per_employee_usd.toString());
      }
      if (data.subtotal_usd) {
        data.subtotal_usd = parseFloat(data.subtotal_usd.toString());
      }
      if (data.tax_amount_usd) {
        data.tax_amount_usd = parseFloat(data.tax_amount_usd.toString());
      }
      if (data.total_amount_usd) {
        data.total_amount_usd = parseFloat(data.total_amount_usd.toString());
      }
      if (data.billing_currency_code) {
        data.billing_currency_code = data.billing_currency_code.trim().toUpperCase();
      }
      if (data.exchange_rate_used) {
        data.exchange_rate_used = parseFloat(data.exchange_rate_used.toString());
      }
      if (data.subtotal_local) {
        data.subtotal_local = parseFloat(data.subtotal_local.toString());
      }
      if (data.tax_amount_local) {
        data.tax_amount_local = parseFloat(data.tax_amount_local.toString());
      }
      if (data.total_amount_local) {
        data.total_amount_local = parseFloat(data.total_amount_local.toString());
      }
      if (data.payment_status) {
        data.payment_status = data.payment_status.trim().toUpperCase();
      }
      if (data.invoice_sent_at) {
        data.invoice_sent_at = new Date(data.invoice_sent_at);
      }
      if (data.payment_completed_at) {
        data.payment_completed_at = new Date(data.payment_completed_at);
      }
    },
  },
};
