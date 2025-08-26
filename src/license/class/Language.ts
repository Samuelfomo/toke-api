import LanguageModel from '../model/LanguageModel';
import W from '../../tools/watcher';
import G from '../../tools/glossary';
import { responseStructure as RS, tableStructure as TS } from '../../utils/response.model';
import Revision from '../../tools/revision';

export default class Language extends LanguageModel {
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

    const languages = await this._list({ ['active']: true }, paginationOptions);
    if (languages) {
      items = languages.map((lang) => lang.toJSON());
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
  ): Promise<Language | null> {
    return new Language().load(identifier, byGuid, byCode);
  }

  static _list(
    conditions: Record<string, any> = {},
    paginationOptions: { offset?: number; limit?: number } = {},
  ) {
    return new Language().list(conditions, paginationOptions);
  }

  static _listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Language[] | null> {
    return new Language().listByActiveStatus(is_active, paginationOptions);
  }

  setCode(code: string): Language {
    this.code = code.toUpperCase();
    return this;
  }
  setNameEn(name_en: string): Language {
    this.name_en = name_en;
    return this;
  }
  setLocalName(name_local: string): Language {
    this.name_local = name_local;
    return this;
  }
  setActive(value: boolean): Language {
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
  getNameEn(): string | undefined {
    return this.name_en;
  }
  getLocalName(): string | undefined {
    return this.name_local;
  }
  isActive(): boolean | undefined {
    return this.active;
  }

  async save(): Promise<void> {
    try {
      this.isNew() ? await this.create() : await this.update();
    } catch (error: any) {
      console.error('⌐ Erreur sauvegarde language:', error.message);
      throw new Error(error);
    }
  }
  async delete(): Promise<boolean> {
    if (this.id !== undefined) {
      await W.isOccur(!this.id, `${G.identifierMissing.code}: Language Delete`);
      return await this.trash(this.id);
    }
    return false;
  }
  async load(
    identifier: any,
    byGuid: boolean = false,
    byCode: boolean = false,
  ): Promise<Language | null> {
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
  ): Promise<Language[] | null> {
    const dataset = await this.listAll(conditions, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Language().hydrate(data));
  }

  async listByActiveStatus(
    is_active: boolean,
    paginationOptions: { offset?: number; limit?: number } = {},
  ): Promise<Language[] | null> {
    const dataset = await this.listAllByActiveStatus(is_active, paginationOptions);
    if (!dataset) return null;
    return dataset.map((data) => new Language().hydrate(data));
  }

  isNew(): boolean {
    return this.id === undefined;
  }

  toJSON(): object {
    return {
      [RS.GUID]: this.guid,
      [RS.CODE]: this.code,
      [RS.NAME_EN]: this.name_en,
      [RS.NAME_LOCAL]: this.name_local,
      [RS.IS_ACTIVE]: this.active,
    };
  }

  /**
   * Représentation string
   */
  toString(): string {
    return `Language { ${RS.ID}: ${this.id}, ${RS.GUID}: ${this.guid}, ${RS.CODE}: "${this.code}", ${RS.NAME_EN}: "${this.name_en}, ${RS.NAME_LOCAL}: "${this.name_local}, ${RS.IS_ACTIVE}: "${this.active}" }`;
  }

  private hydrate(data: any): Language {
    this.id = data.id;
    this.guid = data.guid;
    this.code = data.code;
    this.name_en = data.name_en;
    this.name_local = data.name_local;
    this.active = data.active;
    return this;
  }
}
