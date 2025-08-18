import { DataTypes, ModelAttributes, ModelOptions } from 'sequelize';
import G from '../../tools/glossary';

export const AmendmentDbStructure = {
    tableName: `${G.tableAp}_amendment`,
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Amendment',
        },
        guid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: { name: 'unique_guid', msg: 'GUID must be unique' },
            comment: 'Unique, automatically generated digital GUID',
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
        previous_site_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Previous number of site'
        },
        site_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'New number of site'
        },
        effective_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Effective date'
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Price'
        }
    } as ModelAttributes,
    options: {
        tableName: `${G.tableAp}_amendment`,
        timestamps: true,
        comment: 'Amendment table and validation information',
        indexes: [
            {
                fields: ['guid'],
                name: 'idx_amendment_guid',
            },
            {
                fields: ['licence'],
                name: 'idx_amendment_licence',
            },
            {
                fields: ['previous_site_count'],
                name: 'idx_amendment_previous_site_count',
            },
            {
                fields: ['site_count'],
                name: 'idx_amendment_site_count',
            },
            {
                fields: ['effective_date'],
                name: 'idx_amendment_effective_date',
            },
            {
                fields: ['price'],
                name: 'idx_amendment_price',
            },
            {
                fields: ['licence', 'previous_site_count', 'site_count', 'effective_date', 'price'],
                name: 'idx_amendment_licence_previous_site_count_site_count_effective_date_price',
            }
        ]
    } as ModelOptions,

    validation: {
        validatePrice: (price: number) : boolean => {
            return Number.isInteger(price) && price > 0;
        },
        validateDate: (date: Date) : boolean => {
            return date instanceof Date && !isNaN(date.getTime());
        },
        validateCount: (count: number): boolean =>{
            return Number.isInteger(count) && count > 0;
        }
    }
};