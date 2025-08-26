import CountryModel from '../model/CountryModel';
import W from '../../tools/watcher';
import G from '../../tools/glossary';
import { responseStructure as RS, tableStructure as TS } from '../../utils/response.model';
import Revision from '../../tools/revision';

export default class Country extends CountryModel {
  constructor() {
    super();
  }

  /**
   * Exports country items with revision information.
   */
  static async exportable(paginationOptions: { offset?: number; limit?: number } = {}): Promise<{
    revision: string;
    pagination: { offset?: number; limit?: number; count?: number };
    items: any[];
  }> {
    const revision = await Revision.getRevision(TS.COUNTRY);
    let data: any[] = [];

    const allCountries = await this._list({ ['active']: true }, paginationOptions);
    if (allCountries) {
      data = allCountries.map(
        (country) => country.toJSON(),
        //     ({
        //     code: country.getCode(),
        //     name_en: country.getNameEn(),
        //     name_local: country.getNameLocal(),
        //     default_currency_code: country.getDefaultCurrencyCode(),
        //     default_language_code: country.getDefaultLanguageCode(),
        //     active: country.isActive(),
        //     timezone_default: country.getTimezoneDefault(),
        //     phone_prefix: country.getPhonePrefix(),
        // })
      );
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
   * Loads a country based on the provided identifier.
   */
  static _load(
    identifier: any,
    byGuid: boolean = false,
    byCode: boolean = false,
  ): Promise<Country | null> {
    return new Country().load(identifier, byGuid, byCode);
  }

  /**
   * Liste les pays selon les conditions
   */
  static _list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    return new Country().list(conditions, paginationOptions);
  }

  /**
   * Liste les pays par fuseau horaire
   */
  static _listByTimezone(
    timezone: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    return new Country().listByTimezone(timezone, paginationOptions);
  }

  /**
   * Liste les pays par code devise
   */
  static _listByCurrencyCode(
    currency_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    return new Country().listByCurrencyCode(currency_code, paginationOptions);
  }

  /**
   * Liste les pays par code de langue
   */
  static _listByLanguageCode(
    language_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    return new Country().listByLanguageCode(language_code, paginationOptions);
  }

  /**
   * Liste les pays par statut actif
   */
  static _listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    return new Country().listByActiveStatus(is_active, paginationOptions);
  }

  /**
   * Convertit des données en objet Country
   */
  static _toObject(data: any): Country {
    return new Country().hydrate(data);
  }

  // === SETTERS FLUENT ===
  setCode(code: string): Country {
    this.code = code.toUpperCase();
    return this;
  }

  setNameEn(name_en: string): Country {
    this.name_en = name_en;
    return this;
  }

  setNameLocal(name_local: string): Country {
    this.name_local = name_local;
    return this;
  }

  setDefaultCurrencyCode(default_currency_code: string): Country {
    this.default_currency_code = default_currency_code.toUpperCase();
    return this;
  }

  setDefaultLanguageCode(default_language_code: string): Country {
    this.default_language_code = default_language_code.toLowerCase();
    return this;
  }

  setActive(active: boolean): Country {
    this.active = active;
    return this;
  }

  setTimezoneDefault(timezone_default: string): Country {
    this.timezone_default = timezone_default;
    return this;
  }

  setPhonePrefix(phone_prefix: string): Country {
    this.phone_prefix = phone_prefix;
    return this;
  }

  // region Méthodes privées

  // === GETTERS ===
  getId(): number | undefined {
    return this.id;
  }

  getGuid(): number | undefined {
    return this.guid;
  }

  // endregion

  getCode(): string | undefined {
    return this.code;
  }

  getNameEn(): string | undefined {
    return this.name_en;
  }

  getNameLocal(): string | undefined {
    return this.name_local;
  }

  getDefaultCurrencyCode(): string | undefined {
    return this.default_currency_code;
  }

  getDefaultLanguageCode(): string | undefined {
    return this.default_language_code;
  }

  isActive(): boolean | undefined {
    return this.active;
  }

  getTimezoneDefault(): string | undefined {
    return this.timezone_default;
  }

  getPhonePrefix(): string | undefined {
    return this.phone_prefix;
  }

  /**
   * Obtient le nom complet avec l'émoji du drapeau (si présent dans name_en)
   */
  getDisplayName(): string {
    return this.name_en || 'Unknown Country';
  }

  /**
   * Obtient le nom à utiliser selon la préférence (local en priorité, sinon anglais)
   */
  getPreferredName(): string {
    return this.name_local || this.name_en || 'Unknown Country';
  }

