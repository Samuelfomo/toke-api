import BaseModel from '../database/db.base';
import G from '../../tools/glossary';
import { Status, TenantDbStructure } from '../database/data/tenant.db';

export default class TenantModel extends BaseModel {
  public readonly db = {
    tableName: `${G.tableAp}_tenant`,
    id: 'id',
    guid: 'guid',
    name: 'name',
    key: 'key',
    country_code: 'country_code',
    primary_currency_code: 'primary_currency_code',
    preferred_language_code: 'preferred_language_code',
    timezone: 'timezone',
    tax_number: 'tax_number',
    tax_exempt: 'tax_exempt',
    billing_email: 'billing_email',
    billing_address: 'billing_address',
    billing_phone: 'billing_phone',
    status: 'status',
    subdomain: 'subdomain',
    database_name: 'database_name',
    database_username: 'database_username',
    database_password: 'database_password',
  } as const;

  protected id?: number;
  protected guid?: number;
  protected name?: string;
  protected key?: string;
  protected country_code?: string;
  protected primary_currency_code?: string;
  protected preferred_language_code?: string;
  protected timezone?: string;
  protected tax_number?: string;
  protected tax_exempt?: boolean;
  protected billing_email?: string;
  protected billing_address?: string;
  protected billing_phone?: string;
  protected status?: Status;
  protected subdomain?: string;
  protected database_name?: string;
  protected database_username?: string;
  protected database_password?: string;

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
   * Trouve un enregistrement par sa clé
   */
  protected async findByKey(key: string): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.key]: key });
  }

  /**
   * Trouve un enregistrement par son GUID
   */
  protected async findByGuid(guid: number): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.guid]: guid });
  }

  /**
   * Trouve un enregistrement par son sous-domaine
   */
  protected async findBySubdomain(subdomain: string): Promise<any> {
    return await this.findOne(this.db.tableName, { [this.db.subdomain]: subdomain.toLowerCase() });
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
   * Récupère tous les tenants par code pays
   */
  protected async listAllByCountryCode(
    country_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll(
      { [this.db.country_code]: country_code.toUpperCase() },
      paginationOptions,
    );
  }

  /**
   * Récupère tous les tenants par code devise
   */
  protected async listAllByCurrencyCode(
    currency_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll(
      { [this.db.primary_currency_code]: currency_code.toUpperCase() },
      paginationOptions,
    );
  }

  /**
   * Récupère tous les tenants par code de langue
   */
  protected async listAllByLanguageCode(
    language_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll(
      { [this.db.preferred_language_code]: language_code.toLowerCase() },
      paginationOptions,
    );
  }

  /**
   * Récupère tous les tenants par fuseau horaire
   */
  protected async listAllByTimezone(
    timezone: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.timezone]: timezone }, paginationOptions);
  }

  /**
   * Récupère tous les tenants exemptés/non exemptés de taxe
   */
  protected async listAllByTaxExempt(
    tax_exempt: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.tax_exempt]: tax_exempt }, paginationOptions);
  }

  /**
   * Récupère tous les tenants par statut
   */
  protected async listAllByStatus(
    status: Status,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.status]: status }, paginationOptions);
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

    // Vérifier l'unicité de la clé
    const existingKey = await this.findByKey(this.key!);
    if (existingKey) {
      throw new Error(`Tenant key '${this.key}' already exists`);
    }

    // Vérifier l'unicité du sous-domaine
    const existingSubdomain = await this.findBySubdomain(this.subdomain!);
    if (existingSubdomain) {
      throw new Error(`Tenant subdomain '${this.subdomain}' already exists`);
    }

    const lastID = await this.insertOne(this.db.tableName, {
      [this.db.guid]: guid,
      [this.db.name]: this.name,
      [this.db.key]: this.key,
      [this.db.country_code]: this.country_code,
      [this.db.primary_currency_code]: this.primary_currency_code,
      [this.db.preferred_language_code]: this.preferred_language_code || 'en',
      [this.db.timezone]: this.timezone || 'UTC',
      [this.db.tax_number]: this.tax_number,
      [this.db.tax_exempt]: this.tax_exempt !== undefined ? this.tax_exempt : false,
      [this.db.billing_email]: this.billing_email,
      [this.db.billing_address]: this.billing_address,
      [this.db.billing_phone]: this.billing_phone,
      [this.db.status]: this.status || Status.ACTIVE,
      // [this.db.subdomain]: this.subdomain,
      // [this.db.database_name]: this.database_name,
      // [this.db.database_username]: this.database_username,
      // [this.db.database_password]: this.database_password,
    });

    console.log(`🏢 Tenant créé - Nom: ${this.name} | Clé: ${this.key} | GUID: ${guid}`);

    if (!lastID) {
      throw new Error('Failed to create tenant entry');
    }

    this.id = typeof lastID === 'object' ? lastID.id : lastID;
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
    if (this.name !== undefined) updateData[this.db.name] = this.name;
    if (this.key !== undefined) updateData[this.db.key] = this.key;
    if (this.country_code !== undefined) updateData[this.db.country_code] = this.country_code;
    if (this.primary_currency_code !== undefined)
      updateData[this.db.primary_currency_code] = this.primary_currency_code;
    if (this.preferred_language_code !== undefined)
      updateData[this.db.preferred_language_code] = this.preferred_language_code;
    if (this.timezone !== undefined) updateData[this.db.timezone] = this.timezone;
    if (this.tax_number !== undefined) updateData[this.db.tax_number] = this.tax_number;
    if (this.tax_exempt !== undefined) updateData[this.db.tax_exempt] = this.tax_exempt;
    if (this.billing_email !== undefined) updateData[this.db.billing_email] = this.billing_email;
    if (this.billing_address !== undefined)
      updateData[this.db.billing_address] = this.billing_address;
    if (this.billing_phone !== undefined) updateData[this.db.billing_phone] = this.billing_phone;
    if (this.status !== undefined) updateData[this.db.status] = this.status;
    // if (this.subdomain !== undefined) updateData[this.db.subdomain] = this.subdomain;
    // if (this.database_name !== undefined) updateData[this.db.database_name] = this.database_name;
    // if (this.database_username !== undefined)
    //   updateData[this.db.database_username] = this.database_username;
    // if (this.database_password !== undefined)
    //   updateData[this.db.database_password] = this.database_password;

    const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });
    if (!affected) {
      throw new Error('Failed to update tenant entry');
    }
  }

  /**
   * Supprime un tenant
   */
  protected async trash(id: number): Promise<boolean> {
    return await this.deleteOne(this.db.tableName, { [this.db.id]: id });
  }

  /**
   * Valide les données avant création/mise à jour
   */
  private async validate(): Promise<void> {
    // Valider le nom (obligatoire)
    if (!this.name || !TenantDbStructure.validation.validateName(this.name)) {
      throw new Error('Tenant name is required and must be between 2 and 255 characters');
    }

    // Valider la clé (obligatoire)
    if (!this.key || !TenantDbStructure.validation.validateKey(this.key)) {
      throw new Error('Tenant key is required and must be between 2 and 100 characters');
    }

    // Valider le code pays (obligatoire)
    if (
      !this.country_code ||
      !TenantDbStructure.validation.validateCountryCode(this.country_code)
    ) {
      throw new Error(
        'Country code is required and must be exactly 2 uppercase letters (ISO 3166-1 alpha-2)',
      );
    }

    // Valider le code devise primaire (obligatoire)
    if (
      !this.primary_currency_code ||
      !TenantDbStructure.validation.validatePrimaryCurrencyCode(this.primary_currency_code)
    ) {
      throw new Error(
        'Primary currency code is required and must be exactly 3 uppercase letters (ISO 4217)',
      );
    }

    // Valider le code de langue préféré (optionnel avec valeur par défaut)
    if (
      this.preferred_language_code &&
      !TenantDbStructure.validation.validatePreferredLanguageCode(this.preferred_language_code)
    ) {
      throw new Error('Preferred language code must be exactly 2 lowercase letters (ISO 639-1)');
    }

    // Valider le fuseau horaire (optionnel avec valeur par défaut)
    if (this.timezone && !TenantDbStructure.validation.validateTimezone(this.timezone)) {
      throw new Error('Invalid timezone format. Use Continent/City or UTC±offset format');
    }

    // Valider le numéro de taxe (optionnel)
    if (this.tax_number && !TenantDbStructure.validation.validateTaxNumber(this.tax_number)) {
      throw new Error('Tax number must be alphanumeric with hyphens/underscores (2-50 characters)');
    }

    // Valider l'exemption de taxe (optionnel avec valeur par défaut)
    if (
      this.tax_exempt !== undefined &&
      !TenantDbStructure.validation.validateIsTaxExcempt(this.tax_exempt)
    ) {
      throw new Error('Tax exempt must be a boolean value');
    }

    // Valider l'email de facturation (obligatoire)
    if (
      !this.billing_email ||
      !TenantDbStructure.validation.validateBillingEmail(this.billing_email)
    ) {
      throw new Error('Billing email is required and must be a valid email address');
    }

    // Valider l'adresse de facturation (optionnel)
    if (
      this.billing_address &&
      !TenantDbStructure.validation.validateAddress(this.billing_address)
    ) {
      throw new Error('Billing address must not exceed 65535 characters');
    }

    // Valider le téléphone de facturation (optionnel)
    if (this.billing_phone && !TenantDbStructure.validation.validatePhone(this.billing_phone)) {
      throw new Error('Billing phone must contain a + sign and be between 2 and 20 characters');
    }

    // Valider le statut (optionnel avec valeur par défaut)
    if (this.status && !TenantDbStructure.validation.validateStatus(this.status)) {
      throw new Error('Status must be one of ACTIVE, SUSPENDED, TERMINATED');
    }

    // // Valider le sous-domaine (obligatoire)
    // if (!this.subdomain || !TenantDbStructure.validation.validateSubdomain(this.subdomain)) {
    //   throw new Error(
    //     'Subdomain is required and must be lowercase alphanumeric with hyphens (1-255 characters)',
    //   );
    // }
    //
    // // Valider le nom de base de données (obligatoire)
    // if (!this.database_name || !TenantDbStructure.validation.validateDbName(this.database_name)) {
    //   throw new Error(
    //     'Database name is required and must be lowercase alphanumeric with hyphens (1-128 characters)',
    //   );
    // }
    //
    // // Valider le nom d'utilisateur de base de données (obligatoire)
    // if (
    //   !this.database_username ||
    //   !TenantDbStructure.validation.validateDbUser(this.database_username)
    // ) {
    //   throw new Error(
    //     'Database username is required and must be lowercase alphanumeric with hyphens (1-128 characters)',
    //   );
    // }
    //
    // // Valider le mot de passe de base de données (obligatoire)
    // if (
    //   !this.database_password ||
    //   !TenantDbStructure.validation.validateDbPass(this.database_password)
    // ) {
    //   throw new Error(
    //     'Database password is required and must be at least 8 characters with uppercase, lowercase, and digit',
    //   );
    // }

    // Nettoyer les données
    TenantDbStructure.validation.cleanData(this);
  }
}
