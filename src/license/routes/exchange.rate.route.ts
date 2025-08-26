import { Request, Response, Router } from 'express';

import ExchangeRate from '../class/ExchangeRate';
import R from '../../tools/response';
import HttpStatus from '../../tools/http-status';
import G from '../../tools/glossary';
import Ensure from '../middle/ensured-routes';
import ExtractQueryParams from '../../utils/extract.query.params';
import Revision from '../../tools/revision';
import { tableStructure as TS } from '../../utils/response.model';

const router = Router();

// region ROUTES D'EXPORT

/**
 * GET / - Exporter tous les taux de change
 */
router.get('/', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const exchangeRates = await ExchangeRate.exportable(paginationOptions);
    R.handleSuccess(res, { exchange_rates: exchangeRates });
  } catch (error: any) {
    console.error('⌐ Erreur export taux de change:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'export_failed',
      message: 'Failed to export exchange rates',
    });
  }
});

/**
 * GET /revision - Récupérer uniquement la révision actuelle
 */
router.get('/revision', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const revision = await Revision.getRevision(TS.EXCHANGE_RATE);

    R.handleSuccess(res, {
      revision,
      checked_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('⌐ Erreur récupération révision:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'revision_check_failed',
      message: 'Failed to get current revision',
    });
  }
});

/**
 * GET /last-modification - Récupérer la dernière modification
 */
router.get('/last-modification', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const lastModification = await ExchangeRate._getLastModificationTime();

    R.handleSuccess(res, {
      last_modification: lastModification,
      checked_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('⌐ Erreur récupération dernière modification:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'last_modification_failed',
      message: 'Failed to get last modification time',
    });
  }
});

/**
 * GET /current/:status - Lister les taux par statut courant/historique
 */
router.get('/current/:status', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const isCurrent = status.toLowerCase() === 'true' || status === '1';

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const exchangeRatesData = await ExchangeRate._listByCurrentStatus(isCurrent, paginationOptions);
    const exchange_rates = {
      current: isCurrent,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || exchangeRatesData?.length,
        count: exchangeRatesData?.length || 0,
      },
      items: exchangeRatesData?.map((rate) => rate.toJSON()) || [],
    };

    R.handleSuccess(res, { exchange_rates });
  } catch (error: any) {
    console.error('⌐ Erreur recherche par statut courant:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'current_status_search_failed',
      message: `Failed to search exchange rates by current status: ${req.params.status}`,
    });
  }
});

/**
 * GET /pair/:from_currency/:to_currency - Récupérer le taux pour une paire de devises
 */
router.get(
  '/pair/:from_currency/:to_currency',
  Ensure.get(),
  async (req: Request, res: Response) => {
    try {
      const { from_currency, to_currency } = req.params;
      const fromCode = from_currency.toUpperCase();
      const toCode = to_currency.toUpperCase();

      // Validation des codes de devise
      if (!/^[A-Z]{3}$/.test(fromCode) || !/^[A-Z]{3}$/.test(toCode)) {
        return R.handleError(res, HttpStatus.BAD_REQUEST, {
          code: 'invalid_currency_code',
          message: 'Currency codes must be exactly 3 letters (ISO 4217)',
        });
      }

      if (fromCode === toCode) {
        return R.handleError(res, HttpStatus.BAD_REQUEST, {
          code: 'same_currency_pair',
          message: 'From and to currency cannot be the same',
        });
      }

      const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);
      const { current_only } = req.query;
      const isCurrentOnly = current_only === 'true' || current_only === '1';

      const conditions: Record<string, any> = {
        from_currency_code: fromCode,
        to_currency_code: toCode,
      };

      if (isCurrentOnly) {
        conditions.current = true;
      }

      const exchangeRatesData = await ExchangeRate._list(conditions, paginationOptions);
      const exchange_rates = {
        currency_pair: `${fromCode}/${toCode}`,
        current_only: isCurrentOnly,
        pagination: {
          offset: paginationOptions.offset || 0,
          limit: paginationOptions.limit || exchangeRatesData?.length,
          count: exchangeRatesData?.length || 0,
        },
        items: exchangeRatesData?.map((rate) => rate.toJSON()) || [],
      };

      R.handleSuccess(res, { exchange_rates });
    } catch (error: any) {
      console.error('⌐ Erreur recherche par paire:', error);
      R.handleError(res, HttpStatus.INTERNAL_ERROR, {
        code: 'pair_search_failed',
        message: `Failed to search exchange rates for pair: ${req.params.from_currency}/${req.params.to_currency}`,
      });
    }
  },
);

/**
 * GET /currency/:currency_code - Récupérer tous les taux impliquant une devise
 */
