import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

/**
 * Structure de la table countries
 */
export const CountryDbStructure = {
    tableName: `${G.tableConf}_country`,
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Country',
        },
        guid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: { name: 'unique_guid', msg: 'GUID must be unique' },
            comment: 'Unique, automatically generated digital GUID',
        },
        code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: { name: 'unique_code', msg: 'CODE must be unique' },
            comment: 'International code (e.g. 237 for Cameroon)',
        },
        iso: {
            type: DataTypes.STRING(2),
            allowNull: false,
            unique: { name: 'unique_iso', msg: 'ISO must be unique' },
            comment: 'ISO 3166-1 alpha-2 code (2 capital letters, e.g. CM)',
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
            comment: 'Name (e.g. Cameroon)',
        },
        timezone: {
            type: DataTypes.STRING(64),
            allowNull: true,
            comment: 'Main time zone (e.g. Africa/Douala)',
        },
        mobileRegex: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'Reference to mobile validation regex in Reg',
        },
        flag: {
            type: DataTypes.STRING(10),
            allowNull: true,
            comment: 'flag emoji (e.g. 🇨🇲)',
        },
    } as ModelAttributes,

    options: {
        tableName: `${G.tableConf}_country`,
        timestamps: true,
        comment: 'Country table with geographical and validation information',
        indexes: [
            {
                fields: ['guid'],
                name: 'idx_country_guid',
            },
            {
                fields: ['code'],
                name: 'idx_country_code',
            },
            {
                fields: ['iso'],
                name: 'idx_country_iso',
            },
            {
                fields: ['name'],
                name: 'idx_country_name',
            },
            {
                fields: ['timezone'],
                name: 'idx_country_timezone',
            },
        ],
    } as ModelOptions,

    // Méthodes de validation
    validation: {
        /**
         * Valide le code numérique du pays
         */
        validateCode: (code: number): boolean => {
            return Number.isInteger(code) && code > 0 && code <= 999;
        },

        /**
         * Valide le code ISO 3166-1 alpha-2
         */
        validateIso: (iso: string): boolean => {
            const trimmed = iso.trim().toUpperCase();
            const isoRegex = /^[A-Z]{2}$/;
            return isoRegex.test(trimmed);
        },

        /**
         * Valide le nom du pays
         */
        validateName: (name: string): boolean => {
            const trimmed = name.trim();
            return trimmed.length >= 2 && trimmed.length <= 128;
        },

        /**
         * Valide le fuseau horaire
         */
        validateTimezone: (timezone: string): boolean => {
            const trimmed = timezone.trim();
            // Format basique: Continent/Ville ou UTC±offset
            const timezoneRegex = /^([A-Z][a-z]+\/[A-Za-z_]+|UTC[+-]\d{1,2}(:\d{2})?|UTC)$/;
            return timezoneRegex.test(trimmed);
        },

        /**
         * Valide la référence du regex mobile
         */
        validateMobileRegex: (mobileRegex: string): boolean => {
            const trimmed = mobileRegex.trim();
            // Valide que c'est un identifiant valide (camelCase ou UPPER_CASE)
            const regexRefPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
            return regexRefPattern.test(trimmed);
        },

        /**
         * Valide l'émoji du drapeau
         */
        validateFlag: (flag: string): boolean => {
            const trimmed = flag.trim();
            // Valide que c'est un émoji (caractères Unicode de 1 à 10 caractères)
            return trimmed.length >= 1 && trimmed.length <= 10;
        },

        /**
         * Nettoie les données avant insertion/update
         */
        cleanData: (data: any): void => {
            if (data.iso) {
                data.iso = data.iso.trim().toUpperCase();
            }
            if (data.name) {
                data.name = data.name.trim();
            }
            if (data.timezone) {
                data.timezone = data.timezone.trim();
            }
            if (data.mobileRegex) {
                data.mobileRegex = data.mobileRegex.trim();
            }
            if (data.flag) {
                data.flag = data.flag.trim();
            }
        },
    },
};