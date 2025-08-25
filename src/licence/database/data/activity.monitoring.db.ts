import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

export enum ActivityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPICIOUS = 'SUSPICIOUS',
}

export const ActivityMonitoringDbStructure = {
  tableName: `${G.tableAp}_activity_monitoring`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Activity monitoring',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: {
        name: 'unique_activity_monitoring_guid',
        msg: 'Activity monitoring GUID must be unique',
      },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    employee_license: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: `${G.tableAp}_employee_license`,
        key: 'id',
      },
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Employee license',
    },
    monitoring_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
      },
      comment: 'Date of the monitoring',
    },
    last_punch_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
      comment: 'Date of the last punch',
    },
    punch_count_7_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
      },
      comment: 'Number of punches in the last 7 days',
    },
    punch_count_30_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
      },
      comment: 'Number of punches in the last 30 days',
    },
    consecutive_absent_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: true,
        min: 0,
      },
      comment: 'Number of consecutive absent days',
    },
    status_at_date: {
      type: DataTypes.ENUM(...Object.values(ActivityStatus)),
      allowNull: false,
      validate: {
        isIn: {
          args: [[...Object.values(ActivityStatus)]],
          msg: 'Invalid status at the monitoring date',
        },
      },
      comment: 'Status at the monitoring date',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableAp}_activity_monitoring`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'Activity monitoring table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_activity_monitoring_guid',
      },
      {
        fields: ['employee_license'],
        name: 'idx_activity_monitoring_employee_license',
      },
      {
        fields: ['monitoring_date'],
        name: 'idx_activity_monitoring_monitoring_date',
      },
      {
        fields: ['last_punch_date'],
        name: 'idx_activity_monitoring_last_punch_date',
      },
      {
        fields: ['punch_count_7_days'],
        name: 'idx_activity_monitoring_punch_count_7_days',
      },
      {
        fields: ['punch_count_30_days'],
        name: 'idx_activity_monitoring_punch_count_30_days',
      },
      {
        fields: ['consecutive_absent_days'],
        name: 'idx_activity_monitoring_consecutive_absent_days',
      },
      {
        fields: ['status_at_date'],
        name: 'idx_activity_monitoring_status_at_date',
      },
      {
        unique: true,
        fields: ['employee_license', 'monitoring_date'],
        name: 'idx_activity_monitoring_employee_licence_monitory_date',
      },
    ],
  } as ModelOptions,

  validation: {
    validateStatusAtDate(status: string): boolean {
      // const trimmed = status.trim();
      // const statusRegex = /^(ACTIVE|INACTIVE|SUSPICIOUS)$/;
      // return statusRegex.test(trimmed);
      return Object.values(ActivityStatus).includes(status as ActivityStatus);
    },

    validateEmployeeLicense(id: number): boolean {
      const trimmed = id.toString().trim();
      const idRegex = /^[0-9]+$/;
      return idRegex.test(trimmed);
    },

    validateMonitoringDate(date: Date): boolean {
      return !isNaN(new Date(date).getDate());
    },
    validateLastPunchDate(date: string): boolean {
      const trimmed = date.trim();
      const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/;
      return dateRegex.test(trimmed);
    },
    validatePunchCount7Days(count: number): boolean {
      const trimmed = count.toString().trim();
      const countRegex = /^[0-9]+$/;
      return countRegex.test(trimmed);
    },
    validatePunchCount30Days(count: number): boolean {
      const trimmed = count.toString().trim();
      const countRegex = /^[0-9]+$/;
      return countRegex.test(trimmed);
    },
    validateConsecutiveAbsentDays(count: number): boolean {
      const trimmed = count.toString().trim();
      const countRegex = /^[0-9]+$/;
      return countRegex.test(trimmed);
    },

    cleanData: (data: any): void => {
      if (data.status_at_date) {
        data.status_at_date = data.status_at_date.trim();
      }
      if (data.employee_license) {
        data.employee_license = data.employee_license.trim();
      }
      if (data.monitoring_date) {
        data.monitoring_date = data.monitoring_date.trim();
      }
      if (data.last_punch_date) {
        data.last_punch_date = data.last_punch_date.trim();
      }
      if (data.punch_count_7_days) {
        data.punch_count_7_days = data.punch_count_7_days.trim();
      }
      if (data.punch_count_30_days) {
        data.punch_count_30_days = data.punch_count_30_days.trim();
      }
      if (data.consecutive_absent_days) {
        data.consecutive_absent_days = data.consecutive_absent_days.trim();
      }
    },
  },
};
