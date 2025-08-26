import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

export enum ContractualStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum LeaveType {
  PARENTAL = 'PARENTAL',
  MEDICAL = 'MEDICAL',
  TECHNICAL = 'TECHNICAL',
  SABBATICAL = 'SABBATICAL',
  OTHER = 'OTHER',
}

export enum BillingStatusComputed {
  BILLABLE = 'BILLABLE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  NON_BILLABLE = 'NON_BILLABLE',
  TERMINATED = 'TERMINATED',
}

export const EmployeeLicenseDbStructure = {
  tableName: `${G.tableAp}_employee_license`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Employee license',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_employee_licence_guid', msg: 'Employee license GUID must be unique' },
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
      comment: 'Global license',
    },
    employee: {
      type: DataTypes.STRING(128), //Référence vers toke_tenant_xxx.utilisateur
      allowNull: false,
      validate: {
        is: /^[a-zA-Z0-9_]{1,128}$/,
        len: [1, 128],
      },
      comment: 'Employee ID (e.g. 12345678901234567890123456789012)',
    },
    employee_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        is: /^[a-zA-Z0-9_]{1,50}$/,
        len: [1, 50],
      },
      comment: 'Employee code (e.g. 12345678901234567890123456789012)',
    },
    activation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
      comment: 'Activation date',
    },
    deactivation_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Deactivation date',
    },
    last_activity_date: {
      type: DataTypes.DATE, // Dernière fois qu'il a pointé
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Last activity date',
    },
    contractual_status: {
      type: DataTypes.ENUM(...Object.values(ContractualStatus)),
      allowNull: false,
      defaultValue: ContractualStatus.ACTIVE,
      validate: {
        isIn: {
          args: [Object.values(ContractualStatus)],
          msg: 'Invalid contractual status',
        },
      },
      comment: 'Contractual status',
    },
    declared_long_leave: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the employee declared long leave?',
    },
    long_leave_declared_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        is: /^[a-zA-Z0-9_]{1,255}$/,
        len: [1, 255],
      },
      comment: 'Long leave declared by',
    },
    long_leave_declared_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Long leave declared at',
    },
    long_leave_type: {
      type: DataTypes.ENUM(...Object.values(LeaveType)),
      allowNull: true,
      validate: {
        isIn: {
          args: [Object.values(LeaveType)],
          msg: 'Invalid long leave type',
        },
      },
      comment: 'Long leave type',
    },
    long_leave_reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500],
      },
      comment: 'Long leave reason',
    },
    computed_billing_status: {
      type: DataTypes.ENUM(...Object.values(BillingStatusComputed)), // Statut de facturation calculé automatiquement
      allowNull: false,
      defaultValue: BillingStatusComputed.BILLABLE,
      validate: {
        isIn: {
          args: [Object.values(BillingStatusComputed)],
          msg: 'Invalid computed billing status',
        },
      },
      comment: 'Computed billing status',
    },
    grace_period_start: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Grace period start',
    },
    grace_period_end: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Grace period end',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableAp}_employee_license`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'Employee license table',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_employee_license_guid',
      },
      {
        fields: ['global_license'],
        name: 'idx_employee_license_global_license',
      },
      {
        fields: ['employee'],
        name: 'idx_employee_license_employee',
      },
      {
        fields: ['employee_code'],
        name: 'idx_employee_license_employee_code',
      },
      {
        fields: ['activation_date'],
        name: 'idx_employee_license_activation_date',
      },
      {
        fields: ['deactivation_date'],
        name: 'idx_employee_license_deactivation_date',
      },
      {
        fields: ['last_activity_date'],
        name: 'idx_employee_license_last_activity_date',
      },
      {
        fields: ['contractual_status'],
        name: 'idx_employee_license_contractual_status',
      },
      {
        fields: ['declared_long_leave'],
        name: 'idx_employee_license_declared_long_leave',
      },
      {
        fields: ['long_leave_declared_by'],
        name: 'idx_employee_license_long_leave_declared_by',
      },
      {
        fields: ['long_leave_declared_at'],
        name: 'idx_employee_license_long_leave_declared_at',
      },
      {
        fields: ['long_leave_type'],
        name: 'idx_employee_license_long_leave_type',
      },
      {
        fields: ['long_leave_reason'],
        name: 'idx_employee_license_long_leave_reason',
      },
      {
        fields: ['computed_billing_status'],
        name: 'idx_employee_license_computed_billing_status',
      },
      {
        fields: ['grace_period_start'],
        name: 'idx_employee_license_grace_period_start',
      },
      {
        fields: ['grace_period_end'],
        name: 'idx_employee_license_grace_period_end',
      },
    ],
  } as ModelOptions,
  validation: {
    validateGlobalLicense: (globalLicense: number): boolean => {
      const trimmed = globalLicense.toString().trim();
      const globalLicenseRegex = /^[0-9]+$/;
      return globalLicenseRegex.test(trimmed);
    },
    validateEmployee: (employee: string): boolean => {
      const trimmed = employee.trim();
      const employeeRegex = /^[a-zA-Z0-9_]{1,128}$/;
      return employeeRegex.test(trimmed);
    },
    validateEmployeeCode: (employeeCode: string): boolean => {
      const trimmed = employeeCode.trim();
      const employeeCodeRegex = /^[a-zA-Z0-9_]{1,50}$/;
      return employeeCodeRegex.test(trimmed);
    },
    validateActivationDate: (value: Date): boolean => {
      return !isNaN(new Date(value).getTime());
    },
    validateDeactivationDate: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },
    validateLastActivityDate: (value: Date): boolean => {
      return value === null || !isNaN(new Date(value).getTime());
    },
    validateContractualStatus: (contractualStatus: string): boolean => {
      return Object.values(ContractualStatus).includes(contractualStatus as ContractualStatus);
    },
    validateDeclaredLongLeave: (declaredLongLeave: string): boolean => {
      const trimmed = declaredLongLeave.trim();
      const declaredLongLeaveRegex = /^(true|false)$/;
      return declaredLongLeaveRegex.test(trimmed);
    },
    // isBoolean: (value: boolean): boolean => {
    //   return typeof value === 'boolean';
    // },
    validateLongLeaveDeclaredBy: (longLeaveDeclaredBy: string): boolean => {
      const trimmed = longLeaveDeclaredBy.trim();
      const longLeaveDeclaredByRegex = /^[a-zA-Z0-9_]{1,255}$/;
      return longLeaveDeclaredByRegex.test(trimmed);
    },
    validateLongLeaveDeclaredAt: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },
    validateLongLeaveType: (longLeaveType: string | null | undefined): boolean => {
      return longLeaveType == null || Object.values(LeaveType).includes(longLeaveType as LeaveType);
    },
    validateLongLeaveReason: (longLeaveReason: string | null | undefined): boolean => {
      if (longLeaveReason == null) return true;
      const trimmed = longLeaveReason.trim();
      return trimmed.length <= 500;
    },
    validateComputedBillingStatus: (computedBillingStatus: string): boolean => {
      return Object.values(BillingStatusComputed).includes(
        computedBillingStatus as BillingStatusComputed,
      );
    },
    validateGracePeriodStart: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },
    validateGracePeriodEnd: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },

    cleanData: (data: any): void => {
      if (data.global_license) {
        data.global_license = data.global_license.toString().trim();
      }
      if (data.employee) {
        data.employee = data.employee.trim();
      }
      if (data.employee_code) {
        data.employee_code = data.employee_code.trim();
      }
      if (data.activation_date) {
        data.activation_date = new Date(data.activation_date);
      }
      if (data.deactivation_date) {
        data.deactivation_date = new Date(data.deactivation_date);
      }
      if (data.last_activity_date) {
        data.last_activity_date = new Date(data.last_activity_date);
      }
      if (data.contractual_status) {
        data.contractual_status = data.contractual_status.trim();
      }
      if (data.declared_long_leave) {
        data.declared_long_leave = data.declared_long_leave.trim();
      }
      if (data.long_leave_declared_by) {
        data.long_leave_declared_by = data.long_leave_declared_by.trim();
      }
      if (data.long_leave_declared_at) {
        data.long_leave_declared_at = new Date(data.long_leave_declared_at);
      }
      if (data.long_leave_type) {
        data.long_leave_type = data.long_leave_type.trim();
      }
      if (data.long_leave_reason) {
        data.long_leave_reason = data.long_leave_reason.trim();
      }
      if (data.computed_billing_status) {
        data.computed_billing_status = data.computed_billing_status.trim();
      }
      if (data.grace_period_start) {
        data.grace_period_start = new Date(data.grace_period_start);
      }
      if (data.grace_period_end) {
        data.grace_period_end = new Date(data.grace_period_end);
      }
    },
  },
};
