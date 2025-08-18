import BaseModel from '../database/db.base';
import G from '../tools/glossary';
import { CountryDbStructure } from '../database/data/country.db';

export default class CountryModel extends BaseModel {
    public readonly db = {
        tableName: `${G.tableConf}_country`,
        id: 'id',
        guid: 'guid',
        code: 'code',
        iso: 'iso',
        name: 'name',
        timezone: 'timezone',
        mobileRegex: 'mobileRegex',
        flag: 'flag',
    } as const;

    protected id?: number;
    protected guid?: number;
    protected code?: number;
    protected iso?: string;
    protected name?: string;
    protected timezone?: string;
    protected mobileRegex?: string;
    protected flag?: string;

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
     * Trouve un enregistrement par son code numérique
     */
    protected async findByCode(code: number): Promise<any> {
        return await this.findOne(this.db.tableName, { [this.db.code]: code });
    }

    /**
     * Trouve un enregistrement par son code ISO
     */
    protected async findByIso(iso: string): Promise<any> {
        return await this.findOne(this.db.tableName, { [this.db.iso]: iso.toUpperCase() });
    }

    /**
     * Trouve un enregistrement par son GUID
     */
    protected async findByGuid(guid: number): Promise<any> {
        return await this.findOne(this.db.tableName, { [this.db.guid]: guid });
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
     * Récupère tous les pays par fuseau horaire
     */
    protected async listAllByTimezone(
        timezone: string,
        paginationOptions: { offset?: number; limit?: number } = {}
    ): Promise<any[]> {
        return await this.findAll(
            this.db.tableName,
            { [this.db.timezone]: timezone },
            paginationOptions
        );
    }

    /**
     * Crée un nouveau pays
     */
    protected async create(): Promise<void> {
        await this.validate();

        // Générer le GUID automatiquement
        const guid = await this.guidGenerator(this.db.tableName, 6);
        if (!guid) {
            throw new Error('Failed to generate GUID for country entry');
        }

        // Vérifier l'unicité du code
        const existingCode = await this.findByCode(this.code!);
        if (existingCode) {
            throw new Error(`Country code '${this.code}' already exists`);
        }

        // Vérifier l'unicité de l'ISO
        const existingIso = await this.findByIso(this.iso!);
        if (existingIso) {
            throw new Error(`Country ISO '${this.iso}' already exists`);
        }

        const lastID = await this.insertOne(this.db.tableName, {
            [this.db.guid]: guid,
            [this.db.code]: this.code,
            [this.db.iso]: this.iso,
            [this.db.name]: this.name,
            [this.db.timezone]: this.timezone,
            [this.db.mobileRegex]: this.mobileRegex,
            [this.db.flag]: this.flag,
        });

        console.log(`🌍 Pays créé - ISO: ${this.iso} | Code: ${this.code} | GUID: ${guid}`);

        if (!lastID) {
            throw new Error('Failed to create country entry');
        }

        this.id = lastID;
        this.guid = guid;

        console.log('✅ Pays créé avec ID:', this.id);
    }

    /**
     * Met à jour un pays existant
     */
    protected async update(): Promise<void> {
        await this.validate();

        if (!this.id) {
            throw new Error('Country ID is required for update');
        }

        const updateData: Record<string, any> = {};
        if (this.code !== undefined) updateData[this.db.code] = this.code;
        if (this.iso !== undefined) updateData[this.db.iso] = this.iso;
        if (this.name !== undefined) updateData[this.db.name] = this.name;
        if (this.timezone !== undefined) updateData[this.db.timezone] = this.timezone;
        if (this.mobileRegex !== undefined) updateData[this.db.mobileRegex] = this.mobileRegex;
        if (this.flag !== undefined) updateData[this.db.flag] = this.flag;

        const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });
        if (!affected) {
            throw new Error('Failed to update country entry');
        }
    }

    /**
     * Supprime un pays
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
        // Valider le code numérique
        if (this.code === undefined || !CountryDbStructure.validation.validateCode(this.code)) {
            throw new Error('Country code must be a positive integer between 1 and 999');
        }

        // Valider le code ISO
        if (!this.iso || !CountryDbStructure.validation.validateIso(this.iso)) {
            throw new Error('Country ISO must be exactly 2 uppercase letters (ISO 3166-1 alpha-2)');
        }

        // Valider le nom
        if (!this.name || !CountryDbStructure.validation.validateName(this.name)) {
            throw new Error('Country name must be between 2 and 128 characters');
        }

        // Valider le fuseau horaire (optionnel)
        if (this.timezone && !CountryDbStructure.validation.validateTimezone(this.timezone)) {
            throw new Error('Invalid timezone format. Use Continent/City or UTC±offset format');
        }

        // Valider la référence du regex mobile (optionnel)
        if (this.mobileRegex && !CountryDbStructure.validation.validateMobileRegex(this.mobileRegex)) {
            throw new Error(
                'Mobile regex reference must be a valid identifier (camelCase or UPPER_CASE)'
            );
        }

        // Valider le drapeau (optionnel)
        if (this.flag && !CountryDbStructure.validation.validateFlag(this.flag)) {
            throw new Error('Flag must be a valid emoji (1-10 characters)');
        }

        // Nettoyer les données
        CountryDbStructure.validation.cleanData(this);
    }
}
