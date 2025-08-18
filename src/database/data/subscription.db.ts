import { ModelAttributes, ModelOptions, DataTypes } from 'sequelize'
import G from '../../tools/glossary';

export enum Type { SUPPORT= "SUPPORT", GLOBAL = "GLOBAL" }
export enum Status { ACTIVE= "ACTIVE", EXPIRED = "EXPIRED", STRANDED = "STRANDED" }

export const SubscriptionDbStructure = {
    tableName: `${G.tableAp}_subscription`,
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Subscription'
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
        subscription_type: {
            type: DataTypes.ENUM(...Object.values(Type)),
            allowNull: false,
            comment: 'Subscription type',
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Start date',
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Price',
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'End date',
        },
        status: {
            type: DataTypes.ENUM(...Object.values(Status)),
            allowNull: false,
            comment: 'Status',
        }
    } as ModelAttributes,

    options: {
        tableName: `${G.tableAp}_subscription`,
        timestamps: true,
        comment: 'Subscription table and validation information',
        indexes: [
            {
                fields: ['guid'],
                name: 'idx_subscription_guid',
            },
            {
                fields: ['licence'],
                name: 'idx_subscription_licence',
            },
            {
                fields: ['subscription_type'],
                name: 'idx_subscription_type',
            },
            {
                fields: ['status'],
                name: 'idx_subscription_status',
            },
            {
                fields: ['start_date'],
                name: 'idx_subscription_start_date',
            },
            {
                fields: ['end_date'],
                name: 'idx_subscription_end_date',
            },
            {
                fields: ['price'],
                name: 'idx_subscription_price',
            },
            {
                fields: ['licence', 'subscription_type', 'status', 'start_date', 'end_date', 'price'],
                name: 'idx_subscription_licence_type_status_start_end_price',
            },
            {
                fields: ['licence', 'subscription_type', 'status', 'start_date', 'end_date'],
                name: 'idx_subscription_licence_type_status_start_end',
            },
            {
                fields: ['licence', 'subscription_type', 'status', 'start_date'],
                name: 'idx_subscription_licence_type_status_start',
            },
            {
                fields: ['licence', 'subscription_type', 'status'],
                name: ['idx_subscription_licence_type_status'],
            }
        ]
    } as ModelOptions,
    // Méthodes de validation
    validation: {
        validateStatus: (status: Status) : boolean => {
                return Object.values(Status).includes(status);
        },
        validateType: (type: Type) : boolean => {
            return Object.values(Type).includes(type);
        },
        validatePrice: (price: number) : boolean => {
            return Number.isInteger(price) && price > 0;
        },
        validateDate: (date: Date) : boolean => {
            return date instanceof Date && !isNaN(date.getTime());
        },
    }
}