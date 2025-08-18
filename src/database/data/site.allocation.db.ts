import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';

import g from '../../tools/glossary'

export const SiteAllocationDbStructure = {
    tableName: `${g.tableAp}_site_allocation`,
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Site Allocation',
        },
        guid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: { name: 'unique_guid', msg: 'GUID must be unique' },
            comment: 'Unique, automatically generated digital GUID',
        },
        site: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: { name: 'unique_site', msg: 'Site must be unique'},
            comment: 'Site allocation',
        },
        licence: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'licence',
                key: 'id',
            },
            comment: 'Licence',
        },
        amendment: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'amendment',
                key: 'id',
            }
        },
        effective_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Effective date',
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Active',
        }
    } as ModelAttributes,
    options: {
        tableName: `${g.tableAp}_site_allocation`,
        timestamps: true,
        comment: 'Site Allocation table and validation information',
        indexes: [
            {
                fields: ['guid'],
                name: 'idx_site_allocation_guid',
            },
            {
                fields: ['site'],
                name: 'idx_site_allocation_site',
            },
            {
                fields: ['licence'],
                name: 'idx_site_allocation_licence',
            },
            {
                fields: ['amendment'],
                name: 'idx_site_allocation_amendment',
            },
            {
                fields: ['effective_date'],
                name: 'idx_site_allocation_effective_date',
            },
            {
                fields: ['active'],
                name: 'idx_site_allocation_active',
            },
        ]
    } as ModelOptions,

    validation: {
        validateSite: (site : string):boolean =>{
            return typeof site === 'string' && site.length <= 128;
        },
        validateDate(date: Date): boolean {
            return date instanceof Date && !isNaN(date.getTime());
        },
        isActive(active: boolean): boolean {
            return typeof active === 'boolean';
        },
        validateAmendment: (amendment: number): boolean => {
            return Number.isInteger(amendment) && amendment > 0;
        },
        validateLicence: (licence: number): boolean => {
            return Number.isInteger(licence) && licence > 0;
        },
        cleanData: (data: any): void => {
            if(data.amendment){
                data.site = data.site.trim();
            }
        }
    }
};