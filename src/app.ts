import { Server } from 'http';

import express from 'express';
import cors from 'cors';

// import dotenv from 'dotenv';
//
// dotenv.config();
// Importation des modules simplifiés
import Db from './license/database/db.config';
import { TableInitializer } from './license/database/db.initializer';
import { EntityRoute } from './utils/response.model';
import CountryRoute from './license/routes/country.route';
import CurrencyRoute from './license/routes/currency.route';
import ExchangeRateRoute from './license/routes/exchange.rate.route';
import LanguageRoute from './license/routes/language.route';
import TaxRuleRoute from './license/routes/tax.rule.route';

interface AppConfig {
  port: number;
  host: string;
  cors: boolean;
}

export default class App {
  private server: Server | null = null;
  private readonly app: express.Application;
  private config: AppConfig;
  private isShuttingDown = false;

  constructor(config: Partial<AppConfig> = {}) {
    this.config = {
      port: config.port || parseInt(process.env.PORT || '4891'),
      host: config.host || process.env.SERVER_HOST || '0.0.0.0',
      cors: config.cors ?? true,
    };

    this.app = express();
    this.setupMiddleware();
  }

  /**
   * Démarrage du serveur
   */
  async start(): Promise<void> {
    try {
      if (this.isShuttingDown) {
        throw new Error('Impossible de démarrer: arrêt en cours');
      }

      // Initialiser l'application
      await this.initializeApp();

      // Démarrer le serveur HTTP
      console.log(`🚀 Démarrage serveur sur ${this.config.host}:${this.config.port}...`);

      await new Promise<void>((resolve, reject) => {
        this.server = this.app.listen(
          this.config.port,
          // this.config.host,
          () => {
            console.log(`✅ Serveur actif sur http://${this.config.host}`);
            console.log(`📊 Health check: http://${this.config.host}/health`);
            console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
            console.log('🎉 Serveur prêt!');
            resolve();
          },
        );

        this.server?.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            reject(new Error(`Port ${this.config.port} déjà utilisé`));
          } else {
            reject(error);
          }
        });
      });

      // Configurer l'arrêt gracieux
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('❌ Erreur démarrage serveur:', error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Arrêt forcé (pour tests)
   */
  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
    }
    await this.cleanup();
  }

  /**
   * Getter pour Express (utile pour tests)
   */
  getExpressApp(): express.Application {
    return this.app;
  }

  /**
   * Vérifier si le serveur fonctionne
   */
  isRunning(): boolean {
    return this.server !== null && !this.isShuttingDown;
  }

  /**
   * Configuration des middlewares de base
   */
  private setupMiddleware(): void {
    // CORS
    if (this.config.cors) {
      this.app.use(cors());
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging simple en développement
    if (process.env.NODE_ENV !== 'production') {
      this.app.use((req, res, next) => {
        console.log(`🌐 ${req.method} ${req.path}`);
        next();
      });
    }

    // Headers de sécurité basique
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      next();
    });

    // 🔐 MIDDLEWARE D'AUTHENTIFICATION GLOBAL
    // ⚠️ INTERCEPTE TOUTES LES REQUÊTES (même /health)
    // this.app.use(ServerAuth.authenticate);
  }

  /**
   * Wrapper pour les handlers async
   */
  private asyncHandler =
    (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

  /**
   * Configuration des routes
   */
  private setupRoutes(): void {
    console.log('📍 Configuration des routes...');

    // Route de santé
    this.app.get(
      '/health',
      this.asyncHandler(async (req: any, res: any) => {
        const dbStatus = TableInitializer.isInitialized() ? 'connected' : 'disconnected';

        res.json({
          status: true,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          database: dbStatus,
          tables: TableInitializer.getAllModels().size || 0,
          revision: {},
        });
      }),
    );

    // Route racine
    this.app.get('/', (req, res) => {
      res.json({
        message: 'API Server is running',
        timestamp: new Date().toISOString(),
        endpoints: ['GET /health - Health check', 'GET / - Cette page'],
      });
    });

    // TODO: Ajouter les routes métier ici

    this.app.use(`/${EntityRoute.MASTER}/country`, CountryRoute);
    this.app.use(`/${EntityRoute.MASTER}/currency`, CurrencyRoute);
    this.app.use(`/${EntityRoute.MASTER}/exchange-rate`, ExchangeRateRoute);
    this.app.use(`/${EntityRoute.MASTER}/language`, LanguageRoute);
    this.app.use(`/${EntityRoute.MASTER}/tax-rule`, TaxRuleRoute);

    // Route 404
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'route_not_found',
          message: `Route ${req.method} ${req.originalUrl} introuvable`,
        },
      });
    });

    // Gestionnaire d'erreur global
    this.app.use(
      (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('❌ Erreur:', {
          message: error.message,
          url: req.originalUrl,
          method: req.method,
        });

        const isDev = process.env.NODE_ENV !== 'production';

        res.status(error.status || 500).json({
          success: false,
          error: {
            code: error.code || 'internal_server_error',
            message: isDev ? error.message : 'Erreur interne du serveur',
            ...(isDev && { stack: error.stack }),
          },
        });

        next();
      },
    );

    console.log('✅ Routes configurées');
  }

  /**
   * Initialisation de la base de données
   */
  private async initializeDatabase(): Promise<void> {
    try {
      console.log('🗄️ Initialisation de la base de données...');

      // // 1. Obtenir la connexion Sequelize
      const sequelize = await Db.getInstance();
      //
      // // 2. Initialiser toutes les tables (statique)
      await TableInitializer.initialize(sequelize);

      console.log('✅ Base de données initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation DB:', error);
      throw error;
    }
  }

  /**
   * Initialisation complète de l'application
   */
  private async initializeApp(): Promise<void> {
    try {
      console.log("🚀 Initialisation de l'application...");

      // 1. Initialiser la base de données
      await this.initializeDatabase();

      // 2. Configurer les routes
      this.setupRoutes();

      console.log('✅ Application initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation app:', error);
      throw error;
    }
  }

  /**
   * Configuration de l'arrêt gracieux
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        console.log('🔄 Arrêt déjà en cours...');
        return;
      }

      this.isShuttingDown = true;
      console.log(`\n📡 Signal ${signal} reçu. Arrêt gracieux...`);

      try {
        // 1. Fermer le serveur HTTP
        if (this.server) {
          console.log('🔌 Fermeture serveur HTTP...');
          await new Promise<void>((resolve) => {
            this.server!.close(() => {
              console.log('✅ Serveur HTTP fermé');
              resolve();
            });
          });
        }

        // 2. Nettoyage
        await this.cleanup();

        console.log('✅ Arrêt gracieux terminé');
        process.exit(0);
      } catch (error) {
        console.error("❌ Erreur lors de l'arrêt:", error);
        process.exit(1);
      }
    };

    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Exceptions non gérées
    process.on('uncaughtException', (error) => {
      console.error('❌ Exception non gérée:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Promise rejetée:', reason);
      shutdown('UNHANDLED_REJECTION');
    });
  }

  /**
   * Nettoyage des ressources
   */
  private async cleanup(): Promise<void> {
    try {
      console.log('🧹 Nettoyage des ressources...');

      // Nettoyer l'initialisateur de tables (statique)
      TableInitializer.cleanup();

      // Fermer la connexion DB
      await Db.close();

      console.log('✅ Nettoyage terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }
}
