import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

export enum Type {
  CLOUD_FLEX = 'CLOUD_FLEX',
}

export enum LicenceStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
}

export const IN = [1, 3, 6, 12];

export const GlobalLicenseDbStructure = {
  tableName: `${G.tableAp}_global_license`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Global licence',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_global_license_guid', msg: 'Global licence GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    tenant: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: `${G.tableAp}_tenant`,
        key: 'id',
      },
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Tenant',
    },
    licence_type: {
      type: DataTypes.ENUM(...Object.values(Type)),
      allowNull: false,
      defaultValue: Type.CLOUD_FLEX,
      validate: {
        isIn: {
          args: [Object.values(Type)],
          msg: 'Invalid licence type',
        },
      },
      comment: 'Licence type',
    },
    billing_cycle_months: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        isInt: true,
        isIn: [IN],
      },
      comment: 'Billing cycle in months',
    },
    base_price_usd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 3.0,
      validate: {
        isDecimal: true,
        min: 0,
        max: 9999999999.99,
      },
      comment: 'Base price in USD',
    },
    minimum_seats: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 5,
      validate: {
        isInt: true,
        min: 1,
        max: 65535,
      },
      comment: 'Minimum number of seats',
    },
    current_period_start: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
      comment: 'Current period start date',
    },
    current_period_end: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
      comment: 'Current period end date',
    },
    next_renewal_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
      comment: 'Next renewal date',
    },
    total_seats_purchased: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // defaultValue: 0,
      validate: {
        isInt: true,
      },
      comment: 'Total number of seats purchased',
    },
    license_status: {
      type: DataTypes.ENUM(...Object.values(LicenceStatus)),
      allowNull: false,
      defaultValue: LicenceStatus.ACTIVE,
      validate: {
        isIn: {
          args: [Object.values(LicenceStatus)],
          msg: 'Invalid licence status',
        },
      },
      comment: 'Licence status',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableAp}_global_license`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,

    indexes: [
      {
        fields: ['guid'],
        name: 'idx_global_license_guid',
      },
      {
        fields: ['tenant'],
        name: 'idx_global_license_tenant',
      },
      {
        fields: ['licence_type'],
        name: 'idx_global_license_licence_type',
      },
      {
        fields: ['billing_cycle_months'],
        name: 'idx_global_license_billing_cycle_months',
      },
      {
        fields: ['base_price_usd'],
        name: 'idx_global_license_base_price_usd',
      },
      {
        fields: ['minimum_seats'],
        name: 'idx_global_license_minimum_seats',
      },
      {
        fields: ['current_period_start'],
        name: 'idx_global_license_current_period_start',
      },
      {
        fields: ['current_period_end'],
        name: 'idx_global_license_current_period_end',
      },
      {
        fields: ['next_renewal_date'],
        name: 'idx_global_license_next_renewal_date',
      },
      {
        fields: ['total_seats_purchased'],
        name: 'idx_global_license_total_seats_purchased',
      },
      {
        fields: ['license_status'],
        name: 'idx_global_license_license_status',
      },
      {
        fields: ['created_at'],
        name: 'idx_global_license_created_at',
      },
      {
        fields: ['updated_at'],
        name: 'idx_global_license_updated_at',
      },
      // {
      //     fields: ['licence_type', 'billing_cycle_months', 'base_price_usd', 'minimum_seats', 'current_period_start', 'current_period_end', 'next_renewal_date', 'total_seats_purchased', 'license_status'],
      //     name: 'idx_global_license_unique',
      // }
    ],
  } as ModelOptions,
  validation: {
    validateTenant: (tenant: number): boolean => {
      return tenant >= 1;
    },
    validateLicenceType: (value: string): boolean => {
      return Object.values(Type).includes(value as Type);
    },
    validateBillingCycleMonths: (value: number): boolean => {
      return value >= 1 && value <= 65535 && IN.includes(value);
      // return IN.includes(parseInt(value));
    },
    validateBasePriceUsd: (value: number): boolean => {
      const trimmed = value.toString().trim();
      const regex = /^[0-9]+(\.[0-9]{1,2})?$/;
      return regex.test(trimmed);
    },
    validateMinimumSeats: (value: number): boolean => {
      return value >= 1 && value <= 65535;
    },
    validateCurrentPeriodStart: (value: Date): boolean => {
      return new Date(value) <= new Date();
    },
    validateCurrentPeriodEnd: (value: Date): boolean => {
      return new Date(value) >= new Date();
    },
    validateNextRenewDate: (value: Date): boolean => {
      return new Date(value) >= new Date();
    },
    validateTotalSeatsPurchased: (value: number): boolean => {
      return value >= 0;
    },
    validateLicenseStatus: (value: string): boolean => {
      return Object.values(LicenceStatus).includes(value as LicenceStatus);
    },

    cleanData: (data: any): void => {
      if (data.tenant) {
        data.tenant = parseInt(data.tenant);
      }
      if (data.licence_type) {
        data.licence_type = data.licence_type.trim();
      }
      if (data.billing_cycle_months) {
        data.billing_cycle_months = parseInt(data.billing_cycle_months);
      }
      if (data.base_price_usd) {
        data.base_price_usd = parseFloat(data.base_price_usd);
      }
      if (data.minimum_seats) {
        data.minimum_seats = parseInt(data.minimum_seats);
      }
      if (data.current_period_start) {
        data.current_period_start = new Date(data.current_period_start);
      }
      if (data.current_period_end) {
        data.current_period_end = new Date(data.current_period_end);
      }
      if (data.next_renewal_date) {
        data.next_renewal_date = new Date(data.next_renewal_date);
      }
      if (data.total_seats_purchased) {
        data.total_seats_purchased = parseInt(data.total_seats_purchased);
      }
      if (data.license_status) {
        data.license_status = data.license_status.trim();
      }
      // if (data.created_at) {
      //   data.created_at = new Date(data.created_at);
      // }
    },
  },
};
