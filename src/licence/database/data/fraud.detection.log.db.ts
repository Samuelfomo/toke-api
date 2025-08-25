import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

export enum FraudDetection {
  SUSPICIOUS_LEAVE_PATTERN = 'SUSPICIOUS_LEAVE_PATTERN',
  MASS_DEACTIVATION = 'MASS_DEACTIVATION',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY',
  PRE_RENEWAL_MANIPULATION = 'PRE_RENEWAL_MANIPULATION',
  EXCESSIVE_TECHNICAL_LEAVE = 'EXCESSIVE_TECHNICAL_LEAVE',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const FraudDetectionLogDbStructure = {
  tableName: `${G.tableAp}_fraud_detection_log`,
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Fraud Detection Log',
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
    detection_type: {
      type: DataTypes.ENUM(...Object.values(FraudDetection)),
      allowNull: false,
      validate: {
        isIn: {
          args: [[...Object.values(FraudDetection)]],
          msg: 'Invalid detection type',
        },
      },
      comment: 'Detection type',
    },
    employee_licenses_affected: {
      type: DataTypes.ARRAY(DataTypes.STRING(128)), //Array des IDs employés concernés
      // type: DataTypes.ARRAY(DataTypes.UUID)
      allowNull: false,
      comment: 'Employee licenses affected',
    },
    detection_criteria: {
      type: DataTypes.JSONB, // Détails sur ce qui a déclenché l'alerte
      allowNull: false,
      comment: 'Detection criteria',
    },
    risk_level: {
      type: DataTypes.ENUM(...Object.values(RiskLevel)),
      allowNull: false,
      validate: {
        isIn: {
          args: [[...Object.values(RiskLevel)]],
          msg: 'Invalid risk level',
        },
      },
      comment: 'Risk level',
    },
    action_taken: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [1, 1024],
      },
      comment: 'Action taken',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [1, 1024],
      },
      comment: 'Notes',
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
      comment: 'Resolved at',
    },
    resolved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // references: {
      //   model: `${G.tableAp}_user`,
      //   key: 'id',
      // },
      validate: {
        isInt: true,
        min: 1,
      },
      comment: 'Resolved by',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableAp}_fraud_detection_log`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    freezeTableName: true,
    comment: 'Fraud detection log table with validation information',
    indexes: [
      {
        fields: ['tenant'],
        name: 'idx_fraud_detection_log_tenant',
      },
      {
        fields: ['detection_type'],
        name: 'idx_fraud_detection_log_detection_type',
      },
      {
        fields: ['employee_licenses_affected'],
        name: 'idx_fraud_detection_log_employee_licenses',
      },
      {
        fields: ['risk_level'],
        name: 'idx_fraud_detection_log_risk_level',
      },
      {
        fields: ['resolved_at'],
        name: 'idx_fraud_detection_log_resolved_at',
      },
      {
        fields: ['resolved_by'],
        name: 'idx_fraud_detection_log_resolved_by',
      },
      {
        fields: ['created_at'],
        name: 'idx_fraud_detection_log_created_at',
      },
      // Index composé pour recherches fréquentes
      {
        fields: ['tenant', 'detection_type', 'risk_level'],
        name: 'idx_fraud_detection_log_tenant_type_risk',
      },
      {
        fields: ['tenant', 'resolved_at'],
        name: 'idx_fraud_detection_log_tenant_resolved',
      },
    ],
  } as ModelOptions,

  validation: {
    validateTenant: (tenant: number): boolean => {
      const trimmed = tenant.toString().trim();
      const tenantRegex = /^[0-9]+$/;
      return tenantRegex.test(trimmed) && tenant >= 1;
    },

    validateDetectionType: (detectionType: string): boolean => {
      return Object.values(FraudDetection).includes(detectionType as FraudDetection);
    },

    validateEmployeeLicensesAffected: (employeeLicenses: string[]): boolean => {
      if (!Array.isArray(employeeLicenses)) return false;
      if (employeeLicenses.length === 0) return false; // Au moins un employé affecté

      return employeeLicenses.every((license: string) => {
        if (typeof license !== 'string') return false;
        const trimmed = license.trim();
        const employeeRegex = /^[a-zA-Z0-9_]{1,128}$/;
        return employeeRegex.test(trimmed);
      });
    },

    validateDetectionCriteria: (criteria: any): boolean => {
      if (typeof criteria !== 'object' || criteria === null) return false;
      // Validation basique - doit être un objet JSON valide non vide
      return Object.keys(criteria).length > 0;
    },

    validateRiskLevel: (riskLevel: string): boolean => {
      return Object.values(RiskLevel).includes(riskLevel as RiskLevel);
    },

    validateActionTaken: (actionTaken: string | null | undefined): boolean => {
      if (actionTaken == null) return true;
      const trimmed = actionTaken.trim();
      return trimmed.length >= 1 && trimmed.length <= 1024;
    },

    validateNotes: (notes: string | null | undefined): boolean => {
      if (notes == null) return true;
      const trimmed = notes.trim();
      return trimmed.length >= 1 && trimmed.length <= 1024;
    },

    validateResolvedAt: (value: Date | null | undefined): boolean => {
      return value == null || !isNaN(new Date(value).getTime());
    },

    validateResolvedBy: (resolvedBy: number | null | undefined): boolean => {
      if (resolvedBy == null) return true;
      const trimmed = resolvedBy.toString().trim();
      const resolvedByRegex = /^[0-9]+$/;
      return resolvedByRegex.test(trimmed) && resolvedBy >= 1;
    },

    // Validations logiques métier
    validateResolutionConsistency: (
      resolved_at: Date | null,
      resolved_by: number | null,
      action_taken: string | null,
    ): boolean => {
      // Si resolved_at est défini, resolved_by doit l'être aussi
      if (resolved_at != null && resolved_by == null) return false;
      // Si resolved_by est défini, resolved_at doit l'être aussi
      if (resolved_by != null && resolved_at == null) return false;
      // Si résolu, action_taken devrait être renseignée
      if (resolved_at != null && (action_taken == null || action_taken.trim().length === 0))
        return false;
      return true;
    },

    validateResolvedAfterCreated: (created_at: Date, resolved_at: Date | null): boolean => {
      if (resolved_at == null) return true;
      return new Date(resolved_at).getTime() >= new Date(created_at).getTime();
    },

    validateDetectionCriteriaByType: (detection_type: string, criteria: any): boolean => {
      if (typeof criteria !== 'object' || criteria === null) return false;

      switch (detection_type) {
        case FraudDetection.SUSPICIOUS_LEAVE_PATTERN:
          return (
            criteria.hasOwnProperty('leave_frequency') ||
            criteria.hasOwnProperty('leave_duration') ||
            criteria.hasOwnProperty('timing_pattern')
          );

        case FraudDetection.MASS_DEACTIVATION:
          return (
            criteria.hasOwnProperty('deactivation_count') &&
            criteria.hasOwnProperty('time_window') &&
            typeof criteria.deactivation_count === 'number'
          );

        case FraudDetection.UNUSUAL_ACTIVITY:
          return (
            criteria.hasOwnProperty('activity_type') ||
            criteria.hasOwnProperty('frequency_deviation')
          );

        case FraudDetection.PRE_RENEWAL_MANIPULATION:
          return (
            criteria.hasOwnProperty('days_before_renewal') ||
            criteria.hasOwnProperty('manipulation_type')
          );

        case FraudDetection.EXCESSIVE_TECHNICAL_LEAVE:
          return (
            criteria.hasOwnProperty('leave_duration') &&
            criteria.hasOwnProperty('threshold_exceeded')
          );

        default:
          return true; // Types non reconnus passent la validation
      }
    },

    validateRiskLevelConsistency: (
      detection_type: string,
      risk_level: string,
      employee_count: number,
    ): boolean => {
      // Règles métier pour la cohérence du niveau de risque
      switch (detection_type) {
        case FraudDetection.MASS_DEACTIVATION:
          if (employee_count > 50 && risk_level === RiskLevel.LOW) return false;
          if (employee_count > 100 && risk_level !== RiskLevel.CRITICAL) return false;
          break;

        case FraudDetection.PRE_RENEWAL_MANIPULATION:
          if (risk_level === RiskLevel.LOW) return false; // Toujours au moins MEDIUM
          break;

        case FraudDetection.EXCESSIVE_TECHNICAL_LEAVE:
          if (employee_count > 20 && risk_level === RiskLevel.LOW) return false;
          break;
      }
      return true;
    },

    // Validation globale du modèle
    validateFraudDetectionModel: (data: any): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Vérification cohérence résolution
      if (data.resolved_at != null && data.resolved_by == null) {
        errors.push('resolved_by is required when resolved_at is set');
      }
      if (data.resolved_by != null && data.resolved_at == null) {
        errors.push('resolved_at is required when resolved_by is set');
      }
      if (
        data.resolved_at != null &&
        (!data.action_taken || data.action_taken.trim().length === 0)
      ) {
        errors.push('action_taken is required when incident is resolved');
      }

      // Vérification dates logiques
      if (data.created_at && data.resolved_at) {
        if (new Date(data.resolved_at).getTime() < new Date(data.created_at).getTime()) {
          errors.push('resolved_at must be after created_at');
        }
      }

      // Vérification critères de détection par type
      if (data.detection_type && data.detection_criteria) {
        const criteriaValid =
          FraudDetectionLogDbStructure.validation.validateDetectionCriteriaByType(
            data.detection_type,
            data.detection_criteria,
          );
        if (!criteriaValid) {
          errors.push(
            `detection_criteria does not match expected format for ${data.detection_type}`,
          );
        }
      }

      // Vérification cohérence niveau de risque
      if (data.detection_type && data.risk_level && data.employee_licenses_affected) {
        const employeeCount = Array.isArray(data.employee_licenses_affected)
          ? data.employee_licenses_affected.length
          : 0;
        const riskValid = FraudDetectionLogDbStructure.validation.validateRiskLevelConsistency(
          data.detection_type,
          data.risk_level,
          employeeCount,
        );
        if (!riskValid) {
          errors.push(
            `risk_level ${data.risk_level} is inconsistent with ${data.detection_type} affecting ${employeeCount} employees`,
          );
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },

    cleanData: (data: any): void => {
      if (data.tenant) {
        data.tenant = parseInt(data.tenant.toString().trim());
      }
      if (data.detection_type) {
        data.detection_type = data.detection_type.trim().toUpperCase();
      }
      if (data.employee_licenses_affected && Array.isArray(data.employee_licenses_affected)) {
        data.employee_licenses_affected = data.employee_licenses_affected.map((license: string) =>
          typeof license === 'string' ? license.trim() : license,
        );
      }
      if (data.risk_level) {
        data.risk_level = data.risk_level.trim().toUpperCase();
      }
      if (data.action_taken) {
        data.action_taken = data.action_taken.trim();
      }
      if (data.notes) {
        data.notes = data.notes.trim();
      }
      if (data.resolved_at) {
        data.resolved_at = new Date(data.resolved_at);
      }
      if (data.resolved_by) {
        data.resolved_by = parseInt(data.resolved_by.toString().trim());
      }
    },
  },
};
