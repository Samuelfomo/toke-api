import CurrencyModel from '../model/CurrencyModel';
import W from '../../tools/watcher';
import G from '../../tools/glossary';
import { responseStructure as RS, tableStructure as TS } from '../../utils/response.model';
import Revision from '../../tools/revision';

export default class Currency extends CurrencyModel {
  constructor() {
    super();
  }

  static async exportable(paginationOptions: { offset?: number; limit?: number } = {}): Promise<{
    revision: string;
    pagination: { offset?: number; limit?: number; count?: number };
    items: any[];
  }> {
    const revision = await Revision.getRevision(TS.CURRENCY);
    let items: any[] = [];

    const currencies = await this._list({ ['active']: true }, paginationOptions);
    if (currencies) {
      items = currencies.map((currency) => currency.toJSON());
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
    byCode: boolean = false,
  ): Promise<Currency | null> {
    return new Currency().load(identifier, byGuid, byCode);
  }

  static _list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ) {
    return new Currency().list(conditions, paginationOptions);
  }

  static _listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Currency[] | null> {
    return new Currency().listByActiveStatus(is_active, paginationOptions);
  }

  setCode(code: string): Currency {
    this.code = code.toUpperCase();
    return this;
  }

  setName(name: string): Currency {
    this.name = name;
    return this;
  }

  setSymbol(symbol: string): Currency {
    this.symbol = symbol;
    return this;
  }

  setDecimalPlaces(dec: number): Currency {
    this.decimal_places = dec;
    return this;
  }

  setActive(value: boolean): Currency {
    this.active = value;
    return this;
  }

  getId(): number | undefined {
    return this.id;
  }

  getGuid(): number | undefined {
    return this.guid;
  }

  getCode(): string | undefined {
    return this.code?.toUpperCase();
  }

  getName(): string | undefined {
    return this.name;
  }

  getSymbol(): string | undefined {
    return this.symbol;
  }

  getDecimalPlaces(): number | undefined {
    return this.decimal_places;
  }

  isActive(): boolean | undefined {
    return this.active;
  }

  async save(): Promise<void> {
    try {
      this.isNew() ? await this.create() : await this.update();
    } catch (error: any) {
      console.error('⌐ Erreur sauvegarde currency:', error.message);
      throw new Error(error);
    }
  }
  async delete(): Promise<boolean> {
    if (this.id !== undefined) {
      await W.isOccur(!this.id, `${G.identifierMissing.code}: Currency Delete`);
      return await this.trash(this.id);
    }
    return false;
  }
  async load(
    identifier: any,
    byGuid: boolean = false,
    byCode: boolean = false,
  ): Promise<Currency | null> {
    const data = byGuid
      ? await this.findByGuid(identifier)
      : byCode
        ? await this.findByCode(identifier)
        : await this.find(Number(identifier));
    if (!data) return null;
    return this.hydrate(data);
  }

  async list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Currency[] | null> {
    const dataset = await this.listAll(conditions, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Currency().hydrate(data));
  }

  async listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Currency[] | null> {
    const dataset = await this.listAllByActiveStatus(is_active, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Currency().hydrate(data));
  }

  isNew(): boolean {
    return this.id === undefined;
  }

  toJSON(): object {
    return {
      [RS.GUID]: this.guid,
      [RS.CODE]: this.code,
      [RS.NAME]: this.name,
      [RS.SYMBOL]: this.symbol,
      [RS.DECIMAL_PLACES]: this.decimal_places,
      [RS.IS_ACTIVE]: this.active,
    };
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `Currency { ${RS.ID}: ${this.id}, ${RS.GUID}: ${this.guid}, ${RS.CODE}: "${this.code}", ${RS.NAME}: "${this.name}, ${RS.SYMBOL}: "${this.symbol}, ${RS.DECIMAL_PLACES}: "${this.decimal_places}, ${RS.IS_ACTIVE}: "${this.active}" }`;
  }

  private hydrate(data: any): Currency {
    this.id = data.id;
    this.guid = data.guid;
    this.code = data.code;
    this.name = data.name;
    this.symbol = data.symbol;
    this.decimal_places = data.decimal_places;
    this.active = data.active;
    return this;
  }
}
