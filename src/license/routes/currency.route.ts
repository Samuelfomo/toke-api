import { Request, Response, Router } from 'express';

import Currency from '../class/Currency';
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
 * GET / - Exporter toutes les devises
 */
router.get('/', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const currencies = await Currency.exportable(paginationOptions);
    R.handleSuccess(res, { currencies });
  } catch (error: any) {
    console.error('⌐ Erreur export devises:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'export_failed',
      message: 'Failed to export currencies',
    });
  }
});

/**
 * GET /revision - Récupérer uniquement la révision actuelle
 */
router.get('/revision', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const revision = await Revision.getRevision(TS.CURRENCY);

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
 * GET /active/:status - Lister les devises par statut actif/inactif
 */
router.get('/active/:status', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const isActive = status.toLowerCase() === 'true' || status === '1';

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const currenciesData = await Currency._listByActiveStatus(isActive, paginationOptions);
    const currencies = {
      active: isActive,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || currenciesData?.length,
        count: currenciesData?.length || 0,
      },
      items: currenciesData?.map((currency) => currency.toJSON()) || [],
    };

    R.handleSuccess(res, { currencies });
  } catch (error: any) {
    console.error('⌐ Erreur recherche par statut:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'status_search_failed',
      message: `Failed to search currencies by status: ${req.params.status}`,
    });
  }
});

// endregion

// region ROUTES CRUD

/**
 * POST / - Créer une nouvelle devise
 */
router.post('/', Ensure.post(), async (req: Request, res: Response) => {
  try {
    const { code, name, symbol, decimal_places, active } = req.body;

    // Validation des champs requis
    if (!code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'code_required',
        message: 'Currency code (ISO 4217) is required',
      });
    }

    if (!name) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'name_required',
        message: 'Currency name is required',
      });
    }

    if (!symbol) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'symbol_required',
        message: 'Currency symbol is required',
      });
    }

    if (decimal_places === undefined || decimal_places === null) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'decimal_places_required',
        message: 'Decimal places is required',
      });
    }

    const currency = new Currency()
      .setCode(code)
      .setName(name)
      .setSymbol(symbol)
      .setDecimalPlaces(decimal_places);

    if (active !== undefined) currency.setActive(Boolean(active));

    await currency.save();

    console.log(`✅ Devise créée: ${code} - ${name} (GUID: ${currency.getGuid()})`);
    R.handleCreated(res, currency.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur création devise:', error.message);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'currency_already_exists',
        message: error.message,
      });
    } else if (error.message.includes('code')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_code',
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
 * PUT /:guid - Modifier une devise par GUID
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
    const currency = await Currency._load(guid, true);
    if (!currency) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'currency_not_found',
        message: 'Currency not found',
      });
    }

    const { code, name, symbol, decimal_places, active } = req.body;

    // Mise à jour des champs fournis
    if (code !== undefined) currency.setCode(code);
    if (name !== undefined) currency.setName(name);
    if (symbol !== undefined) currency.setSymbol(symbol);
    if (decimal_places !== undefined) currency.setDecimalPlaces(decimal_places);
    if (active !== undefined) currency.setActive(Boolean(active));

    await currency.save();

    console.log(`✅ Devise modifiée: GUID ${guid}`);
    R.handleSuccess(res, currency.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur modification devise:', error);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'currency_already_exists',
        message: error.message,
      });
    } else if (error.message.includes('code')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_code',
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
 * DELETE /:guid - Supprimer une devise par GUID
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
    const currency = await Currency._load(guid, true);
    if (!currency) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'currency_not_found',
        message: 'Currency not found',
      });
    }

    const deleted = await currency.delete();

    if (deleted) {
      console.log(
        `✅ Devise supprimée: GUID ${guid} (${currency.getCode()} - ${currency.getName()})`,
      );
      R.handleSuccess(res, {
        message: 'Currency deleted successfully',
        guid: guid,
        code: currency.getCode(),
        name: currency.getName(),
      });
    } else {
      R.handleError(res, HttpStatus.INTERNAL_ERROR, G.savedError);
    }
  } catch (error: any) {
    console.error('⌐ Erreur suppression devise:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'deletion_failed',
      message: error.message,
    });
  }
});

// endregion

// region ROUTES UTILITAIRES

/**
 * GET /list - Lister toutes les devises (pour admin)
 */
router.get('/list', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    const conditions: Record<string, any> = {};

    if (active !== undefined) {
      conditions.active = active === 'true' || active === '1';
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const currencyEntries = await Currency._list(conditions, paginationOptions);
    const currencies = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || currencyEntries?.length,
        count: currencyEntries?.length || 0,
      },
      items: currencyEntries?.map((currency) => currency.toJSON()) || [],
    };

    R.handleSuccess(res, { currencies });
  } catch (error: any) {
    console.error('⌐ Erreur listing devises:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'listing_failed',
      message: 'Failed to list currencies',
    });
  }
});

/**
 * GET /search/code/:code - Rechercher par code ISO 4217
 */
router.get('/search/code/:code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Validation du format ISO 4217
    if (!/^[A-Z]{3}$/i.test(code)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_code_format',
        message: 'Currency code must be exactly 3 letters (ISO 4217)',
      });
    }

    const currency = await Currency._load(code.toUpperCase(), false, true);

    if (!currency) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'currency_not_found',
        message: `Currency with code '${code.toUpperCase()}' not found`,
      });
    }

    R.handleSuccess(res, currency.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur recherche par code:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search currency by code',
    });
  }
});

/**
 * GET /:identifier - Recherche intelligente par ID, GUID ou code ISO
 */
router.get('/:identifier', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let currency: Currency | null = null;

    // Essayer différentes méthodes de recherche selon le format
    if (/^\d+$/.test(identifier)) {
      const numericId = parseInt(identifier);

      // Essayer par ID d'abord
      currency = await Currency._load(numericId);

      // Si pas trouvé, essayer par GUID
      if (!currency) {
        currency = await Currency._load(numericId, true);
      }
    } else if (/^[A-Z]{3}$/i.test(identifier)) {
      // Recherche par code ISO 4217
      currency = await Currency._load(identifier.toUpperCase(), false, true);
    }

    if (!currency) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'currency_not_found',
        message: `Currency with identifier '${identifier}' not found`,
      });
    }

    R.handleSuccess(res, currency.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur recherche devise:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search currency',
    });
  }
});

// endregion

export default router;
