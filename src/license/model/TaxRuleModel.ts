import BaseModel from '../database/db.base';
import G from '../../tools/glossary';
import { TaxRuleDbStructure } from '../database/data/tax.rule.db';

export default class TaxRuleModel extends BaseModel {
  public readonly db = {
    tableName: `${G.tableConf}_tax_rule`,
    id: 'id',
    guid: 'guid',
    country_code: 'country_code',
    tax_type: 'tax_type',
    tax_name: 'tax_name',
    tax_rate: 'tax_rate',
    applies_to: 'applies_to',
    required_tax_number: 'required_tax_number',
    effective_date: 'effective_date',
    expiry_date: 'expiry_date',
    active: 'active',
  } as const;

  protected id?: number;
  protected guid?: number;
  protected country_code?: string;
  protected tax_type?: string;
  protected tax_name?: string;
  protected tax_rate?: number;
  protected applies_to?: string;
  protected required_tax_number?: boolean;
  protected effective_date?: Date;
  protected expiry_date?: Date;
  protected active?: boolean;

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
   * Liste tous les enregistrements selon les conditions
   */
  protected async listAll(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.findAll(this.db.tableName, conditions, paginationOptions);
  }

  /**
   * Récupère toutes les règles fiscales par code pays
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
   * Récupère toutes les règles fiscales par type de taxe
   */
  protected async listAllByTaxType(
    tax_type: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.tax_type]: tax_type }, paginationOptions);
  }

  /**
   * Récupère toutes les règles fiscales par "s'applique à"
   */
  protected async listAllByAppliesTo(
    applies_to: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.applies_to]: applies_to }, paginationOptions);
  }

  /**
   * Récupère toutes les règles fiscales actives/inactives
   */
  protected async listAllByActiveStatus(
    active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.active]: active }, paginationOptions);
  }

  /**
   * Récupère toutes les règles fiscales par statut de numéro de taxe requis
   */
  protected async listAllByRequiredTaxNumber(
    required_tax_number: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll(
      { [this.db.required_tax_number]: required_tax_number },
      paginationOptions,
    );
  }

  /**
   * Crée une nouvelle règle fiscale
   */
  protected async create(): Promise<void> {
    await this.validate();

    // Générer le GUID automatiquement
    const guid = await this.guidGenerator(this.db.tableName, 6);
    if (!guid) {
      throw new Error('Failed to generate GUID for tax rule entry');
    }

    const lastID = await this.insertOne(this.db.tableName, {
      [this.db.guid]: guid,
      [this.db.country_code]: this.country_code,
      [this.db.tax_type]: this.tax_type,
      [this.db.tax_name]: this.tax_name,
      [this.db.tax_rate]: this.tax_rate,
      [this.db.applies_to]: this.applies_to || 'license_fee',
      [this.db.required_tax_number]:
        this.required_tax_number !== undefined ? this.required_tax_number : true,
      [this.db.effective_date]: this.effective_date || new Date(),
      [this.db.expiry_date]: this.expiry_date,
      [this.db.active]: this.active !== undefined ? this.active : true,
    });

    console.log(
      `💰 Règle fiscale créée - Pays: ${this.country_code} | Type: ${this.tax_type} | GUID: ${guid}`,
    );

    if (!lastID) {
      throw new Error('Failed to create tax rule entry');
    }

    this.id = typeof lastID === 'object' ? lastID.id : lastID;
    this.guid = guid;

    console.log('✅ Règle fiscale créée avec ID:', this.id);
  }

  /**
   * Met à jour une règle fiscale existante
   */
  protected async update(): Promise<void> {
    await this.validate();

    if (!this.id) {
      throw new Error('Tax rule ID is required for update');
    }

    const updateData: Record<string, any> = {};
    if (this.country_code !== undefined) updateData[this.db.country_code] = this.country_code;
    if (this.tax_type !== undefined) updateData[this.db.tax_type] = this.tax_type;
    if (this.tax_name !== undefined) updateData[this.db.tax_name] = this.tax_name;
    if (this.tax_rate !== undefined) updateData[this.db.tax_rate] = this.tax_rate;
    if (this.applies_to !== undefined) updateData[this.db.applies_to] = this.applies_to;
    if (this.required_tax_number !== undefined)
      updateData[this.db.required_tax_number] = this.required_tax_number;
    if (this.effective_date !== undefined) updateData[this.db.effective_date] = this.effective_date;
    if (this.expiry_date !== undefined) updateData[this.db.expiry_date] = this.expiry_date;
    if (this.active !== undefined) updateData[this.db.active] = this.active;

    const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });
    if (!affected) {
      throw new Error('Failed to update tax rule entry');
    }
  }

  /**
   * Supprime une règle fiscale
   */
  protected async trash(id: number): Promise<boolean> {
    return await this.deleteOne(this.db.tableName, { [this.db.id]: id });
  }

  /**
   * Valide les données avant création/mise à jour
   */
  private async validate(): Promise<void> {
    // Valider le code pays (obligatoire)
    if (
      !this.country_code ||
      !TaxRuleDbStructure.validation.validateCountryCode(this.country_code)
    ) {
      throw new Error(
        'Country code is required and must be exactly 2 uppercase letters (ISO 3166-1 alpha-2)',
      );
    }

    // Valider le type de taxe (obligatoire)
    if (!this.tax_type || !TaxRuleDbStructure.validation.validateTaxType(this.tax_type)) {
      throw new Error(
        'Tax type is required and must be alphanumeric with underscores (1-20 characters)',
      );
    }

    // Valider le nom de la taxe (obligatoire)
    if (!this.tax_name || !TaxRuleDbStructure.validation.validateTaxName(this.tax_name)) {
      throw new Error('Tax name is required and must be between 2 and 50 characters');
    }

    // Valider le taux de taxe (obligatoire)
    if (
      this.tax_rate === undefined ||
      this.tax_rate === null ||
      !TaxRuleDbStructure.validation.validateTaxRate(this.tax_rate.toString())
    ) {
      throw new Error('Tax rate is required and must be a valid decimal between 0 and 1');
    }

    // Valider "s'applique à" (optionnel)
    if (this.applies_to && !TaxRuleDbStructure.validation.validateAppliesTo(this.applies_to)) {
      throw new Error('Applies to must be alphanumeric with underscores (1-20 characters)');
    }

    // Valider le numéro de taxe requis (optionnel avec valeur par défaut)
    if (
      this.required_tax_number !== undefined &&
      !TaxRuleDbStructure.validation.validateBoolean(this.required_tax_number)
    ) {
      throw new Error('Required tax number must be a boolean value');
    }

    // Valider la date effective (optionnel avec valeur par défaut)
    if (this.effective_date && !TaxRuleDbStructure.validation.validateDate(this.effective_date)) {
      throw new Error('Effective date must be a valid date');
    }

    // Valider la date d'expiration (optionnel)
    if (this.expiry_date && !TaxRuleDbStructure.validation.validateDate(this.expiry_date)) {
      throw new Error('Expiry date must be a valid date');
    }

    // Valider que la date d'expiration est après la date effective
    if (this.effective_date && this.expiry_date && this.expiry_date <= this.effective_date) {
      throw new Error('Expiry date must be after effective date');
    }

    // Valider le statut actif (optionnel avec valeur par défaut)
    if (this.active !== undefined && !TaxRuleDbStructure.validation.validateBoolean(this.active)) {
      throw new Error('Active must be a boolean value');
    }

    // Nettoyer les données
    TaxRuleDbStructure.validation.cleanData(this);
  }
}
