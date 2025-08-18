import BaseModel from '../database/db.base';
import G from '../tools/glossary';
import { TenantDbStructure } from '../database/data/tenant.db';

export default class CountryModel extends BaseModel {
    public readonly db = {
        tableName: `${G.tableAp}_tenant`,
        id: 'id',
        guid: 'guid',
        subdomain: 'subdomain',
        company: 'company',
        support: 'support',
        current_site_count: 'current_site_count',
        site_count_limit: 'site_count_limit',
        profile: 'profile',
    } as const;

    protected id?: number;
    protected guid?: number;
    protected subdomain?: string;
    protected company?: string;
    protected support?: boolean;
    protected current_site_count?: number;
    protected site_count_limit?: number;
    protected profile?: number;

    protected constructor() {
        super();
    }

    /**
     * Trouve un enregistrement par son ID
     */
    protected async find(id: number): Promise<any> {
        return await this.findOne(this.db.tableName, { [this.db.id]: id });
    }

    /**
     * Trouve un enregistrement par son GUID
     */
    protected async findByGuid(guid: number): Promise<any> {
        return await this.findOne(this.db.tableName, { [this.db.guid]: guid });
    }

    /**
     * Trouve un enregistrement par son subdomain
     */
    protected async findBySubdomain(subdomain: string): Promise<any> {
        return await this.findOne(this.db.tableName, { [this.db.subdomain]: subdomain });
    }


    /**
     * Liste tous les enregistrements selon les conditions
     */
    protected async listAll(
        conditions: Record<string, any> = {},
        paginationOptions: { offset?: number; limit?: number } = {}
    ): Promise<any[]> {
        return await this.findAll(this.db.tableName, conditions, paginationOptions);
    }

    /**
     * Récupère tous les tenant en function de leur abonnement support
     */
    protected async listAllBySupport(
        support: boolean,
        paginationOptions: { offset?: number; limit?: number } = {}
    ): Promise<any[]> {
        return await this.listAll({ [this.db.support]: support }, paginationOptions
        );
    }

    protected async listAllByProfile(
        profile: number,
        paginationOptions: { offset?: number; limit?: number } = {}
    ): Promise<any[]> {
        return await this.listAll({ [this.db.profile]: profile }, paginationOptions
        );
    }

    /**
     * Crée un nouveau tenant
     */
    protected async create(): Promise<void> {
        await this.validate();

        // Générer le GUID automatiquement
        const guid = await this.guidGenerator(this.db.tableName, 6);
        if (!guid) {
            throw new Error('Failed to generate GUID for tenant entry');
        }

        // Vérifier l'unicité du subdomain
        const existingCode = await this.findBySubdomain(this.subdomain!);
        if (existingCode) {
            throw new Error(`Tenant subdomain '${this.subdomain}' already exists`);
        }

        const lastID = await this.insertOne(this.db.tableName, {
            [this.db.guid]: guid,
            [this.db.subdomain]: this.subdomain,
            [this.db.company]: this.company,
            [this.db.support]: this.support,
            [this.db.current_site_count]: this.current_site_count,
            [this.db.site_count_limit]: this.site_count_limit,
            [this.db.profile]: this.profile,
        });

        console.log(`🌍 Tenant créé - Subdomain: ${this.subdomain} | Company: ${this.company} | GUID: ${guid}`);

        if (!lastID) {
            throw new Error('Failed to create tenant entry');
        }

        this.id = lastID.id;
        this.guid = guid;

        console.log('✅ Tenant créé avec ID:', this.id);
    }

    /**
     * Met à jour un tenant existant
     */
    protected async update(): Promise<void> {
        await this.validate();

        if (!this.id) {
            throw new Error('Tenant ID is required for update');
        }

        const updateData: Record<string, any> = {};
        if (this.subdomain !== undefined) updateData[this.db.subdomain] = this.subdomain;
        if (this.company !== undefined) updateData[this.db.company] = this.company;
        if (this.support !== undefined) updateData[this.db.support] = this.support;
        if (this.current_site_count !== undefined) updateData[this.db.current_site_count] = this.current_site_count;
        if (this.site_count_limit !== undefined) updateData[this.db.site_count_limit] = this.site_count_limit;

        const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });
        if (!affected) {
            throw new Error('Failed to update country entry');
        }
    }

    /**
     * Supprime un tenant
     */
    protected async trash(id: number): Promise<boolean> {
        return await this.deleteOne(this.db.tableName, { [this.db.id]: id });
    }

    /**
     * Obtient la dernière modification
     */
    protected async getLastModification(): Promise<Date | null> {
        try {
            return await this.findLastModification(this.db.tableName);
        } catch (error: any) {
            console.log(`Failed to get last modification time: ${error.message}`);
            return null;
        }
    }

    /**
     * Valide les données avant création/mise à jour
     */
    private async validate(): Promise<void> {
    }
}
