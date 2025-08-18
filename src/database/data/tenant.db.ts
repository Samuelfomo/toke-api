import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import G from '../../tools/glossary';

// Énumération des status
// export enum Status {
//     ACTIVE= "ACTIVE", SUSPENDED = "SUSPENDED", EXPIRED = "EXPIRED", BLOCKED = "BLOCKED",
// }


/**
 * Structure de la table tenant
 */
export const TenantDbStructure = {
    tableName: `${G.tableAp}_tenant`,

    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Tenant',
        },
        guid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: { name: 'unique_guid', msg: 'GUID must be unique' },
            comment: 'Unique, automatically generated digital GUID',
        },
        subdomain: {
            type: DataTypes.STRING(128),
            unique: { name: 'subdomain', msg: 'Subdomain must be unique' },
            allowNull: false,
            comment: 'Subdomain',
        },
        company: {
            type: DataTypes.STRING(128),
            allowNull: false,
            comment: 'Company',
        },
        support: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Support',
        },
        // status: {
        //     type: DataTypes.ENUM(...Object.values(Status)),
        //     allowNull: false,
        //     comment: 'Status',
        // },
        current_site_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Current site count',
        },
        site_count_limit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Site count limit',
        },
        profile: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Profile',
        }
    } as ModelAttributes,

    options: {
        tableName: `${G.tableAp}_tenant`,
        timestamps: true,
        comment: 'Tenant table and validation information',
        indexes: [
            {
                fields: ['guid'],
                name: 'idx_tenant_guid',
            },
            {
                fields: ['subdomain'],
                name: 'idx_tenant_subdomain',
            },
            // {
            //     fields: ['status'],
            //     name: 'idx_tenant_status',
            // },
            {
                fields: ['current_site_count'],
                name: 'idx_tenant_current_site_count',
            },
            {
                fields: ['site_count_limit'],
                name: 'idx_tenant_site_count_limit',
            },
            {
                fields: ['profile'],
                name: 'idx_tenant_profile',
            }
        ],
    } as ModelOptions,

    // Méthodes de validation
    validation: {
        validateSubdomain: (subdomain: string) : boolean => {
            const urlRegex = new RegExp(
                '^(https?:\\/\\/)?' + // Protocole (optionnel)
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Nom de domaine (ex: google.com)
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // Ou adresse IP
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port (optionnel) et chemin
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // Paramètres de requête (optionnels)
                '(\\#[-a-z\\d_]*)?$', // Ancre (optionnelle)
                'i' // Case-insensitive
            );
            return urlRegex.test(subdomain);
        },
        validateCompany: (name: string) : boolean =>  {
            const regex = /^.+$/;
            return regex.test(name.trim());
        },
        validateSupport: (support : boolean): boolean =>{
            return typeof support === 'boolean';
        },
        validateCurrentSiteCount: (count: number) : boolean => {
            return Number.isInteger(count) && count >= 0;
        },
        validateSiteCountLimit: (limit: number) : boolean => {
            return Number.isInteger(limit) && limit >= 0;
        },
        validateProfile: (profile: number) : boolean => {
            return Number.isInteger(profile) && profile >= 0;
        },

        cleanData: (data: any): void => {
            if (data.subdomain) {
                data.subdomain = data.subdomain.trim();
            }
            if (data.company) {
                data.company = data.company.trim();
            }
            if(data.current_site_count){
                data.current_site_count = Number(data.current_site_count);
            }
            if(data.site_count_limit){
                data.site_count_limit = Number(data.site_count_limit);
            }
            if(data.profile){
                data.profile = Number(data.profile);
            }
        },
        // validateStatus: (status: Status) : boolean => {
        //     return Object.values(Status).includes(status);
        // }
    }
};
