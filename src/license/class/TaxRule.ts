import TaxRuleModel from '../model/TaxRuleModel';
import W from '../../tools/watcher';
import G from '../../tools/glossary';
import { responseStructure as RS, tableStructure as TS } from '../../utils/response.model';
import Revision from '../../tools/revision';

export default class TaxRule extends TaxRuleModel {
  constructor() {
    super();
  }

  static async exportable(paginationOptions: { offset?: number; limit?: number } = {}): Promise<{
    revision: string;
    pagination: { offset?: number; limit?: number; count?: number };
    items: any[];
  }> {
    const revision = await Revision.getRevision(TS.TAX_RULE);
    let items: any[] = [];

    const taxRules = await this._list({ ['active']: true }, paginationOptions);
    if (taxRules) {
      items = taxRules.map((tax) => tax.toJSON());
    }

    return {
      revision,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || items.length,
        count: items.length,
      },
      items,
    };
  }
  static _load(
    identifier: any,
    byGuid: boolean = false,
  ): Promise<TaxRule | null> {
    return new TaxRule().load(identifier, byGuid);
  }

  static _list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ) {
    return new TaxRule().list(conditions, paginationOptions);
  }

  static _listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<TaxRule[] | null> {
    return new TaxRule().listByActiveStatus(is_active, paginationOptions);
  }

  static _listByCountryCode(
    code: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<TaxRule[] | null> {
    return new TaxRule().listAllByCountryCode(code, paginationOptions);
  }
  static _listByTaxType(
    type: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<TaxRule[] | null> {
    return new TaxRule().listAllByTaxType(type, paginationOptions);
  }

  static _listByAppliesTo(
    value: string,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<TaxRule[] | null> {
    return new TaxRule().listAllByAppliesTo(value, paginationOptions);
  }

  static _listByRequiredTaxNumber(
    value: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<TaxRule[] | null> {
    return new TaxRule().listAllByRequiredTaxNumber(value, paginationOptions);
  }

  setCountryCode(code: string): TaxRule {
    this.country_code = code;
    return this;
  }

  setTaxType(type: string): TaxRule {
    this.tax_type = type;
    return this;
  }

  setTaxName(name: string): TaxRule {
    this.tax_name = name;
    return this;
  }

  setTaxRate(rate: number): TaxRule {
    this.tax_rate = rate;
    return this;
  }

  setAppliesTo(appliesTo: string): TaxRule {
    this.applies_to = appliesTo;
    return this;
  }

  setRequiredTaxNumber(required: boolean): TaxRule {
    this.required_tax_number = required;
    return this;
  }

  setEffectiveDate(value: Date): TaxRule {
    this.effective_date = value;
    return this;
  }

  setExpiryDate(value: Date): TaxRule {
    this.expiry_date = value;
    return this;
  }

  setActive(value: boolean): TaxRule {
    this.active = value;
    return this;
  }

  getId(): number | undefined {
    return this.id;
  }

  getGuid(): number | undefined {
    return this.guid;
  }
  getCountryCode(): string | undefined {
    return this.country_code;
  }
  getTaxType(): string | undefined {
    return this.tax_type;
  }
  getTaxName(): string | undefined {
    return this.tax_name;
  }
  getTaxRate(): number | undefined {
    return this.tax_rate;
  }
  getAppliesTo(): string | undefined {
    return this.applies_to;
  }
  RequiredTaxNumber(): boolean | undefined {
    return this.required_tax_number;
  }
  getEffectiveDate(): Date | undefined {
    return this.effective_date;
  }
  getExpiryDate(): Date | undefined {
    return this.expiry_date;
  }
  isActive(): boolean | undefined {
    return this.active;
  }

  async save(): Promise<void> {
    try {
      this.isNew() ? await this.create() : await this.update();
    } catch (error: any) {
      console.error('⌐ Erreur sauvegarde tax rule:', error.message);
      throw new Error(error);
    }
  }
  async delete(): Promise<boolean> {
    if (this.id !== undefined) {
      await W.isOccur(!this.id, `${G.identifierMissing.code}: Tax rule Delete`);
      return await this.trash(this.id);
    }
    return false;
  }
  async load(
    identifier: any,
    byGuid: boolean = false,
  ): Promise<TaxRule | null> {
    const data = byGuid
      ? await this.findByGuid(identifier)
        : await this.find(Number(identifier));
    if (!data) return null;
    return this.hydrate(data);
  }

  async list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<TaxRule[] | null> {
    const dataset = await this.listAll(conditions, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new TaxRule().hydrate(data));
  }

  async listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<TaxRule[] | null> {
    const dataset = await this.listAllByActiveStatus(is_active, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new TaxRule().hydrate(data));
  }

  isNew(): boolean {
    return this.id === undefined;
  }

  toJSON(): object {
    return {
      [RS.GUID]: this.guid,
      [RS.COUNTRY_CODE]: this.country_code,
      [RS.TAX_TYPE]: this.tax_type,
      [RS.TAX_NAME]: this.tax_name,
      [RS.TAX_RATE]: this.tax_rate,
      [RS.APPLIES_TO]: this.applies_to,
      [RS.REQUIRED_TAX_NUMBER]: this.required_tax_number,
      [RS.EFFECTIVE_DATE]: this.effective_date,
      [RS.EXPIRY_DATE]: this.expiry_date,
      [RS.IS_ACTIVE]: this.active,
    };
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `Tax rule { ${RS.ID}: ${this.id}, ${RS.GUID}: ${this.guid}, ${RS.COUNTRY_CODE}: "${this.country_code}", ${RS.TAX_TYPE}: "${this.tax_type}, ${RS.TAX_NAME}: "${this.tax_name}, ${RS.TAX_RATE}: "${this.tax_rate}, ${RS.APPLIES_TO}: "${this.applies_to}, ${RS.REQUIRED_TAX_NUMBER}: "${this.required_tax_number}, ${RS.EFFECTIVE_DATE}: "${this.effective_date}, ${RS.EXPIRY_DATE}: "${this.expiry_date}, ${RS.IS_ACTIVE}: "${this.active}" }`;
  }

  private hydrate(data: any): TaxRule {
    this.id = data.id;
    this.guid = data.guid;
    this.country_code = data.country_code;
    this.tax_type = data.tax_type;
    this.tax_name = data.tax_name;
    this.tax_rate = data.tax_rate;
    this.applies_to = data.applies_to;
    this.required_tax_number = data.required_tax_number;
    this.effective_date = data.effective_date;
    this.expiry_date = data.expiry_date;
    this.active = data.active;
    return this;
  }
}
