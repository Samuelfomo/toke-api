import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export const PaymentTransactionDbStructure = {
  tableName: `${G.tableAp}_payment_transaction`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Payment transaction',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        name: 'unique_payment_transaction_guid',
        msg: 'Payment transaction GUID must be unique',
      },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    billing_cycle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: `${G.tableAp}_billing_cycle`,
        key: 'id',
      },
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Billing cycle',
    },
    adjustment: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: `${G.tableAp}_license_adjustment`,
        key: 'id',
      },
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Adjustment',
    },
    amount_usd: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Amount in USD',
    },
    amount_local: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Amount in local currency',
    },
    currency_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      // references: {
      //   model: `${G.tableAp}_currency`,
      //   key: 'code',
      // },
      validate: {
        is: /^[A-Z]{3}$/,
        len: [3, 3],
      },
      comment: 'Currency code',
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
    payment_method: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: `${G.tableAp}_payment_method`,
        key: 'id',
      },
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Payment method',
    },
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Payment reference',
    },
    transaction_status: {
      type: DataTypes.ENUM(...Object.values(PaymentTransactionStatus)),
      allowNull: false,
      defaultValue: PaymentTransactionStatus.PENDING,
      validate: {
        isIn: {
          args: [Object.values(PaymentTransactionStatus)],
          msg: 'Invalid transaction status',
        },
      },
      comment: 'Transaction status',
    },
    initiated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
      comment: 'Date and time when the transaction was initiated',
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Date and time when the transaction was completed',
    },
    failed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Date and time when the transaction failed',
    },
    failure_reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [1, 500],
      },
      comment: 'Reason for the failure',
    },
  } as ModelAttributes,

  options: {
    tableName: `${G.tableAp}_payment_transaction`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'Payment transaction table with validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_payment_transaction_guid',
      },
      {
        fields: ['billing_cycle'],
        name: 'idx_payment_transaction_billing_cycle',
      },
      {
        fields: ['adjustment'],
        name: 'idx_payment_transaction_adjustment',
      },
      {
        fields: ['currency_code'],
        name: 'idx_payment_transaction_currency_code',
      },
      {
        fields: ['payment_method'],
        name: 'idx_payment_transaction_payment_method',
      },
      {
        fields: ['payment_reference'],
        name: 'idx_payment_transaction_payment_reference',
      },
      {
        fields: ['transaction_status'],
        name: 'idx_payment_transaction_status',
      },
      {
        fields: ['initiated_at'],
        name: 'idx_payment_transaction_initiated_at',
      },
      {
        fields: ['completed_at'],
        name: 'idx_payment_transaction_completed_at',
      },
      {
        fields: ['failed_at'],
        name: 'idx_payment_transaction_failed_at',
      },
    ],
  } as ModelOptions,

  validation: {
    validateBillingCycle: (billingCycle: number): boolean => {
      const trimmed = billingCycle.toString().trim();
      const billingCycleRegex = /^[0-9]+$/;
      return billingCycleRegex.test(trimmed) && billingCycle >= 1;
    },

    validateAdjustment: (adjustment: number): boolean => {
      const trimmed = adjustment.toString().trim();
      const adjustmentRegex = /^[0-9]+$/;
      return adjustmentRegex.test(trimmed) && adjustment >= 1;
    },

    validateAmountUsd: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateAmountLocal: (amount: number): boolean => {
      return amount >= 0 && amount <= 9999999999.99;
    },

    validateCurrencyCode: (currencyCode: string): boolean => {
      const trimmed = currencyCode.trim();
      const currencyRegex = /^[A-Z]{3}$/;
      return currencyRegex.test(trimmed);
    },

    validateExchangeRateUsed: (rate: number): boolean => {
      return rate >= 0 && rate <= 999999.999999;
    },

    validatePaymentMethod: (paymentMethod: number): boolean => {
      const trimmed = paymentMethod.toString().trim();
      const paymentMethodRegex = /^[0-9]+$/;
      return paymentMethodRegex.test(trimmed) && paymentMethod >= 1;
    },

    validatePaymentReference: (paymentReference: string): boolean => {
      const trimmed = paymentReference.trim();
      return trimmed.length >= 1 && trimmed.length <= 100 && trimmed !== '';
    },

    validateTransactionStatus: (transactionStatus: string): boolean => {
      return Object.values(PaymentTransactionStatus).includes(
        transactionStatus as PaymentTransactionStatus,
      );
    },

    validateInitiatedAt: (value: Date): boolean => {
      return !isNaN(new Date(value).getTime());
    },

    validateCompletedAt: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },

    validateFailedAt: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },

    validateFailureReason: (failureReason: string | null | undefined): boolean => {
      if (failureReason == null) return true;
      const trimmed = failureReason.trim();
      return trimmed.length >= 1 && trimmed.length <= 500;
    },

    // Validations logiques supplémentaires à ajouter dans la section validation

    validateAmountConsistency: (data: {
      amount_usd: number;
      exchange_rate_used: number;
      amount_local: number;
    }): boolean => {
      const calculatedLocal = data.amount_usd * data.exchange_rate_used;
      const tolerance = 0.01; // Tolérance de 1 centime
      return Math.abs(calculatedLocal - data.amount_local) <= tolerance;
    },

    validateCompletedAtAfterInitiated: (
      initiated_at: Date,
      completed_at: Date | null | undefined,
    ): boolean => {
      if (completed_at == null) return true;
      return new Date(completed_at).getTime() >= new Date(initiated_at).getTime();
    },

    validateFailedAtAfterInitiated: (
      initiated_at: Date,
      failed_at: Date | null | undefined,
    ): boolean => {
      if (failed_at == null) return true;
      return new Date(failed_at).getTime() >= new Date(initiated_at).getTime();
    },

    validateFailureReasonWhenFailed: (
      transaction_status: string,
      failure_reason: string | null | undefined,
    ): boolean => {
      if (transaction_status === PaymentTransactionStatus.FAILED) {
        return failure_reason != null && failure_reason.trim().length > 0;
      }
      return true; // Si pas FAILED, failure_reason peut être null
    },

    // Validation globale du modèle
    validateTransactionModel: (data: any): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Vérification cohérence montants
      if (data.amount_usd && data.exchange_rate_used && data.amount_local) {
        const calculatedLocal = data.amount_usd * data.exchange_rate_used;
        const tolerance = 0.01;
        if (Math.abs(calculatedLocal - data.amount_local) > tolerance) {
          errors.push(
            'Amount inconsistency: amount_usd * exchange_rate_used must equal amount_local (±0.01)',
          );
        }
      }

      // Vérification dates
      if (data.initiated_at && data.completed_at) {
        if (new Date(data.completed_at).getTime() < new Date(data.initiated_at).getTime()) {
          errors.push('completed_at must be after initiated_at');
        }
      }

      if (data.initiated_at && data.failed_at) {
        if (new Date(data.failed_at).getTime() < new Date(data.initiated_at).getTime()) {
          errors.push('failed_at must be after initiated_at');
        }
      }

      // Vérification failure_reason obligatoire si FAILED
      if (data.transaction_status === PaymentTransactionStatus.FAILED) {
        if (!data.failure_reason || data.failure_reason.trim().length === 0) {
          errors.push('failure_reason is required when transaction_status is FAILED');
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
      if (data.billing_cycle) {
        data.billing_cycle = parseInt(data.billing_cycle.toString().trim());
      }
      if (data.adjustment) {
        data.adjustment = parseInt(data.adjustment.toString().trim());
      }
      if (data.amount_usd) {
        data.amount_usd = parseFloat(data.amount_usd.toString());
      }
      if (data.amount_local) {
        data.amount_local = parseFloat(data.amount_local.toString());
      }
      if (data.currency_code) {
        data.currency_code = data.currency_code.trim().toUpperCase();
      }
      if (data.exchange_rate_used) {
        data.exchange_rate_used = parseFloat(data.exchange_rate_used.toString());
      }
      if (data.payment_method) {
        data.payment_method = parseInt(data.payment_method.toString().trim());
      }
      if (data.payment_reference) {
        data.payment_reference = data.payment_reference.trim();
      }
      if (data.transaction_status) {
        data.transaction_status = data.transaction_status.trim().toUpperCase();
      }
      if (data.initiated_at) {
        data.initiated_at = new Date(data.initiated_at);
      }
      if (data.completed_at) {
        data.completed_at = new Date(data.completed_at);
      }
      if (data.failed_at) {
        data.failed_at = new Date(data.failed_at);
      }
      if (data.failure_reason) {
        data.failure_reason = data.failure_reason.trim();
      }
    },
  },
};