router.get('/currency/:currency_code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { currency_code } = req.params;
    const currencyCode = currency_code.toUpperCase();

    // Validation du code de devise
    if (!/^[A-Z]{3}$/.test(currencyCode)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_currency_code',
        message: 'Currency code must be exactly 3 letters (ISO 4217)',
      });
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);
    const { current_only } = req.query;
    const isCurrentOnly = current_only === 'true' || current_only === '1';

    const conditions: Record<string, any> = {
      $or: [{ from_currency_code: currencyCode }, { to_currency_code: currencyCode }],
    };

    if (isCurrentOnly) {
      conditions.current = true;
    }

    const exchangeRatesData = await ExchangeRate._list(conditions, paginationOptions);
    const exchange_rates = {
      currency_code: currencyCode,
      current_only: isCurrentOnly,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || exchangeRatesData?.length,
        count: exchangeRatesData?.length || 0,
      },
      items: exchangeRatesData?.map((rate) => rate.toJSON()) || [],
    };

    R.handleSuccess(res, { exchange_rates });
  } catch (error: any) {
    console.error('⌐ Erreur recherche par devise:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'currency_search_failed',
      message: `Failed to search exchange rates for currency: ${req.params.currency_code}`,
    });
  }
});

// endregion

// region ROUTES CRUD

/**
 * POST / - Créer un nouveau taux de change
 */
router.post('/', Ensure.post(), async (req: Request, res: Response) => {
  try {
    const { from_currency_code, to_currency_code, exchange_rate, current, created_by } = req.body;

    // Validation des champs requis
    if (!from_currency_code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'from_currency_code_required',
        message: 'From currency code is required',
      });
    }

    if (!to_currency_code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'to_currency_code_required',
        message: 'To currency code is required',
      });
    }

    if (!exchange_rate) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'exchange_rate_required',
        message: 'Exchange rate is required',
      });
    }

    if (!created_by) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'created_by_required',
        message: 'Created by user ID is required',
      });
    }

    if (from_currency_code.toUpperCase() === to_currency_code.toUpperCase()) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'same_currency_pair',
        message: 'From and to currency cannot be the same',
      });
    }

    const exchangeRateObj = new ExchangeRate()
      .setFromCurrencyCode(from_currency_code)
      .setToCurrencyCode(to_currency_code)
      .setExchangeRate(exchange_rate)
      .setCreatedBy(created_by);

    if (current !== undefined) exchangeRateObj.setCurrent(Boolean(current));

    await exchangeRateObj.save();

    console.log(
      `✅ Taux de change créé: ${exchangeRateObj.getCurrencyPair()} - ${exchange_rate} (GUID: ${exchangeRateObj.getGuid()})`,
    );
    R.handleCreated(res, exchangeRateObj.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur création taux de change:', error.message);

    if (error.message.includes('currency')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_currency',
        message: error.message,
      });
    } else if (error.message.includes('exchange_rate')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_exchange_rate',
        message: error.message,
      });
    } else {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'creation_failed',
        message: error.message,
      });
    }
  }
});

/**
 * PUT /:guid - Modifier un taux de change par GUID
 */
router.put('/:guid', Ensure.put(), async (req: Request, res: Response) => {
  try {
    // ✅ Validation manuelle du GUID
    if (!/^\d{6}$/.test(req.params.guid)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_guid',
        message: 'GUID must be a 6-digit number',
      });
    }

    const guid = parseInt(req.params.guid);

    // Charger par GUID
    const exchangeRate = await ExchangeRate._load(guid, true);
    if (!exchangeRate) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'exchange_rate_not_found',
        message: 'Exchange rate not found',
      });
    }

    const {
      from_currency_code,
      to_currency_code,
      exchange_rate: rate,
      current,
      created_by,
    } = req.body;

    // Mise à jour des champs fournis
    if (from_currency_code !== undefined) exchangeRate.setFromCurrencyCode(from_currency_code);
    if (to_currency_code !== undefined) exchangeRate.setToCurrencyCode(to_currency_code);
    if (rate !== undefined) exchangeRate.setExchangeRate(rate);
    if (current !== undefined) exchangeRate.setCurrent(Boolean(current));
    if (created_by !== undefined) exchangeRate.setCreatedBy(created_by);

    // Validation que les devises ne sont pas identiques après modification
    if (exchangeRate.getFromCurrencyCode() === exchangeRate.getToCurrencyCode()) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'same_currency_pair',
        message: 'From and to currency cannot be the same',
      });
    }

    await exchangeRate.save();

    console.log(`✅ Taux de change modifié: GUID ${guid}`);
    R.handleSuccess(res, exchangeRate.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur modification taux de change:', error);

    if (error.message.includes('currency')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_currency',
        message: error.message,
      });
    } else if (error.message.includes('exchange_rate')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_exchange_rate',
        message: error.message,
      });
    } else {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'update_failed',
        message: error.message,
      });
    }
  }
});

/**
 * DELETE /:guid - Supprimer un taux de change par GUID
 */
