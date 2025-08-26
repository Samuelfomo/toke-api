import ExchangeRateModel from '../model/ExchangeRateModel';
import W from '../../tools/watcher';
import G from '../../tools/glossary';
import { responseStructure as RS, tableStructure as TS } from '../../utils/response.model';
import Revision from '../../tools/revision';

export default class ExchangeRate extends ExchangeRateModel {
  constructor() {
    super();
  }

  static async exportable(paginationOptions: { offset?: number; limit?: number } = {}): Promise<{
    revision: string;
    pagination: { offset?: number; limit?: number; count?: number };
    items: any[];
  }> {
    const revision = await Revision.getRevision(TS.EXCHANGE_RATE);
    let items: any[] = [];

    const exchangeRates = await this._list({ ['current']: true }, paginationOptions);
    if (exchangeRates) {
      items = exchangeRates.map((rate) => rate.toJSON());
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

  static _load(identifier: any, byGuid: boolean = false): Promise<ExchangeRate | null> {
    return new ExchangeRate().load(identifier, byGuid);
  }

  static _list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ) {
    return new ExchangeRate().list(conditions, paginationOptions);
  }

  static _listByCurrentStatus(
    is_current: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<ExchangeRate[] | null> {
    return new ExchangeRate().listByCurrentStatus(is_current, paginationOptions);
  }

  static async _getLastModificationTime(): Promise<Date | null> {
    return await new ExchangeRate().getLastModification();
  }

  // Setters avec validation et formatage
  setFromCurrencyCode(code: string): ExchangeRate {
    this.from_currency_code = code.toUpperCase();
    return this;
  }

  setToCurrencyCode(code: string): ExchangeRate {
    this.to_currency_code = code.toUpperCase();
    return this;
  }

  setExchangeRate(rate: number): ExchangeRate {
    this.exchange_rate = rate;
    return this;
  }

  setCurrent(value: boolean): ExchangeRate {
    this.current = value;
    return this;
  }

  setCreatedBy(userId: number): ExchangeRate {
    this.created_by = userId;
    return this;
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getGuid(): number | undefined {
    return this.guid;
  }

  getFromCurrencyCode(): string | undefined {
    return this.from_currency_code?.toUpperCase();
  }

  getToCurrencyCode(): string | undefined {
    return this.to_currency_code?.toUpperCase();
  }

  getExchangeRate(): number | undefined {
    return this.exchange_rate;
  }

  isCurrent(): boolean | undefined {
    return this.current;
  }

  getCreatedBy(): number | undefined {
    return this.created_by;
  }

  // Méthodes métier spécifiques
  getCurrencyPair(): string {
    return `${this.from_currency_code}/${this.to_currency_code}`;
  }

  getInverseRate(): number | undefined {
    if (!this.exchange_rate || this.exchange_rate === 0) return undefined;
    return 1 / this.exchange_rate;
  }

  // Méthodes CRUD
  async save(): Promise<void> {
    try {
      this.isNew() ? await this.create() : await this.update();
    } catch (error: any) {
      console.error('⌐ Erreur sauvegarde exchange rate:', error.message);
      throw new Error(error);
    }
  }

  async delete(): Promise<boolean> {
    if (this.id !== undefined) {
      await W.isOccur(!this.id, `${G.identifierMissing.code}: Exchange Rate Delete`);
      return await this.trash(this.id);
    }
    return false;
  }

  async load(identifier: any, byGuid: boolean = false): Promise<ExchangeRate | null> {
    const data = byGuid ? await this.findByGuid(identifier) : await this.find(Number(identifier));
    if (!data) return null;
    return this.hydrate(data);
  }

  async list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<ExchangeRate[] | null> {
    const dataset = await this.listAll(conditions, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new ExchangeRate().hydrate(data));
  }

  async listByCurrentStatus(
    is_current: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<ExchangeRate[] | null> {
    const dataset = await this.listAllByCurrentStatus(is_current, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new ExchangeRate().hydrate(data));
  }

  isNew(): boolean {
    return this.id === undefined;
  }

  toJSON(): object {
    return {
      [RS.GUID]: this.guid,
      [RS.FROM_CURRENCY_CODE]: this.from_currency_code,
      [RS.TO_CURRENCY_CODE]: this.to_currency_code,
      [RS.EXCHANGE_RATE]: this.exchange_rate,
      [RS.IS_CURRENT]: this.current,
      [RS.CREATED_BY]: this.created_by,
    };
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `ExchangeRate { ${RS.ID}: ${this.id}, ${RS.GUID}: ${this.guid}, pair: "${this.getCurrencyPair()}", rate: ${this.exchange_rate}, ${RS.IS_CURRENT}: ${this.current} }`;
  }

  private hydrate(data: any): ExchangeRate {
    this.id = data.id;
    this.guid = data.guid;
    this.from_currency_code = data.from_currency_code;
    this.to_currency_code = data.to_currency_code;
    this.exchange_rate = data.exchange_rate;
    this.current = data.current;
    this.created_by = data.created_by;
    return this;
  }
}
