import { Sequelize, ModelStatic, Model } from 'sequelize';
import { CountryDbStructure } from './data/country.db';
import { LicenceDbStructure } from './data/licence.db';
import { TenantDbStructure } from "./data/tenant.db";
import { SubscriptionDbStructure } from "./data/subscription.db";
import { AmendmentDbStructure } from "./data/avenant.db";
import {SiteAllocationDbStructure} from "./data/site.allocation.db";

/**
 * Gestionnaire STATIQUE d'initialisation des tables
 * Responsabilité unique : Initialiser et donner accès aux modèles
 */
export class TableInitializer {
    private static sequelize: Sequelize;
    private static models: Map<string, ModelStatic<Model>> = new Map();
    private static initialized = false;

    /**
     * Initialise toutes les tables (appelé au démarrage de l'app)
     */
    static async initialize(sequelize: Sequelize): Promise<void> {
        if (this.initialized) {
            console.log('⚠️ Tables déjà initialisées');
            return;
        }

        try {
            console.log('🗄️ Début initialisation des tables...');
            this.sequelize = sequelize;

            // 1. Définir tous les modèles
            this.defineAllModels();

            // 2. Synchroniser avec la base de données
            await this.syncAllModels();

            this.initialized = true;
            console.log('✅ Toutes les tables initialisées avec succès');
            console.log(`📊 ${this.models.size} table(s) créée(s)`);
        } catch (error) {
            console.error("❌ Erreur lors de l'initialisation des tables:", error);
            throw error;
        }
    }

    /**
     * Définit tous les modèles à partir des structures
     */
    private static defineAllModels(): void {
        console.log('🏗️ Définition des modèles...');

        this.defineCountryModel();
        this.defineTenantModel();
        this.defineLicenceModel();
        this.defineSubscriptionModel();
        this.defineAmendmentModel();
        this.defineSiteAllocationModel();

        console.log(`✅ ${this.models.size} modèle(s) défini(s)`);
    }


    /**
     * Définition du modèle Country
     */
    private static defineCountryModel(): void {
        const model = this.sequelize.define(
            CountryDbStructure.tableName,
            CountryDbStructure.attributes,
            CountryDbStructure.options
        );

        this.models.set(CountryDbStructure.tableName, model);
        console.log(`✅ Modèle Country défini (${CountryDbStructure.tableName})`);
    }

    /**
     * Définition du  modèle Tenant
     */
    private static defineTenantModel(): void {
        const model = this.sequelize.define(
            TenantDbStructure.tableName,
            TenantDbStructure.attributes,
            TenantDbStructure.options
        );

        this.models.set(TenantDbStructure.tableName, model);
        console.log(`✅ Modèle Tenant défini (${TenantDbStructure.tableName})`);
    }

    /**
     * Définition du  modèle Licence
     */
    private static defineLicenceModel(): void {
        const model = this.sequelize.define(
            LicenceDbStructure.tableName,
            LicenceDbStructure.attributes,
            LicenceDbStructure.options
        );

        this.models.set(LicenceDbStructure.tableName, model);
        console.log(`✅ Modèle Licence défini (${LicenceDbStructure.tableName})`);
    }

    /**
     * Définition du  modèle Subscription
     */
    private static defineSubscriptionModel(): void {
        const model = this.sequelize.define(
            SubscriptionDbStructure.tableName,
            SubscriptionDbStructure.attributes,
            SubscriptionDbStructure.options
        );

        this.models.set(SubscriptionDbStructure.tableName, model);
        console.log(`✅ Modèle Subscription défini (${SubscriptionDbStructure.tableName})`);
    }

    /**
     * Définition du  modèle Amendment
     */
    private static defineAmendmentModel(): void {
        const model = this.sequelize.define(
            AmendmentDbStructure.tableName,
            AmendmentDbStructure.attributes,
            AmendmentDbStructure.options
        );

        this.models.set(AmendmentDbStructure.tableName, model);
        console.log(`✅ Modèle Amendment défini (${AmendmentDbStructure.tableName})`);
    }

    /**
     * Définition du  modèle SiteAllocation
     */
    private static defineSiteAllocationModel(): void {
        const model = this.sequelize.define(
            SiteAllocationDbStructure.tableName,
            SiteAllocationDbStructure.attributes,
            SiteAllocationDbStructure.options
        );

        this.models.set(SiteAllocationDbStructure.tableName, model);
        console.log(`✅ Modèle SiteAllocation défini (${SiteAllocationDbStructure.tableName})`);
    }

    /**
     * Synchronise tous les modèles avec la base de données
     */
    private static async syncAllModels(): Promise<void> {
        console.log('🔄 Synchronisation avec la base de données...');

        const isDevelopment = process.env.NODE_ENV !== 'production';
        const syncOptions = isDevelopment ? { alter: true } : {};

        console.error(`🆘 Current Mode: ${process.env.NODE_ENV}`);
        try {
            for (const [tableName, model] of this.models) {
                await model.sync(syncOptions);
                console.log(`✅ Table synchronisée: ${tableName}`);
            }

            console.log('✅ Synchronisation terminée');
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            throw error;
        }
    }

    // === MÉTHODES D'ACCÈS PUBLIQUES ===

    /**
     * Retourne un modèle spécifique
     */
    static getModel(tableName: string): ModelStatic<Model> {
        if (!this.initialized) {
            throw new Error("TableInitializer non initialisé. Appelez initialize() d'abord.");
        }

        const model = this.models.get(tableName);
        if (!model) {
            const available = Array.from(this.models.keys()).join(', ');
            throw new Error(`Modèle '${tableName}' non trouvé. Disponibles: ${available}`);
        }
        return model;
    }

    /**
     * Retourne tous les modèles
     */
    static getAllModels(): Map<string, ModelStatic<Model>> {
        return new Map(this.models);
    }

    /**
     * Vérifie si les tables sont initialisées
     */
    static isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Statistiques
     */
    static getStats(): {
        initialized: boolean;
        tableCount: number;
        tableNames: string[];
    } {
        return {
            initialized: this.initialized,
            tableCount: this.models.size,
            tableNames: Array.from(this.models.keys()),
        };
    }

    /**
     * Nettoyage des ressources
     */
    static cleanup(): void {
        this.models.clear();
        this.initialized = false;
        console.log('🧹 TableInitializer nettoyé');
    }
}
