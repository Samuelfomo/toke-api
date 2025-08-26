import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../../tools/glossary';

export const LanguageDbStructure = {
  tableName: `${G.tableConf}_language`,
  attributes: {
    id: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true,
      validate: {
        isInt: true,
        min: 1,
        max: 65535,
      },
      comment: 'Language',
    },
    guid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: { name: 'unique_language_guid', msg: 'Language GUID must be unique' },
      validate: {
        isInt: true,
        min: 100000,
      },
      comment: 'Unique, automatically generated digital GUID',
    },
    code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: { name: 'unique_code', msg: 'CODE must be unique' },
      validate: {
        is: /^[a-z]{2}$/,
        len: [2, 2],
      },
      comment: 'ISO 639-1 language code (e.g. fr, en)',
    },
    name_en: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Name (e.g. French)',
    },
    name_local: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true,
        notNull: true,
      },
      comment: 'Local name (e.g. Français)',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: true,
      },
      comment: 'Is the language active?',
    },
  } as ModelAttributes,
  options: {
    tableName: `${G.tableConf}_language`,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // paranoid: false,      // true si tu veux soft delete
    underscored: true, // snake_case pour tous les champs
    freezeTableName: true, // empêche la pluralisation
    comment: 'Language table with geographical and validation information',
    indexes: [
      {
        fields: ['guid'],
        name: 'idx_language_guid',
      },
      {
        fields: ['code'],
        name: 'idx_language_code',
      },
      {
        fields: ['name_en'],
        name: 'idx_language_name_en',
      },
      {
        fields: ['name_local'],
        name: 'idx_language_name_local',
      },
      {
        fields: ['active'],
        name: 'idx_language_is_active',
      },
    ],
  } as ModelOptions,

  validation: {
    validateCode: (iso: string): boolean => {
      const trimmed = iso.trim().toUpperCase();
      const isoRegex = /^[a-z]{2}$/;
      return isoRegex.test(trimmed);
    },
    validateName: (name: string): boolean => {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 50;
    },
    isActive(isActive: boolean): boolean {
      return typeof isActive === 'boolean';
    },

    cleanData: (data: any): void => {
      if (data.code) {
        data.code = data.code.trim().toUpperCase();
      }
      if (data.name_en) {
        data.name_en = data.name_en.trim();
      }
      if (data.name_local) {
        data.name_local = data.name_local.trim();
      }
      if (data.active) {
        data.active = data.active === 'true';
      }
    },
  },
};
