import { DataTypes } from 'sequelize';

import G from '../../tools/glossary';

export enum Type {
  CLOUD_FLEX = 'CLOUD_FLEX',
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
  },
};
