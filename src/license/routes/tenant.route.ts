import { Request, Response, Router } from 'express';

import Tenant from '../class/Tenant';
import R from '../../tools/response';
import HttpStatus from '../../tools/http-status';
import G from '../../tools/glossary';
import Ensure from '../middle/ensured-routes';
import ExtractQueryParams from '../../utils/extract.query.params';
import Revision from '../../tools/revision';
import { tableStructure as TS } from '../../utils/response.model';
import { Status } from '../database/data/tenant.db';

const router = Router();

// region ROUTES D'EXPORT

/**
 * GET / - Exporter tous les tenants
 */
router.get('/', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenants = await Tenant.exportable(paginationOptions);
    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur export tenants:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'export_failed',
      message: 'Failed to export tenants',
    });
  }
});

/**
 * GET /revision - Récupérer uniquement la révision actuelle
 */
router.get('/revision', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const revision = await Revision.getRevision(TS.TENANT);

    R.handleSuccess(res, {
      revision,
      checked_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('⚠️ Erreur récupération révision:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'revision_check_failed',
      message: 'Failed to get current revision',
    });
  }
});

/**
 * GET /country/:country_code - Lister les tenants par code pays
 */
router.get('/country/:country_code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { country_code } = req.params;
    const upperCountryCode = country_code.toUpperCase();

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenantsData = await Tenant._listByCountryCode(upperCountryCode, paginationOptions);
    const tenants = {
      country_code: upperCountryCode,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || tenantsData?.length,
        count: tenantsData?.length || 0,
      },
      items: tenantsData?.map((tenant) => tenant.toJSON()) || [],
    };

    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par code pays:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'country_search_failed',
      message: `Failed to search tenants by country: ${req.params.country_code}`,
    });
  }
});

/**
 * GET /currency/:currency_code - Lister les tenants par code devise
 */
router.get('/currency/:currency_code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { currency_code } = req.params;
    const upperCurrencyCode = currency_code.toUpperCase();

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenantsData = await Tenant._listByCurrencyCode(upperCurrencyCode, paginationOptions);
    const tenants = {
      currency_code: upperCurrencyCode,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || tenantsData?.length,
        count: tenantsData?.length || 0,
      },
      items: tenantsData?.map((tenant) => tenant.toJSON()) || [],
    };

    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par devise:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'currency_search_failed',
      message: `Failed to search tenants by currency: ${req.params.currency_code}`,
    });
  }
});

/**
 * GET /language/:language_code - Lister les tenants par code de langue
 */
router.get('/language/:language_code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { language_code } = req.params;
    const lowerLanguageCode = language_code.toLowerCase();

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenantsData = await Tenant._listByLanguageCode(lowerLanguageCode, paginationOptions);
    const tenants = {
      language_code: lowerLanguageCode,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || tenantsData?.length,
        count: tenantsData?.length || 0,
      },
      items: tenantsData?.map((tenant) => tenant.toJSON()) || [],
    };

    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par langue:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'language_search_failed',
      message: `Failed to search tenants by language: ${req.params.language_code}`,
    });
  }
});

/**
 * GET /timezone/:timezone - Lister les tenants par fuseau horaire
 */
router.get('/timezone/:timezone', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { timezone } = req.params;

    // Décoder l'URL pour gérer les fuseaux comme "Europe/Paris"
    const decodedTimezone = decodeURIComponent(timezone);

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenantsData = await Tenant._listByTimezone(decodedTimezone, paginationOptions);
    const tenants = {
      timezone: decodedTimezone,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || tenantsData?.length,
        count: tenantsData?.length || 0,
      },
      items: tenantsData?.map((tenant) => tenant.toJSON()) || [],
    };

    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par timezone:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'timezone_search_failed',
      message: `Failed to search tenants by timezone: ${req.params.timezone}`,
    });
  }
});

/**
 * GET /tax-exempt/:status - Lister les tenants par exemption fiscale
 */
router.get('/tax-exempt/:status', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const isTaxExempt = status.toLowerCase() === 'true' || status === '1';

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenantsData = await Tenant._listByTaxExempt(isTaxExempt, paginationOptions);
    const tenants = {
      tax_exempt: isTaxExempt,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || tenantsData?.length,
        count: tenantsData?.length || 0,
      },
      items: tenantsData?.map((tenant) => tenant.toJSON()) || [],
    };

    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par exemption fiscale:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'tax_exempt_search_failed',
      message: `Failed to search tenants by tax exemption: ${req.params.status}`,
    });
  }
});

/**
 * GET /status/:status - Lister les tenants par statut
 */
router.get('/status/:status', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const upperStatus = status.toUpperCase() as Status;

    // Validation du statut
    if (!Object.values(Status).includes(upperStatus)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_status',
        message: `Invalid status. Must be one of: ${Object.values(Status).join(', ')}`,
      });
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenantsData = await Tenant._listByStatus(upperStatus, paginationOptions);
    const tenants = {
      status: upperStatus,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || tenantsData?.length,
        count: tenantsData?.length || 0,
      },
      items: tenantsData?.map((tenant) => tenant.toJSON()) || [],
    };

    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par statut:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'status_search_failed',
      message: `Failed to search tenants by status: ${req.params.status}`,
    });
  }
});

