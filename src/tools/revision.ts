import BaseModel from '../license/database/db.base';

export default class Revision extends BaseModel {
  static async getRevision(tableName: string): Promise<string> {
    const instance = new Revision();
    const lastModified = await instance.findLastModification(tableName);
    if (!lastModified) return '202501010000';

    const year = lastModified.getUTCFullYear();
    const month = String(lastModified.getUTCMonth() + 1).padStart(2, '0');
    const day = String(lastModified.getUTCDate()).padStart(2, '0');
    const hours = String(lastModified.getUTCHours()).padStart(2, '0');
    const minutes = String(lastModified.getUTCMinutes()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}`;
  }
}