router.delete('/:guid', Ensure.delete(), async (req: Request, res: Response) => {
  try {
    // ✅ Validation manuelle du GUID
    if (!/^\d+$/.test(req.params.guid)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_guid',
        message: 'GUID must be a positive integer',
      });
    }

    const guid = parseInt(req.params.guid);

    // Charger par GUID
    const exchangeRate = await ExchangeRate._load(guid, true);
    if (!exchangeRate) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'exchange_rate_not_found',
        message: 'Exchange rate not found',
      });
    }

    const deleted = await exchangeRate.delete();

    if (deleted) {
      console.log(`✅ Taux de change supprimé: GUID ${guid} (${exchangeRate.getCurrencyPair()})`);
      R.handleSuccess(res, {
        message: 'Exchange rate deleted successfully',
        guid: guid,
        currency_pair: exchangeRate.getCurrencyPair(),
        exchange_rate: exchangeRate.getExchangeRate(),
      });
    } else {
      R.handleError(res, HttpStatus.INTERNAL_ERROR, G.savedError);
    }
  } catch (error: any) {
    console.error('⌐ Erreur suppression taux de change:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'deletion_failed',
      message: error.message,
    });
  }
});

// endregion

// region ROUTES UTILITAIRES

/**
 * GET /list - Lister tous les taux de change (pour admin)
 */
router.get('/list', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { from_currency_code, to_currency_code, current, created_by } = req.query;

    const conditions: Record<string, any> = {};

    if (from_currency_code) {
      conditions.from_currency_code = (from_currency_code as string).toUpperCase();
    }
    if (to_currency_code) {
      conditions.to_currency_code = (to_currency_code as string).toUpperCase();
    }
    if (current !== undefined) {
      conditions.current = current === 'true' || current === '1';
    }
    if (created_by) {
      conditions.created_by = parseInt(created_by as string);
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const exchangeRateEntries = await ExchangeRate._list(conditions, paginationOptions);
    const exchange_rates = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || exchangeRateEntries?.length,
        count: exchangeRateEntries?.length || 0,
      },
      items: exchangeRateEntries?.map((rate) => rate.toJSON()) || [],
    };

    R.handleSuccess(res, { exchange_rates });
  } catch (error: any) {
    console.error('⌐ Erreur listing taux de change:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'listing_failed',
      message: 'Failed to list exchange rates',
    });
  }
});

/**
 * GET /convert/:amount/:from/:to - Convertir un montant entre deux devises
 */
router.get('/convert/:amount/:from/:to', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.params;
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    // Validation des paramètres
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_amount',
        message: 'Amount must be a positive number',
      });
    }

    if (!/^[A-Z]{3}$/.test(fromCode) || !/^[A-Z]{3}$/.test(toCode)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_currency_code',
        message: 'Currency codes must be exactly 3 letters (ISO 4217)',
      });
    }

    if (fromCode === toCode) {
      return R.handleSuccess(res, {
        from_currency: fromCode,
        to_currency: toCode,
        original_amount: amountNum,
        converted_amount: amountNum,
        exchange_rate: 1,
        currency_pair: `${fromCode}/${toCode}`,
        conversion_note: 'Same currency conversion',
      });
    }

    // Rechercher le taux courant
    const conditions = {
      from_currency_code: fromCode,
      to_currency_code: toCode,
      current: true,
    };

    const exchangeRates = await ExchangeRate._list(conditions, { limit: 1 });

    if (!exchangeRates || exchangeRates.length === 0) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'exchange_rate_not_found',
        message: `Current exchange rate not found for pair ${fromCode}/${toCode}`,
      });
    }

    const rate = exchangeRates[0];
    const convertedAmount = amountNum * (rate.getExchangeRate() || 0);

    R.handleSuccess(res, {
      from_currency: fromCode,
      to_currency: toCode,
      original_amount: amountNum,
      converted_amount: Math.round(convertedAmount * 10000) / 10000, // Arrondir à 4 décimales
      exchange_rate: rate.getExchangeRate(),
      currency_pair: rate.getCurrencyPair(),
      rate_guid: rate.getGuid(),
      conversion_timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('⌐ Erreur conversion:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'conversion_failed',
      message: 'Failed to convert amount',
    });
  }
});

/**
 * GET /:identifier - Recherche intelligente par ID ou GUID
 */
router.get('/:identifier', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let exchangeRate: ExchangeRate | null = null;

    // Essayer différentes méthodes de recherche selon le format
    if (/^\d+$/.test(identifier)) {
      const numericId = parseInt(identifier);

      // Essayer par ID d'abord
      exchangeRate = await ExchangeRate._load(numericId);

      // Si pas trouvé, essayer par GUID
      if (!exchangeRate) {
        exchangeRate = await ExchangeRate._load(numericId, true);
      }
    }

    if (!exchangeRate) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'exchange_rate_not_found',
        message: `Exchange rate with identifier '${identifier}' not found`,
      });
    }

    R.handleSuccess(res, exchangeRate.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur recherche taux de change:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search exchange rate',
    });
  }
});

// endregion

export default router;