// endregion

// region ROUTES CRUD

/**
 * POST / - Créer un nouveau tenant
 */
router.post('/', Ensure.post(), async (req: Request, res: Response) => {
  try {
    const {
      name,
      // key,
      country_code,
      primary_currency_code,
      preferred_language_code,
      timezone,
      tax_number,
      tax_exempt,
      billing_email,
      billing_address,
      billing_phone,
      status,
      // subdomain,
      // database_name,
      // database_username,
      // database_password,
    } = req.body;

    // Validation des champs requis
    if (!name) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'name_required',
        message: 'Tenant name is required',
      });
    }

    // if (!key) {
    //   return R.handleError(res, HttpStatus.BAD_REQUEST, {
    //     code: 'key_required',
    //     message: 'Tenant key is required',
    //   });
    // }

    if (!country_code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'country_code_required',
        message: 'Country code is required',
      });
    }

    if (!primary_currency_code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'currency_code_required',
        message: 'Primary currency code is required',
      });
    }

    if (!billing_email) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'billing_email_required',
        message: 'Billing email is required',
      });
    }

    // if (!subdomain) {
    //   return R.handleError(res, HttpStatus.BAD_REQUEST, {
    //     code: 'subdomain_required',
    //     message: 'Subdomain is required',
    //   });
    // }
    //
    // if (!database_name) {
    //   return R.handleError(res, HttpStatus.BAD_REQUEST, {
    //     code: 'database_name_required',
    //     message: 'Database name is required',
    //   });
    // }
    //
    // if (!database_username) {
    //   return R.handleError(res, HttpStatus.BAD_REQUEST, {
    //     code: 'database_username_required',
    //     message: 'Database username is required',
    //   });
    // }
    //
    // if (!database_password) {
    //   return R.handleError(res, HttpStatus.BAD_REQUEST, {
    //     code: 'database_password_required',
    //     message: 'Database password is required',
    //   });
    // }

    const tenant = new Tenant()
      .setName(name)
      // .setKey(key)
      .setCountryCode(country_code)
      .setPrimaryCurrencyCode(primary_currency_code)
      .setBillingEmail(billing_email)
      // .setSubdomain(subdomain)
      // .setDatabaseName(database_name)
      // .setDatabaseUsername(database_username)
      // .setDatabasePassword(database_password);

    if (preferred_language_code) tenant.setPreferredLanguageCode(preferred_language_code);
    if (timezone) tenant.setTimezone(timezone);
    if (tax_number) tenant.setTaxNumber(tax_number);
    if (tax_exempt !== undefined) tenant.setTaxExempt(Boolean(tax_exempt));
    if (billing_address) tenant.setBillingAddress(billing_address);
    if (billing_phone) tenant.setBillingPhone(billing_phone);
    if (status) tenant.setStatus(status as Status);

    await tenant.save();

    console.log(`✅ Tenant créé: ${country_code} - ${name} (GUID: ${tenant.getGuid()})`);
    R.handleCreated(res, tenant.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur création tenant:', error.message);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'tenant_already_exists',
        message: error.message,
      });
    } else if (error.message.includes('required')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'validation_failed',
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
 * PUT /:guid - Modifier un tenant par GUID
 */
router.put('/:guid', Ensure.put(), async (req: Request, res: Response) => {
  try {
    // Validation manuelle du GUID
    if (!/^\d{6}$/.test(req.params.guid)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_guid',
        message: 'GUID must be a 6-digit number',
      });
    }

    const guid = parseInt(req.params.guid);

    // Charger par GUID
    const tenant = await Tenant._load(guid, true);
    if (!tenant) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tenant_not_found',
        message: 'Tenant not found',
      });
    }

    const {
      name,
      // key,
      country_code,
      primary_currency_code,
      preferred_language_code,
      timezone,
      tax_number,
      tax_exempt,
      billing_email,
      billing_address,
      billing_phone,
      status,
      // subdomain,
      // database_name,
      // database_username,
      // database_password,
    } = req.body;

    // Mise à jour des champs fournis
    if (name !== undefined) tenant.setName(name);
    // if (key !== undefined) tenant.setKey(key);
    if (country_code !== undefined) tenant.setCountryCode(country_code);
    if (primary_currency_code !== undefined) tenant.setPrimaryCurrencyCode(primary_currency_code);
    if (preferred_language_code !== undefined) tenant.setPreferredLanguageCode(preferred_language_code);
    if (timezone !== undefined) tenant.setTimezone(timezone);
    if (tax_number !== undefined) tenant.setTaxNumber(tax_number);
    if (tax_exempt !== undefined) tenant.setTaxExempt(Boolean(tax_exempt));
    if (billing_email !== undefined) tenant.setBillingEmail(billing_email);
    if (billing_address !== undefined) tenant.setBillingAddress(billing_address);
    if (billing_phone !== undefined) tenant.setBillingPhone(billing_phone);
    if (status !== undefined) tenant.setStatus(status as Status);
    // if (subdomain !== undefined) tenant.setSubdomain(subdomain);
    // if (database_name !== undefined) tenant.setDatabaseName(database_name);
    // if (database_username !== undefined) tenant.setDatabaseUsername(database_username);
    // if (database_password !== undefined) tenant.setDatabasePassword(database_password);

    await tenant.save();

    console.log(`✅ Tenant modifié: GUID ${guid}`);
    R.handleSuccess(res, tenant.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur modification tenant:', error);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'tenant_already_exists',
        message: error.message,
      });
    } else if (error.message.includes('required')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'validation_failed',
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
 * DELETE /:guid - Supprimer un tenant par GUID
 */
router.delete('/:guid', Ensure.delete(), async (req: Request, res: Response) => {
  try {
    // Validation manuelle du GUID
    if (!/^\d+$/.test(req.params.guid)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_guid',
        message: 'GUID must be a positive integer',
      });
    }

    const guid = parseInt(req.params.guid);

    // Charger par GUID
    const tenant = await Tenant._load(guid, true);
    if (!tenant) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tenant_not_found',
        message: 'Tenant not found',
      });
    }

    const deleted = await tenant.delete();

    if (deleted) {
      console.log(`✅ Tenant supprimé: GUID ${guid} (${tenant.getKey()} - ${tenant.getName()})`);
      R.handleSuccess(res, {
        message: 'Tenant deleted successfully',
        guid: guid,
        key: tenant.getKey(),
        name: tenant.getName(),
      });
    } else {
      R.handleError(res, HttpStatus.INTERNAL_ERROR, G.savedError);
    }
  } catch (error: any) {
    console.error('⚠️ Erreur suppression tenant:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'deletion_failed',
      message: error.message,
    });
  }
});

