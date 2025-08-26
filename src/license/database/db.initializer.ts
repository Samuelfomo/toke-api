import { Model, ModelStatic, Sequelize } from 'sequelize';

import { CountryDbStructure } from './data/country.db';
import { ExchangeRateDbStructure } from './data/exchange.rate.db';
import { CurrencyDbStructure } from './data/currency.db';
import { LanguageDbStructure } from './data/language.db';
import { TaxRuleDbStructure } from './data/tax.rule.db';
import { TenantDbStructure } from './data/tenant.db';
import { GlobalLicenseDbStructure } from './data/global.license.db';
import { EmployeeLicenseDbStructure } from './data/employee.license.db';
import { BillingCycleDbStructure } from './data/billing.cycle.db';
import { PaymentMethodDbStructure } from './data/payment.method.db';
import { PaymentTransactionDbStructure } from './data/payment.transaction.db';
import { LicenseAdjustmentDbStructure } from './data/license.adjustment.db';
import { FraudDetectionLogDbStructure } from './data/fraud.detection.log.db';
import { ActivityMonitoringDbStructure } from './data/activity.monitoring.db';
// import { LicenceDbStructure } from './data/license.db';
// import { TenantDbStructure } from "./data/tenant.db";
// import { SubscriptionDbStructure } from "./data/subscription.db";
// import { AmendmentDbStructure } from "./data/amendment.db";
// import { SiteAllocationDbStructure } from "./data/site.allocation.db";
// import { ProfileDbStructure } from "./data/profile.db";

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

  // === MÉTHODES D'ACCÈS PUBLIQUES ===

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

  /**
   * Définit tous les modèles à partir des structures
   */
  private static defineAllModels(): void {
    console.log('🏗️ Définition des modèles...');
    this.defineCountryModel();
    this.defineCurrencyModel();
    this.defineExchangeRateModel();
    this.defineLanguageModel();
    this.defineTaxRuleModel();
    this.defineTenantModel();
    this.defineGlobalLicenseModel();
    this.defineEmployeeLicenseModel();
    this.defineBillingCycleModel();
    this.definePaymentMethodModel();
    this.defineLicenseAdjustmentModel();
    this.definePaymentTransactionModel();
    this.defineFraudDetectionLogModel();
    this.defineActivityMonitoringModel();

    console.log(`✅ ${this.models.size} modèle(s) défini(s) 2025-01-01`);
  }

  /**
   * Définition du modèle Country
   */
  private static defineCountryModel(): void {
    const model = this.sequelize.define(
      CountryDbStructure.tableName,
      CountryDbStructure.attributes,
      CountryDbStructure.options,
    );

    this.models.set(CountryDbStructure.tableName, model);
    console.log(`✅ Modèle Country défini (${CountryDbStructure.tableName})`);
  }
  private static defineCurrencyModel(): void {
    const model = this.sequelize.define(
      CurrencyDbStructure.tableName,
      CurrencyDbStructure.attributes,
      CurrencyDbStructure.options,
    );

    this.models.set(CurrencyDbStructure.tableName, model);
    console.log(`✅ Modèle Currency défini (${CurrencyDbStructure.tableName})`);
  }
  private static defineExchangeRateModel(): void {
    const model = this.sequelize.define(
      ExchangeRateDbStructure.tableName,
      ExchangeRateDbStructure.attributes,
      ExchangeRateDbStructure.options,
    );

    this.models.set(ExchangeRateDbStructure.tableName, model);
    console.log(`✅ Modèle ExchangeRate défini (${ExchangeRateDbStructure.tableName})`);
  }
  private static defineLanguageModel(): void {
    const model = this.sequelize.define(
      LanguageDbStructure.tableName,
      LanguageDbStructure.attributes,
      LanguageDbStructure.options,
    );

    this.models.set(LanguageDbStructure.tableName, model);
    console.log(`✅ Modèle Language défini (${LanguageDbStructure.tableName})`);
  }
  private static defineTaxRuleModel(): void {
    const model = this.sequelize.define(
      TaxRuleDbStructure.tableName,
      TaxRuleDbStructure.attributes,
      TaxRuleDbStructure.options,
    );

    this.models.set(TaxRuleDbStructure.tableName, model);
    console.log(`✅ Modèle TaxRule défini (${TaxRuleDbStructure.tableName})`);
  }
  private static defineTenantModel(): void {
    const model = this.sequelize.define(
      TenantDbStructure.tableName,
      TenantDbStructure.attributes,
      TenantDbStructure.options,
    );

    this.models.set(TenantDbStructure.tableName, model);
    console.log(`✅ Modèle Tenant défini (${TenantDbStructure.tableName})`);
  }
  private static defineGlobalLicenseModel(): void {
    const model = this.sequelize.define(
      GlobalLicenseDbStructure.tableName,
      GlobalLicenseDbStructure.attributes,
      GlobalLicenseDbStructure.options,
    );

    this.models.set(GlobalLicenseDbStructure.tableName, model);
    console.log(`✅ Modèle Global License défini (${GlobalLicenseDbStructure.tableName})`);
  }
  private static defineEmployeeLicenseModel(): void {
    const model = this.sequelize.define(
      EmployeeLicenseDbStructure.tableName,
      EmployeeLicenseDbStructure.attributes,
      EmployeeLicenseDbStructure.options,
    );

    this.models.set(EmployeeLicenseDbStructure.tableName, model);
    console.log(`✅ Modèle Employee License défini (${EmployeeLicenseDbStructure.tableName})`);
  }
  private static defineBillingCycleModel(): void {
    const model = this.sequelize.define(
      BillingCycleDbStructure.tableName,
      BillingCycleDbStructure.attributes,
      BillingCycleDbStructure.options,
    );

    this.models.set(BillingCycleDbStructure.tableName, model);
    console.log(`✅ Modèle billing cycle défini (${BillingCycleDbStructure.tableName})`);
  }
  private static definePaymentMethodModel(): void {
    const model = this.sequelize.define(
      PaymentMethodDbStructure.tableName,
      PaymentMethodDbStructure.attributes,
      PaymentMethodDbStructure.options,
    );

    this.models.set(PaymentMethodDbStructure.tableName, model);
    console.log(`✅ Modèle payment method défini (${PaymentMethodDbStructure.tableName})`);
  }
  private static defineLicenseAdjustmentModel(): void {
    const model = this.sequelize.define(
      LicenseAdjustmentDbStructure.tableName,
      LicenseAdjustmentDbStructure.attributes,
      LicenseAdjustmentDbStructure.options,
    );

    this.models.set(LicenseAdjustmentDbStructure.tableName, model);
    console.log(`✅ Modèl license adjustment défini (${LicenseAdjustmentDbStructure.tableName})`);
  }
  private static definePaymentTransactionModel(): void {
    const model = this.sequelize.define(
      PaymentTransactionDbStructure.tableName,
      PaymentTransactionDbStructure.attributes,
      PaymentTransactionDbStructure.options,
    );

    this.models.set(PaymentTransactionDbStructure.tableName, model);
    console.log(`✅ Modèl payment transaction défini (${PaymentTransactionDbStructure.tableName})`);
  }
  private static defineFraudDetectionLogModel(): void {
    const model = this.sequelize.define(
      FraudDetectionLogDbStructure.tableName,
      FraudDetectionLogDbStructure.attributes,
      FraudDetectionLogDbStructure.options,
    );

    this.models.set(FraudDetectionLogDbStructure.tableName, model);
    console.log(`✅ Modèl fraud detection log défini (${FraudDetectionLogDbStructure.tableName})`);
  }
  private static defineActivityMonitoringModel(): void {
    const model = this.sequelize.define(
      ActivityMonitoringDbStructure.tableName,
      ActivityMonitoringDbStructure.attributes,
      ActivityMonitoringDbStructure.options,
    );

    this.models.set(ActivityMonitoringDbStructure.tableName, model);
    console.log(`✅ Modèl activity monitoring défini (${ActivityMonitoringDbStructure.tableName})`);
  }

  /**
   * Synchronise tous les modèles avec la base de données
   */
  private static async syncAllModels(): Promise<void> {
    console.log('🔄 Synchronisation avec la base de données...');

    const isDevelopment = process.env.NODE_ENV !== 'production';
    const syncOptions = isDevelopment ? { alter: true } : { force: true, alter: true };

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
}
