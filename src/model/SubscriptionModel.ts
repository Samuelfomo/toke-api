import BaseModel from '../database/db.base';
import G from '../tools/glossary';
import { SubscriptionDbStructure, Status, Type } from '../database/data/subscription.db';

export default class CountryModel extends BaseModel {
  public readonly db = {
    tableName: `${G.tableAp}_subscription`,
    id: 'id',
    guid: 'guid',
    licence: 'licence',
    subscription_type: 'subscription_type',
    start_date: 'start_date',
    price: 'price',
    end_date: 'end_date',
    status: 'status',
  } as const;

  protected id?: number;
  protected guid?: number;
  protected licence?: number;
  protected subscription_type?: Type;
  protected start_date?: Date;
  protected price?: number;
  protected end_date?: Date;
  protected status?: Status;

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
    paginationOptions: { offset?: number; limit?: number } = {}
  ): Promise<any[]> {
    return await this.findAll(this.db.tableName, conditions, paginationOptions);
  }

  /**
   * Récupère tous les abonnements d'une licence specifique
   */
  protected async listAllByLicence(
    licence: number,
    paginationOptions: { offset?: number; limit?: number } = {}
  ): Promise<any[]> {
    return await this.listAll({ [this.db.licence]: licence }, paginationOptions
    );
  }

  protected async listAllBySubscriptionType(
    subscription_type: Type,
    paginationOptions: { offset?: number; limit?: number } = {}
  ): Promise<any[]> {
    return await this.listAll({ [this.db.subscription_type]: subscription_type }, paginationOptions
    );
  }

  protected async listAllByStatus(
    status: Status,
    paginationOptions: { offset?: number; limit?: number } = {}
  ): Promise<any[]> {
    return await this.listAll({ [this.db.status]: status }, paginationOptions
    );
  }

  /**
   * Crée un nouvel abonnement
   */
  protected async create(): Promise<void> {
    await this.validate();

    // Générer le GUID automatiquement
    const guid = await this.guidGenerator(this.db.tableName, 6);
    if (!guid) {
      throw new Error('Failed to generate GUID for subscription entry');
    }

    const lastID = await this.insertOne(this.db.tableName, {
      [this.db.guid]: guid,
      [this.db.licence]: this.licence,
      [this.db.subscription_type]: this.subscription_type,
      [this.db.price]: this.price,
      [this.db.start_date]: this.start_date,
      [this.db.end_date]: this.end_date,
      [this.db.status]: this.status,
    });

    console.log(`🌍 Abonnement créé - Licence: ${this.licence} | de Type: ${this.subscription_type} | GUID: ${guid}`);

    if (!lastID) {
      throw new Error('Failed to create subscription entry');
    }

    this.id = lastID.id;
    this.guid = guid;

    console.log('✅ Abonnement créé avec ID:', this.id);
  }

  /**
   * Met à jour un abonnement existant
   */
  protected async update(): Promise<void> {
    await this.validate();

    if (!this.id) {
      throw new Error('Subscription ID is required for update');
    }

    const updateData: Record<string, any> = {};
    if (this.licence !== undefined) updateData[this.db.licence] = this.licence;
    if (this.subscription_type !== undefined) updateData[this.db.subscription_type] = this.subscription_type;
    if (this.price !== undefined) updateData[this.db.price] = this.price;
    if (this.end_date !== undefined) updateData[this.db.start_date] = this.end_date;
    if (this.status !== undefined) updateData[this.db.status] = this.status;

    const affected = await this.updateOne(this.db.tableName, updateData, { [this.db.id]: this.id });
    if (!affected) {
      throw new Error('Failed to update subscription entry');
    }
  }

  /**
   * Supprime un abonnement
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
  }
}