// endregion

// region ROUTES UTILITAIRES

/**
 * GET /list - Lister tous les tenants (pour admin)
 */
router.get('/list', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const {
      country_code,
      primary_currency_code,
      preferred_language_code,
      timezone,
      tax_exempt,
      status
    } = req.query;

    const conditions: Record<string, any> = {};

    if (country_code) {
      conditions.country_code = (country_code as string).toUpperCase();
    }
    if (primary_currency_code) {
      conditions.primary_currency_code = (primary_currency_code as string).toUpperCase();
    }
    if (preferred_language_code) {
      conditions.preferred_language_code = (preferred_language_code as string).toLowerCase();
    }
    if (timezone) {
      conditions.timezone = timezone;
    }
    if (tax_exempt !== undefined) {
      conditions.tax_exempt = tax_exempt === 'true' || tax_exempt === '1';
    }
    if (status) {
      conditions.status = (status as string).toUpperCase();
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const tenantEntries = await Tenant._list(conditions, paginationOptions);
    const tenants = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || tenantEntries?.length,
        count: tenantEntries?.length || 0,
      },
      items: tenantEntries?.map((tenant) => tenant.toJSON()) || [],
    };

    R.handleSuccess(res, { tenants });
  } catch (error: any) {
    console.error('⚠️ Erreur listing tenants:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'listing_failed',
      message: 'Failed to list tenants',
    });
  }
});

/**
 * GET /search/key/:key - Rechercher par clé
 */
router.get('/search/key/:key', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const tenant = await Tenant._load(key, false, true);

    if (!tenant) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tenant_not_found',
        message: `Tenant with key '${key}' not found`,
      });
    }

    R.handleSuccess(res, tenant.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par clé:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search tenant by key',
    });
  }
});

/**
 * GET /search/subdomain/:subdomain - Rechercher par sous-domaine
 */
router.get('/search/subdomain/:subdomain', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;

    const tenant = await Tenant._load(subdomain.toLowerCase(), false, false, true);

    if (!tenant) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tenant_not_found',
        message: `Tenant with subdomain '${subdomain}' not found`,
      });
    }

    R.handleSuccess(res, tenant.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par sous-domaine:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search tenant by subdomain',
    });
  }
});

/**
 * GET /:identifier - Recherche intelligente par ID, GUID, clé ou sous-domaine
 */
router.get('/:identifier', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let tenant: Tenant | null = null;

    // Essayer différentes méthodes de recherche selon le format
    if (/^\d+$/.test(identifier)) {
      const numericId = parseInt(identifier);

      // Essayer par ID d'abord
      tenant = await Tenant._load(numericId);

      // Si pas trouvé, essayer par GUID
      if (!tenant) {
        tenant = await Tenant._load(numericId, true);
      }
    } else {
      // Essayer par clé d'abord
      tenant = await Tenant._load(identifier, false, true);

      // Si pas trouvé, essayer par sous-domaine
      if (!tenant) {
        tenant = await Tenant._load(identifier.toLowerCase(), false, false, true);
      }
    }

    if (!tenant) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tenant_not_found',
        message: `Tenant with identifier '${identifier}' not found`,
      });
    }

    R.handleSuccess(res, tenant.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur recherche tenant:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search tenant',
    });
  }
});

// endregion

export default router;