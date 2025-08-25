import BaseModel from '../database/db.base';
import G from '../tools/glossary';
import { CountryDbStructure } from '../database/data/country.db';

export default class CountryModel extends BaseModel {
  public readonly db = {
    tableName: `${G.tableConf}_country`,
    id: 'id',
    guid: 'guid',
    code: 'code',
    name_en: 'name_en',
    name_local: 'name_local',
    default_currency_code: 'default_currency_code',
    default_language_code: 'default_language_code',
    active: 'active',
    timezone_default: 'timezone_default',
    phone_prefix: 'phone_prefix',
  } as const;

  protected id?: number;
  protected guid?: number;
  protected code?: string;
  protected name_en?: string;
  protected name_local?: string;
  protected default_currency_code?: string;
  protected default_language_code?: string;
  protected active?: boolean;
  protected timezone_default?: string;
  protected phone_prefix?: string;

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
   * Trouve un enregistrement par son code ISO (maintenant dans le champ 'code')
   */
  protected async findByCode(code: string): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.code]: code.toUpperCase() });
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
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.findAll(this.db.tableName, conditions, paginationOptions);
  }

  /**
   * Récupère tous les pays par fuseau horaire
   */
  protected async listAllByTimezone(
    timezone: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.findAll(
      this.db.tableName,
      { [this.db.timezone_default]: timezone },
      paginationOptions,
    );
  }

  /**
   * Récupère tous les pays par currency_code
   */
  protected async listAllByCurrencyCode(
    currency_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll(
      { [this.db.default_currency_code]: currency_code },
      paginationOptions,
    );
  }

  /**
   * Récupère tous les pays par code de langue
   */
  protected async listAllByLanguageCode(
    language_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll(
      { [this.db.default_language_code]: language_code },
      paginationOptions,
    );
  }

  /**
   * Récupère tous les pays actifs/inactifs
   */
  protected async listAllByActiveStatus(
    active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.active]: active }, paginationOptions);
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

    // Vérifier l'unicité du code ISO
    const existingCode = await this.findByCode(this.code!);
    if (existingCode) {
      throw new Error(`Country code '${this.code}' already exists`);
    }

    const lastID = await this.insertOne(this.db.tableName, {
      [this.db.guid]: guid,
      [this.db.code]: this.code,
      [this.db.name_en]: this.name_en,
      [this.db.name_local]: this.name_local,
      [this.db.default_currency_code]: this.default_currency_code,
      [this.db.default_language_code]: this.default_language_code,
      [this.db.active]: this.active !== undefined ? this.active : true,
      [this.db.timezone_default]: this.timezone_default || 'UTC',
      [this.db.phone_prefix]: this.phone_prefix,
    });

    console.log(`🌍 Pays créé - Code: ${this.code} | Nom: ${this.name_en} | GUID: ${guid}`);

    if (!lastID) {
      throw new Error('Failed to create country entry');
    }

    this.id = typeof lastID === 'object' ? lastID.id : lastID;
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
    if (this.name_en !== undefined) updateData[this.db.name_en] = this.name_en;
    if (this.name_local !== undefined) updateData[this.db.name_local] = this.name_local;
    if (this.default_currency_code !== undefined)
      updateData[this.db.default_currency_code] = this.default_currency_code;
    if (this.default_language_code !== undefined)
      updateData[this.db.default_language_code] = this.default_language_code;
    if (this.active !== undefined) updateData[this.db.active] = this.active;
    if (this.timezone_default !== undefined)
      updateData[this.db.timezone_default] = this.timezone_default;
    if (this.phone_prefix !== undefined) updateData[this.db.phone_prefix] = this.phone_prefix;

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
    // Valider le code ISO (maintenant dans le champ 'code')
    if (!this.code || !CountryDbStructure.validation.validateCode(this.code)) {
      throw new Error('Country code must be exactly 2 uppercase letters (ISO 3166-1 alpha-2)');
    }

    // Valider le nom anglais (obligatoire)
    if (!this.name_en || !CountryDbStructure.validation.validateName(this.name_en)) {
      throw new Error('Country name (English) must be between 2 and 128 characters');
    }

    // Valider le nom local (optionnel)
    if (this.name_local && !CountryDbStructure.validation.validateName(this.name_local)) {
      throw new Error('Country local name must be between 2 and 128 characters');
    }

    // Valider le code devise (obligatoire)
    if (
      !this.default_currency_code ||
      !CountryDbStructure.validation.validateCurrencyCode(this.default_currency_code)
    ) {
      throw new Error(
        'Currency code is required and must be a valid ISO 4217 code (3 uppercase letters)',
      );
    }

    // Valider le code de langue (obligatoire)
    if (
      !this.default_language_code ||
      !CountryDbStructure.validation.validateLanguageCode(this.default_language_code)
    ) {
      throw new Error(
        'Language code is required and must be a valid ISO 639-1 code (2 lowercase letters)',
      );
    }

    // Valider le fuseau horaire (obligatoire avec valeur par défaut)
    if (
      this.timezone_default &&
      !CountryDbStructure.validation.validateTimezone(this.timezone_default)
    ) {
      throw new Error('Invalid timezone format. Use Continent/City or UTC±offset format');
    }

    // Valider le préfixe téléphonique (obligatoire)
    if (
      !this.phone_prefix ||
      !CountryDbStructure.validation.validatePhonePrefix(this.phone_prefix)
    ) {
      throw new Error(
        'Phone prefix is required and must follow the format +XXX (1-5 digits after +)',
      );
    }

    // Valider le statut actif (optionnel avec valeur par défaut)
    if (this.active !== undefined && !CountryDbStructure.validation.isActive(this.active)) {
      throw new Error('active must be a boolean value');
    }

    // Nettoyer les données
    CountryDbStructure.validation.cleanData(this);
  }
}
