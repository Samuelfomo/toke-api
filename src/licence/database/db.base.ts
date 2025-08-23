import { QueryTypes, Sequelize } from 'sequelize';

import { TableInitializer } from './db.initializer';

/**
 * Classe de base simple pour les modèles
 * Responsabilité unique : Fournir les méthodes CRUD
 * N'initialise PLUS les modèles (c'est le rôle de TableInitializer)
 */
export default abstract class BaseModel {
    protected sequelize!: Sequelize;

    protected constructor() {}

    // Initialiser la connexion (les modèles sont déjà créés par TableInitializer)
    protected async init(): Promise<void> {
        const Db = (await import('./db.config')).default;
        this.sequelize = await Db.getInstance();
    }

    // === MÉTHODES CRUD SIMPLES ===
    // Utilisent TableInitializer.getModel() pour accéder aux modèles

    /**
     * Créer un enregistrement
     */
    protected async insertOne(tableName: string, data: any): Promise<any> {
        const model = TableInitializer.getModel(tableName);
        const result = await model.create(data);
        return result.get();
    }

    /**
     * Trouver un enregistrement
     */
    protected async findOne(tableName: string, where: any): Promise<any> {
        const model = TableInitializer.getModel(tableName);
        const result = await model.findOne({ where });
        return result ? result.get() : null;
    }

    /**
     * Trouver plusieurs enregistrements
     */
    // protected async findAll(tableName: string, where: any = {}): Promise<any[]> {
    //   const model = TableInitializer.getModel(tableName);
    //   const results = await model.findAll({ where });
    //   return results.map((r) => r.get());
    // }
    protected async findAll(
        tableName: string,
        where: Record<string, any> = {},
        paginationOptions: { offset?: number; limit?: number } = {}
    ): Promise<any[]> {
        const model = TableInitializer.getModel(tableName);

        // Construire les options de requête Sequelize
        const queryOptions: any = { where };

        // Ajouter la pagination seulement si définie et valide
        if (typeof paginationOptions.offset === 'number' && paginationOptions.offset >= 0) {
            queryOptions.offset = paginationOptions.offset;
        }

        if (typeof paginationOptions.limit === 'number' && paginationOptions.limit > 0) {
            queryOptions.limit = paginationOptions.limit;
        }

        const results = await model.findAll(queryOptions);
        return results.map((r) => r.get());
    }

    /**
     * Mettre à jour un enregistrement
     */
    protected async updateOne(tableName: string, data: any, where: any): Promise<number> {
        const model = TableInitializer.getModel(tableName);
        const [affectedCount] = await model.update(data, { where });
        return affectedCount;
    }

    /**
     * Supprimer un enregistrement
     */
    protected async deleteOne(tableName: string, where: any): Promise<boolean> {
        const model = TableInitializer.getModel(tableName);
        const deletedCount = await model.destroy({ where });
        return deletedCount > 0;
    }

    /**
     * Compter les enregistrements
     */
    protected async count(tableName: string, where: any = {}): Promise<number> {
        const model = TableInitializer.getModel(tableName);
        return await model.count({ where });
    }

    /**
     * Vérifier si un enregistrement existe
     */
    protected async exists(tableName: string, where: any): Promise<boolean> {
        const count = await this.count(tableName, where);
        return count > 0;
    }

    /**
     * Obtient le timestamp de la dernière modification
     */
    protected async findLastModification(tableName: string): Promise<Date | null> {
        try {
            const model = TableInitializer.getModel(tableName);

            const maxUpdatedAt = (await model.max('updated_at')) as Date;

            return maxUpdatedAt || null;
        } catch (error) {
            console.error('❌ Erreur récupération dernière modification:', error);
            return null;
        }
    }


