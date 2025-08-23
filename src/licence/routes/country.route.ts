import { Request, Response, Router } from 'express';

import Country from '../class/Country';
import R from '../tools/response';
import HttpStatus from '../tools/http-status';
import G from '../tools/glossary';
import Ensure from '../middle/ensured-routes';
import ExtractQueryParams from '../utils/extract.query.params';

const router = Router();

// region ROUTES D'EXPORT

/**
 * GET / - Exporter tous les pays
 */
router.get('/', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const countries = await Country.exportable(paginationOptions);
    R.handleSuccess(res, { countries });
  } catch (error: any) {
    console.error('⌐ Erreur export pays:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'export_failed',
      message: 'Failed to export countries',
    });
  }
});

/**
 * GET /revision - Récupérer uniquement la révision actuelle
 */
router.get('/revision', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const instance = new Country();
    const revision = await (instance as any).getRevision(); // Accès à la méthode private

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
 * GET /timezone/:timezone - Lister les pays par fuseau horaire
 */
router.get('/timezone/:timezone', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { timezone } = req.params;

    // Décoder l'URL pour gérer les fuseaux comme "Europe/Paris"
    const decodedTimezone = decodeURIComponent(timezone);

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const countriesData = await Country._listByTimezone(decodedTimezone, paginationOptions);
    const countries = {
      timezone: decodedTimezone,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || countriesData?.length,
        count: countriesData?.length || 0,
      },
      items: countriesData?.map((country) => country.toJSON()) || [],
    };

    R.handleSuccess(res, { countries });
  } catch (error: any) {
    console.error('⌐ Erreur recherche par timezone:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'timezone_search_failed',
      message: `Failed to search countries by timezone: ${req.params.timezone}`,
    });
  }
});

/**
 * GET /currency/:currency_code - Lister les pays par code devise
 */
router.get('/currency/:currency_code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { currency_code } = req.params;
    const upperCurrencyCode = currency_code.toUpperCase();

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const countriesData = await Country._listByCurrencyCode(upperCurrencyCode, paginationOptions);
    const countries = {
      currency_code: upperCurrencyCode,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || countriesData?.length,
        count: countriesData?.length || 0,
      },
      items: countriesData?.map((country) => country.toJSON()) || [],
    };

    R.handleSuccess(res, { countries });
  } catch (error: any) {
    console.error('⌐ Erreur recherche par devise:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'currency_search_failed',
      message: `Failed to search countries by currency: ${req.params.currency_code}`,
    });
  }
});

/**
 * GET /language/:language_code - Lister les pays par code de langue
 */
router.get('/language/:language_code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { language_code } = req.params;
    const lowerLanguageCode = language_code.toLowerCase();

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const countriesData = await Country._listByLanguageCode(lowerLanguageCode, paginationOptions);
    const countries = {
      language_code: lowerLanguageCode,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || countriesData?.length,
        count: countriesData?.length || 0,
      },
      items: countriesData?.map((country) => country.toJSON()) || [],
    };

    R.handleSuccess(res, { countries });
  } catch (error: any) {
    console.error('⌐ Erreur recherche par langue:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'language_search_failed',
      message: `Failed to search countries by language: ${req.params.language_code}`,
    });
  }
});

/**
 * GET /active/:status - Lister les pays par statut actif/inactif
 */
router.get('/active/:status', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const isActive = status.toLowerCase() === 'true' || status === '1';

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const countriesData = await Country._listByActiveStatus(isActive, paginationOptions);
    const countries = {
      is_active: isActive,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || countriesData?.length,
        count: countriesData?.length || 0,
      },
      items: countriesData?.map((country) => country.toJSON()) || [],
    };

    R.handleSuccess(res, { countries });
  } catch (error: any) {
    console.error('⌐ Erreur recherche par statut:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'status_search_failed',
      message: `Failed to search countries by status: ${req.params.status}`,
    });
  }
});

// endregion

// region ROUTES CRUD

/**
 * POST / - Créer un nouveau pays
 */
