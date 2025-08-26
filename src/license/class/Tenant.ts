import TenantModel from '../model/TenantModel';
import W from '../../tools/watcher';
import G from '../../tools/glossary';
import { responseStructure as RS, tableStructure as TS } from '../../utils/response.model';
import Revision from '../../tools/revision';
import { Status } from '../database/data/tenant.db';

export default class Tenant extends TenantModel {
  constructor() {
    super();
  }

  /**
   * Exports tenant items with revision information.
   */
  static async exportable(paginationOptions: { offset?: number; limit?: number } = {}): Promise<{
    revision: string;
    pagination: { offset?: number; limit?: number; count?: number };
    items: any[];
  }> {
    const revision = await Revision.getRevision(TS.TENANT);
    let data: any[] = [];

    const allTenants = await this._list({ ['status']: Status.ACTIVE }, paginationOptions);
    if (allTenants) {
      data = allTenants.map(tenant => tenant.toJSON());
    }

    return {
      revision,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || data.length,
        count: data.length,
      },
      items: data,
    };
  }

  /**
   * Loads a tenant based on the provided identifier.
   */
  static _load(
    identifier: any,
    byGuid: boolean = false,
    byKey: boolean = false,
    bySubdomain: boolean = false,
  ): Promise<Tenant | null> {
    return new Tenant().load(identifier, byGuid, byKey, bySubdomain);
  }

  /**
   * Liste les tenants selon les conditions
   */
  static _list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    return new Tenant().list(conditions, paginationOptions);
  }

  /**
   * Liste les tenants par code pays
   */
  static _listByCountryCode(
    country_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    return new Tenant().listByCountryCode(country_code, paginationOptions);
  }

  /**
   * Liste les tenants par code devise
   */
  static _listByCurrencyCode(
    currency_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    return new Tenant().listByCurrencyCode(currency_code, paginationOptions);
  }

  /**
   * Liste les tenants par code de langue
   */
  static _listByLanguageCode(
    language_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    return new Tenant().listByLanguageCode(language_code, paginationOptions);
  }

  /**
   * Liste les tenants par fuseau horaire
   */
  static _listByTimezone(
    timezone: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    return new Tenant().listByTimezone(timezone, paginationOptions);
  }

  /**
   * Liste les tenants par exemption de taxe
   */
  static _listByTaxExempt(
    tax_exempt: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    return new Tenant().listByTaxExempt(tax_exempt, paginationOptions);
  }

  /**
   * Liste les tenants par statut
   */
  static _listByStatus(
    status: Status,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    return new Tenant().listByStatus(status, paginationOptions);
  }

  /**
   * Convertit des données en objet Tenant
   */
  static _toObject(data: any): Tenant {
    return new Tenant().hydrate(data);
  }

  // === SETTERS FLUENT ===
  setName(name: string): Tenant {
    this.name = name;
    return this;
  }

  setKey(key: string): Tenant {
    this.key = key;
    return this;
  }

  setCountryCode(country_code: string): Tenant {
    this.country_code = country_code.toUpperCase();
    return this;
  }

  setPrimaryCurrencyCode(primary_currency_code: string): Tenant {
    this.primary_currency_code = primary_currency_code.toUpperCase();
    return this;
  }

  setPreferredLanguageCode(preferred_language_code: string): Tenant {
    this.preferred_language_code = preferred_language_code.toLowerCase();
    return this;
  }

  setTimezone(timezone: string): Tenant {
    this.timezone = timezone;
    return this;
  }

  setTaxNumber(tax_number: string): Tenant {
    this.tax_number = tax_number;
    return this;
  }

  setTaxExempt(tax_exempt: boolean): Tenant {
    this.tax_exempt = tax_exempt;
    return this;
  }

  setBillingEmail(billing_email: string): Tenant {
    this.billing_email = billing_email;
    return this;
  }

  setBillingAddress(billing_address: string): Tenant {
    this.billing_address = billing_address;
    return this;
  }

  setBillingPhone(billing_phone: string): Tenant {
    this.billing_phone = billing_phone;
    return this;
  }

  setStatus(status: Status): Tenant {
    this.status = status;
    return this;
  }

  setSubdomain(subdomain: string): Tenant {
    this.subdomain = subdomain.toLowerCase();
    return this;
  }

  setDatabaseName(database_name: string): Tenant {
    this.database_name = database_name.toLowerCase();
    return this;
  }

  setDatabaseUsername(database_username: string): Tenant {
    this.database_username = database_username.toLowerCase();
    return this;
  }

  setDatabasePassword(database_password: string): Tenant {
    this.database_password = database_password;
    return this;
  }

  // === GETTERS ===
  getId(): number | undefined {
    return this.id;
  }

  getGuid(): number | undefined {
    return this.guid;
  }

  getName(): string | undefined {
    return this.name;
  }

  getKey(): string | undefined {
    return this.key;
  }

  getCountryCode(): string | undefined {
    return this.country_code;
  }

  getPrimaryCurrencyCode(): string | undefined {
    return this.primary_currency_code;
  }

  getPreferredLanguageCode(): string | undefined {
    return this.preferred_language_code;
  }

  getTimezone(): string | undefined {
    return this.timezone;
  }

  getTaxNumber(): string | undefined {
    return this.tax_number;
  }

  isTaxExempt(): boolean | undefined {
    return this.tax_exempt;
  }

  getBillingEmail(): string | undefined {
    return this.billing_email;
  }

  getBillingAddress(): string | undefined {
    return this.billing_address;
  }

  getBillingPhone(): string | undefined {
    return this.billing_phone;
  }

  getStatus(): Status | undefined {
    return this.status;
  }

  getSubdomain(): string | undefined {
    return this.subdomain;
  }

  getDatabaseName(): string | undefined {
    return this.database_name;
  }

  getDatabaseUsername(): string | undefined {
    return this.database_username;
  }

  getDatabasePassword(): string | undefined {
    return this.database_password;
  }

  /**
   * Obtient le nom d'affichage du tenant
   */
  getDisplayName(): string {
    return this.name || 'Unknown Tenant';
  }

  /**
   * Obtient l'identifiant sous forme de chaîne (clé)
   */
  getIdentifier(): string {
    return this.key || 'Unknown';
  }

  /**
   * Obtient l'URL complète du tenant
   */
  getFullUrl(): string {
    return this.subdomain ? `https://${this.subdomain}.yourdomain.com` : 'N/A';
  }

  /**
   * Vérifie si le tenant est actif
   */
  isActive(): boolean {
    return this.status === Status.ACTIVE;
  }

  /**
   * Vérifie si le tenant est suspendu
   */
  isSuspended(): boolean {
    return this.status === Status.SUSPENDED;
  }

  /**
   * Vérifie si le tenant est terminé
   */
  isTerminated(): boolean {
    return this.status === Status.TERMINATED;
  }

  /**
   * Vérifie si le tenant utilise le franc CFA
   */
  isCfaZone(): boolean {
    return this.primary_currency_code === 'XAF' || this.primary_currency_code === 'XOF';
  }

  /**
   * Vérifie si le tenant utilise l'Euro
   */
  isEuroZone(): boolean {
    return this.primary_currency_code === 'EUR';
  }

  /**
   * Sauvegarde le tenant (création ou mise à jour)
   */
  async save(): Promise<void> {
    try {
      if (this.isNew()) {
        await this.create();
      } else {
        await this.update();
      }
    } catch (error: any) {
      console.error('⚠️ Erreur sauvegarde tenant:', error.message);
      throw new Error(error);
    }
  }

  /**
   * Supprime le tenant
   */
  async delete(): Promise<boolean> {
    if (this.id !== undefined) {
      await W.isOccur(!this.id, `${G.identifierMissing.code}: Tenant Delete`);
      return await this.trash(this.id);
    }
    return false;
  }

  /**
   * Loads a Tenant object based on the provided identifier and search method.
   *
   * @param {any} identifier - The identifier used to find the Tenant object.
   *                           Can be a GUID, a key, a subdomain, or an ID number.
   * @param {boolean} [byGuid=false] - Specifies if the lookup should be performed by GUID.
   * @param {boolean} [byKey=false] - Specifies if the lookup should be performed by key.
   * @param {boolean} [bySubdomain=false] - Specifies if the lookup should be performed by subdomain.
   * @return {Promise<Tenant | null>} A promise that resolves to the located Tenant object, or null if not found.
   */
  async load(
    identifier: any,
    byGuid: boolean = false,
    byKey: boolean = false,
    bySubdomain: boolean = false,
  ): Promise<Tenant | null> {
    const data = byGuid
      ? await this.findByGuid(identifier)
      : byKey
        ? await this.findByKey(identifier)
        : bySubdomain
          ? await this.findBySubdomain(identifier)
          : await this.find(Number(identifier));

    if (!data) return null;
    return this.hydrate(data);
  }

  /**
   * Liste les tenants selon les conditions
   */
  async list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    const dataset = await this.listAll(conditions, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Tenant().hydrate(data));
  }

  /**
   * Liste les tenants par code pays
   */
  async listByCountryCode(
    country_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    const dataset = await this.listAllByCountryCode(country_code, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Tenant().hydrate(data));
  }

  /**
   * Liste les tenants par code devise
   */
  async listByCurrencyCode(
    currency_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    const dataset = await this.listAllByCurrencyCode(currency_code, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Tenant().hydrate(data));
  }

  /**
   * Liste les tenants par code de langue
   */
  async listByLanguageCode(
    language_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    const dataset = await this.listAllByLanguageCode(language_code, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Tenant().hydrate(data));
  }

  /**
   * Liste les tenants par fuseau horaire
   */
  async listByTimezone(
    timezone: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    const dataset = await this.listAllByTimezone(timezone, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Tenant().hydrate(data));
  }

  /**
   * Liste les tenants par exemption de taxe
   */
  async listByTaxExempt(
    tax_exempt: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    const dataset = await this.listAllByTaxExempt(tax_exempt, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Tenant().hydrate(data));
  }

  /**
   * Liste les tenants par statut
   */
  async listByStatus(
    status: Status,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Tenant[] | null> {
    const dataset = await this.listAllByStatus(status, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Tenant().hydrate(data));
  }

  /**
   * Vérifie si le tenant est nouveau
   */
  isNew(): boolean {
    return this.id === undefined;
  }

  /**
   * Conversion JSON pour API
   */
  toJSON(): object {
    return {
      [RS.GUID]: this.guid,
      [RS.NAME]: this.name,
      [RS.KEY]: this.key,
      [RS.COUNTRY_CODE]: this.country_code,
      [RS.PRIMARY_CURRENCY_CODE]: this.primary_currency_code,
      [RS.PREFERRED_LANGUAGE_CODE]: this.preferred_language_code,
      [RS.TIMEZONE]: this.timezone,
      [RS.TAX_NUMBER]: this.tax_number,
      [RS.TAX_EXEMPT]: this.tax_exempt,
      [RS.BILLING_EMAIL]: this.billing_email,
      [RS.BILLING_ADDRESS]: this.billing_address,
      [RS.BILLING_PHONE]: this.billing_phone,
      [RS.STATUS]: this.status,
      [RS.SUBDOMAIN]: this.subdomain,
      [RS.DATABASE_NAME]: this.database_name,
      [RS.DATABASE_USERNAME]: this.database_username,
      // Note: Ne pas exposer le mot de passe dans le JSON
    };
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `Tenant { ${RS.ID}: ${this.id}, ${RS.GUID}: ${this.guid}, ${RS.KEY}: "${this.key}", ${RS.NAME}: "${this.name}" }`;
  }

  /**
   * Hydrate l'instance avec les données
   */
  private hydrate(data: any): Tenant {
    this.id = data.id;
    this.guid = data.guid;
    this.name = data.name;
    this.key = data.key;
    this.country_code = data.country_code;
    this.primary_currency_code = data.primary_currency_code;
    this.preferred_language_code = data.preferred_language_code;
    this.timezone = data.timezone;
    this.tax_number = data.tax_number;
    this.tax_exempt = data.tax_exempt;
    this.billing_email = data.billing_email;
    this.billing_address = data.billing_address;
    this.billing_phone = data.billing_phone;
    this.status = data.status;
    this.subdomain = data.subdomain;
    this.database_name = data.database_name;
    this.database_username = data.database_username;
    this.database_password = data.database_password;
    return this;
  }
}