    /**
     * Génère un GUID basé sur MAX (id) + offset
     */
    protected async guidGenerator(tableName: string, length: number = 6): Promise<number | null> {
        try {
            const model = TableInitializer.getModel(tableName);
            if (!model) {
                console.error(`❌ Modèle '${tableName}' non trouvé pour génération GUID`);
                return null;
            }

            if (length < 3) {
                console.error(`❌ Taille '${length}' non autorisé pour la génération GUID`);
                return null;
            }

            // Calculer l'offset : 10^length
            const offset = Math.pow(10, length - 1);

            // ✅ Utiliser le modèle comme les autres méthodes
            const maxId = ((await model.max('id')) as number) || 0;
            const nextId = maxId + 1;
            const guid = offset + nextId;

            console.log(
                `🔢 GUID généré pour '${tableName}': ${guid} (offset: ${offset}, next_id: ${nextId})`
            );

            return guid;
        } catch (error: any) {
            console.error(`❌ Erreur génération GUID pour '${tableName}':`, error.message);
            return null;
        }
    }

    /**
     * Génère un token basé sur timestamp + GUID
     */
    protected async timeBasedTokenGenerator(
        tableName: string,
        length: number = 3,
        divider: string = '-',
        prefix: string = 'A'
    ): Promise<string | null> {
        try {
            const model = TableInitializer.getModel(tableName);
            if (!model) {
                console.error(`❌ Modèle '${tableName}' non trouvé pour génération token temporel`);
                return null;
            }

            if (length < 3) {
                console.error(`❌ Taille '${length}' non autorisée pour la génération de token temporel`);
                return null;
            }

            // Générer le timestamp: YYYYMMDDHHMMSS
            const now = new Date();
            const timestamp = [
                now.getFullYear(),
                (now.getMonth() + 1).toString().padStart(2, '0'),
                now.getDate().toString().padStart(2, '0'),
                now.getHours().toString().padStart(2, '0'),
                now.getMinutes().toString().padStart(2, '0'),
                now.getSeconds().toString().padStart(2, '0'),
            ].join('');

            // Générer le GUID
            const guid = await this.guidGenerator(tableName, length);
            if (!guid) {
                console.error(`❌ Impossible de générer GUID pour token basé sur le temps`);
                return null;
            }

            // Construire le token final
            const token = `${prefix}${divider}${timestamp}${divider}${guid}`;

            console.log(`🕐 Token temporel généré pour '${tableName}': ${token}`);

            return token;
        } catch (error: any) {
            console.error(`❌ Erreur génération token temporel pour '${tableName}':`, error.message);
            return null;
        }
    }

    /**
     * Génère un token UUID via PostgreSQL gen_random_uuid()
     */
    protected async uuidTokenGenerator(tableName: string): Promise<string | null> {
        try {
            const model = TableInitializer.getModel(tableName);
            if (!model) {
                console.error(`❌ Modèle '${tableName}' non trouvé pour génération UUID`);
                return null;
            }

            // Obtenir l'instance Sequelize directement
            const Db = (await import('./db.config')).default;
            const sequelize = await Db.getInstance();

            // Utiliser gen_random_uuid() de PostgreSQL
            const query = 'SELECT gen_random_uuid()::text as uuid';
            const [results] = (await sequelize.query(query, {
                type: QueryTypes.SELECT,
            })) as any[];

            const uuid = results?.uuid;

            if (!uuid) {
                console.error(`❌ UUID non généré par PostgresSQL pour '${tableName}'`);
                return null;
            }

            console.log(`🆔 UUID PostgreSQL généré pour '${tableName}': ${uuid}`);

            return uuid;
        } catch (error: any) {
            console.error(`❌ Erreur génération UUID PostgresSQL pour '${tableName}':`, error.message);

            // Fallback: Si gen_random_uuid() n'est pas disponible
            try {
                console.log(`🔄 Tentative avec uuid_generate_v4() pour '${tableName}'...`);

                const Db = (await import('./db.config')).default;
                const sequelize = await Db.getInstance();

                const fallbackQuery = 'SELECT uuid_generate_v4()::text as uuid';
                const [fallbackResults] = (await sequelize.query(fallbackQuery, {
                    type: QueryTypes.SELECT,
                })) as any[];

                const fallbackUuid = fallbackResults?.uuid;
                if (fallbackUuid) {
                    console.log(`🆔 UUID fallback généré pour '${tableName}': ${fallbackUuid}`);
                    return fallbackUuid;
                }
            } catch (fallbackError: any) {
                console.error(
                    `❌ Extension UUID non disponible pour '${tableName}'. Installez: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
                    fallbackError.message
                );
            }

            return null;
        }
    }
}
