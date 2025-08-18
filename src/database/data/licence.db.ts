import { DataTypes, ModelAttributes, ModelOptions} from 'sequelize';
import G from '../../tools/glossary'

export enum Family { PERPETUAL = "PERPETUAL", ABONNEMENT = "ABONNEMENT"}
export enum Status { ACTIVE= "ACTIVE", EXPIRED = "EXPIRED", BLOCKED = "BLOCKED"}

export const LicenceDbStructure = {
    tableName: `${G.tableAp}_licence`,
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Licence',
        },
        guid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: { name: 'unique_guid', msg: 'GUID must be unique' },
            comment: 'Unique, automatically generated digital GUID',
        },
        tenant: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tenant',
                key: 'id',
            },
            comment: 'Tenant',
        },
        family: {
            type: DataTypes.ENUM(...Object.values(Family)),
            allowNull: false,
            comment: 'Family',
        },
        status: {
            type: DataTypes.ENUM(...Object.values(Status)),
            allowNull: false,
            comment: 'Status',
        },
        valid_from: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Start date',
        },
        valid_until: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'End date'
        },
        max_site: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Max site',
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Price',
        },
        scope_label: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Scope label',
        },
    } as ModelAttributes,
    options: {
        tableName: `${G.tableAp}_licence`,
        timestamps: true,
        comment: 'Licence table and validation information',
        indexes: [
            {
                fields: ['guid'],
                name: 'idx_licence_guid',
            },
            {
                fields: ['tenant'],
                name: 'idx_licence_tenant',
            },
            {
                fields: ['family'],
                name: 'idx_licence_family',
            },
            {
                fields: ['status'],
                name: 'idx_licence_status',
            },
            {
                fields: ['valid_from'],
                name: 'idx_licence_valid_from',
            },
            {
                fields: ['valid_until'],
                name: 'idx_licence_valid_until',
            },
            {
                fields: ['max_site'],
                name: 'idx_licence_max_site',
            },
            {
                fields: ['price'],
                name: 'idx_licence_price',
            },
        ]
    } as ModelOptions,

    validation: {
        validateFamily:(family: Family): boolean =>{
            return Object.values(Family).includes(family);
        },
        validateStatus: (status: Status):boolean =>{
            return Object.values(Status).includes(status);
        },
        validateDate: (date: Date): boolean =>{
            return date instanceof Date && !isNaN(date.getTime());
        },
        validateMaxSite: (maxSite: number): boolean => {
            return Number.isInteger(maxSite) && maxSite > 0;
        },
        validatePrice: (price: number): boolean => {
            return Number.isInteger(price) && price > 0;
        },
        validateScopeLabel: (label: string): boolean => {
            return typeof label === 'string' && label.length <= 500;
        },
        cleanData: (data: any): void => {
            if(data.scope_label){
                data.scope_label = data.scope_label.trim();
            }
        }
    }
}