  /**
   * Obtient l'affichage complet de la devise
   */
  getCurrencyDisplay(): string {
    return this.default_currency_code || 'N/A';
  }

  /**
   * Vérifie si le pays utilise le franc CFA
   */
  isCfaZone(): boolean {
    return this.default_currency_code === 'XAF' || this.default_currency_code === 'XOF';
  }

  /**
   * Vérifie si le pays utilise l'Euro
   */
  isEuroZone(): boolean {
    return this.default_currency_code === 'EUR';
  }

  /**
   * Obtient l'identifiant sous forme de chaîne (code ISO)
   */
  getIdentifier(): string {
    return this.code || 'Unknown';
  }

  /**
   * Sauvegarde le pays (création ou mise à jour)
   */
  async save(): Promise<void> {
    try {
      if (this.isNew()) {
        await this.create();
      } else {
        await this.update();
      }
    } catch (error: any) {
      console.error('⌐ Erreur sauvegarde pays:', error.message);
      throw new Error(error);
    }
  }

  /**
   * Supprime le pays
   */
  async delete(): Promise<boolean> {
    if (this.id !== undefined) {
      await W.isOccur(!this.id, `${G.identifierMissing.code}: Country Delete`);
      return await this.trash(this.id);
    }
    return false;
  }

  /**
   * Loads a Country object based on the provided identifier and search method.
   *
   * @param {any} identifier - The identifier used to find the Country object.
   *                           Can be a GUID, a code (ISO), or an ID number.
   * @param {boolean} [byGuid=false] - Specifies if the lookup should be performed by GUID.
   * @param {boolean} [byCode=false] - Specifies if the lookup should be performed by ISO code.
   * @return {Promise<Country | null>} A promise that resolves to the located Country object, or null if not found.
   */
  async load(
    identifier: any,
    byGuid: boolean = false,
    byCode: boolean = false,
  ): Promise<Country | null> {
    const data = byGuid
      ? await this.findByGuid(identifier)
      : byCode
        ? await this.findByCode(identifier)
        : await this.find(Number(identifier));

    if (!data) return null;
    return this.hydrate(data);
  }

  /**
   * Liste les pays selon les conditions
   */
  async list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    const dataset = await this.listAll(conditions, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Country().hydrate(data));
  }

  /**
   * Liste les pays par fuseau horaire
   */
  async listByTimezone(
    timezone: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    const dataset = await this.listAllByTimezone(timezone, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Country().hydrate(data));
  }

  /**
   * Liste les pays par code devise
   */
  async listByCurrencyCode(
    currency_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    const dataset = await this.listAllByCurrencyCode(currency_code, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Country().hydrate(data));
  }

  // === MÉTHODES STATIQUES ===

  /**
   * Liste les pays par code de langue
   */
  async listByLanguageCode(
    language_code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    const dataset = await this.listAllByLanguageCode(language_code, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Country().hydrate(data));
  }

  /**
   * Liste les pays actifs ou inactifs
   */
  async listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Country[] | null> {
    const dataset = await this.listAllByActiveStatus(is_active, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Country().hydrate(data));
  }

  /**
   * Vérifie si le pays est nouveau
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
      [RS.CODE]: this.code,
      [RS.NAME_EN]: this.name_en,
      [RS.NAME_LOCAL]: this.name_local,
      [RS.DEFAULT_CURRENCY_CODE]: this.default_currency_code,
      [RS.DEFAULT_LANGUAGE_CODE]: this.default_language_code,
      [RS.IS_ACTIVE]: this.active,
      [RS.TIMEZONE_DEFAULT]: this.timezone_default,
      [RS.PHONE_PREFIX]: this.phone_prefix,
    };
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `Country { ${RS.ID}: ${this.id}, ${RS.GUID}: ${this.guid}, ${RS.CODE}: "${this.code}", ${RS.NAME_EN}: "${this.name_en}" }`;
  }

  /**
   * Hydrate l'instance avec les données
   */
  private hydrate(data: any): Country {
    this.id = data.id;
    this.guid = data.guid;
    this.code = data.code;
    this.name_en = data.name_en;
    this.name_local = data.name_local;
    this.default_currency_code = data.default_currency_code;
    this.default_language_code = data.default_language_code;
    this.active = data.active;
    this.timezone_default = data.timezone_default;
    this.phone_prefix = data.phone_prefix;
    return this;
  }
}
