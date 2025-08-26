import BaseModel from '../database/db.base';
import G from '../../tools/glossary';
import { ExchangeRateDbStructure } from '../database/data/exchange.rate.db';

export default class ExchangeRateModel extends BaseModel {
  public readonly db = {
    tableName: `${G.tableConf}_exchange_rate`,
    id: 'id',
    guid: 'guid',
    from_currency_code: 'from_currency_code',
    to_currency_code: 'to_currency_code',
    exchange_rate: 'exchange_rate',
    current: 'current',
    created_by: 'created_by',
  } as const;

  protected id?: number;
  protected guid?: number;
  protected from_currency_code?: string;
  protected to_currency_code?: string;
  protected exchange_rate?: number;
  protected current?: boolean;
  protected created_by?: number;

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

  protected async listAllByCurrentStatus(
    current: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<any[]> {
    return await this.listAll({ [this.db.current]: current }, paginationOptions);
  }

  protected async create(): Promise<void> {
    await this.validate();
    const guid = await this.guidGenerator(this.db.tableName, 6);
    if (!guid) {
      throw new Error('Failed to generate GUID for exchange rate entry');
    }

    const lastID = await this.insertOne(this.db.tableName, {
      [this.db.guid]: guid,
      [this.db.from_currency_code]: this.from_currency_code,
      [this.db.to_currency_code]: this.to_currency_code,
      [this.db.exchange_rate]: this.exchange_rate,
      [this.db.current]: this.current,
      [this.db.created_by]: this.created_by,
    });
    if (!lastID) {
      throw new Error('Failed to create exchange rate entry');
    }
    this.id = typeof lastID === 'object' ? lastID.id : lastID;
    this.guid = guid;

    console.log('✅ Exchange rate créé avec ID:', this.id);
  }
  protected async update(): Promise<void> {
    await this.validate();
    if (!this.id) {
      throw new Error('Exchange rate ID is required for update');
    }
    const updateData: Record<string, any> = {};
    if (this.from_currency_code !== undefined)
      updateData[this.db.from_currency_code] = this.from_currency_code;
    if (this.to_currency_code !== undefined)
      updateData[this.db.to_currency_code] = this.to_currency_code;
    if (this.exchange_rate !== undefined) updateData[this.db.exchange_rate] = this.exchange_rate;
    if (this.current !== undefined) updateData[this.db.current] = this.current;
    if (this.created_by !== undefined) updateData[this.db.created_by] = this.created_by;
    const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });
    if (!affected) {
      throw new Error('Failed to update exchange rate entry');
    }
  }
  protected async trash(id: number): Promise<boolean> {
    return await this.deleteOne(this.db.tableName, { [this.db.id]: id });
  }
  protected async getLastModification(): Promise<Date | null> {
    try {
      return await this.findLastModification(this.db.tableName);
    } catch (error: any) {
      console.log(`Failed to get last modification time: ${error.message}`);
      return null;
    }
  }
  private async validate(): Promise<void> {
    if (
      !this.from_currency_code ||
      !ExchangeRateDbStructure.validation.validateFromCurrencyCode(this.from_currency_code)
    ) {
      throw new Error('from_currency_code must be exactly 3 uppercase letters (ISO 4217)');
    }
    if (
      !this.to_currency_code ||
      !ExchangeRateDbStructure.validation.validateToCurrencyCode(this.to_currency_code)
    ) {
      throw new Error('to_currency_code must be exactly 3 uppercase letters (ISO 4217)');
    }
    if (
      !this.exchange_rate ||
      !ExchangeRateDbStructure.validation.validateExchangeRate(this.exchange_rate)
    ) {
      throw new Error('exchange_rate must be a number');
    }
    if (this.current !== undefined && !ExchangeRateDbStructure.validation.isCurrent(this.current)) {
      throw new Error('current must be a boolean value');
    }
    if (
      !this.created_by ||
      !ExchangeRateDbStructure.validation.validateCreatedBy(this.created_by)
    ) {
      throw new Error('created_by must be a number');
    }

    ExchangeRateDbStructure.validation.cleanData(this);
  }
}