router.post('/', Ensure.post(), async (req: Request, res: Response) => {
  try {
    const {
      code,
      name_en,
      name_local,
      default_currency_code,
      default_language_code,
      is_active,
      timezone_default,
      phone_prefix,
    } = req.body;

    // Validation des champs requis
    if (!code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'code_required',
        message: 'Country code (ISO) is required',
      });
    }

    if (!name_en) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'name_en_required',
        message: 'Country name (English) is required',
      });
    }

    if (!default_currency_code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'currency_code_required',
        message: 'Default currency code is required',
      });
    }

    if (!default_language_code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'language_code_required',
        message: 'Default language code is required',
      });
    }

    if (!phone_prefix) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'phone_prefix_required',
        message: 'Phone prefix is required',
      });
    }

    const country = new Country()
      .setCode(code)
      .setNameEn(name_en)
      .setDefaultCurrencyCode(default_currency_code)
      .setDefaultLanguageCode(default_language_code)
      .setPhonePrefix(phone_prefix);

    if (name_local) country.setNameLocal(name_local);
    if (is_active !== undefined) country.setIsActive(Boolean(is_active));
    if (timezone_default) country.setTimezoneDefault(timezone_default);

    await country.save();

    console.log(`✅ Pays créé: ${code} - ${name_en} (GUID: ${country.getGuid()})`);
    R.handleCreated(res, country.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur création pays:', error.message);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'country_already_exists',
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
 * PUT /:guid - Modifier un pays par GUID
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
    const country = await Country._load(guid, true);
    if (!country) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'country_not_found',
        message: 'Country not found',
      });
    }

    const {
      code,
      name_en,
      name_local,
      default_currency_code,
      default_language_code,
      is_active,
      timezone_default,
      phone_prefix,
    } = req.body;

    // Mise à jour des champs fournis
    if (code !== undefined) country.setCode(code);
    if (name_en !== undefined) country.setNameEn(name_en);
    if (name_local !== undefined) country.setNameLocal(name_local);
    if (default_currency_code !== undefined) country.setDefaultCurrencyCode(default_currency_code);
    if (default_language_code !== undefined) country.setDefaultLanguageCode(default_language_code);
    if (is_active !== undefined) country.setIsActive(Boolean(is_active));
    if (timezone_default !== undefined) country.setTimezoneDefault(timezone_default);
    if (phone_prefix !== undefined) country.setPhonePrefix(phone_prefix);

    await country.save();

    console.log(`✅ Pays modifié: GUID ${guid}`);
    R.handleSuccess(res, country.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur modification pays:', error);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'country_already_exists',
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
 * DELETE /:guid - Supprimer un pays par GUID
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
    const country = await Country._load(guid, true);
    if (!country) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'country_not_found',
        message: 'Country not found',
      });
    }

    const deleted = await country.delete();

    if (deleted) {
      console.log(`✅ Pays supprimé: GUID ${guid} (${country.getCode()} - ${country.getNameEn()})`);
      R.handleSuccess(res, {
        message: 'Country deleted successfully',
        guid: guid,
        code: country.getCode(),
        name: country.getNameEn(),
      });
    } else {
      R.handleError(res, HttpStatus.INTERNAL_ERROR, G.savedError);
    }
  } catch (error: any) {
    console.error('⌐ Erreur suppression pays:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'deletion_failed',
      message: error.message,
    });
  }
});

// endregion

// region ROUTES UTILITAIRES

/**
 * GET /list - Lister tous les pays (pour admin)
 */
router.get('/list', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { timezone_default, default_currency_code, default_language_code, is_active } = req.query;

    const conditions: Record<string, any> = {};

    if (timezone_default) {
      conditions.timezone_default = timezone_default;
    }
    if (default_currency_code) {
      conditions.default_currency_code = (default_currency_code as string).toUpperCase();
    }
    if (default_language_code) {
      conditions.default_language_code = (default_language_code as string).toLowerCase();
    }
    if (is_active !== undefined) {
      conditions.is_active = is_active === 'true' || is_active === '1';
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const countryEntries = await Country._list(conditions, paginationOptions);
    const countries = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || countryEntries?.length,
        count: countryEntries?.length || 0,
      },
      items: countryEntries?.map((country) => country.toJSON()) || [],
    };

    R.handleSuccess(res, { countries });
  } catch (error: any) {
    console.error('⌐ Erreur listing pays:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'listing_failed',
      message: 'Failed to list countries',
    });
  }
});

/**
 * GET /search/code/:code - Rechercher par code ISO
 */
router.get('/search/code/:code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Validation du format ISO
    if (!/^[A-Z]{2}$/i.test(code)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_code_format',
        message: 'Country code must be exactly 2 letters',
      });
    }

    const country = await Country._load(code.toUpperCase(), false, true);

    if (!country) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'country_not_found',
        message: `Country with code '${code.toUpperCase()}' not found`,
      });
    }

    R.handleSuccess(res, country.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur recherche par code:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search country by code',
    });
  }
});

/**
 * GET /:identifier - Recherche intelligente par ID, GUID ou code ISO
 */
router.get('/:identifier', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let country: Country | null = null;

    // Essayer différentes méthodes de recherche selon le format
    if (/^\d+$/.test(identifier)) {
      const numericId = parseInt(identifier);

      // Essayer par ID d'abord
      country = await Country._load(numericId);

      // Si pas trouvé, essayer par GUID
      if (!country) {
        country = await Country._load(numericId, true);
      }
    } else if (/^[A-Z]{2}$/i.test(identifier)) {
      // Recherche par code ISO
      country = await Country._load(identifier.toUpperCase(), false, true);
    }

    if (!country) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'country_not_found',
        message: `Country with identifier '${identifier}' not found`,
      });
    }

    R.handleSuccess(res, country.toJSON());
  } catch (error: any) {
    console.error('⌐ Erreur recherche pays:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search country',
    });
  }
});

// endregion

export default router;
