import { Router, Request, Response } from 'express';

import Country from '../class/Country';
import R from '../tools/response';
import HttpStatus from '../tools/http-status';
import G from '../tools/glossary';
import Ensure from '../middle/ensured-routes';
// import { ServerAuth } from '../middle/server-auth';
// import E from '../utils/endpoint.data';
import ExtractQueryParams from '../utils/extract.query.params';
// import { UserAuth } from '../middle/user-auth';

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
        console.error('❌ Erreur export pays:', error);
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
        console.error('❌ Erreur récupération révision:', error);
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
        console.error('❌ Erreur recherche par timezone:', error);
        R.handleError(res, HttpStatus.INTERNAL_ERROR, {
            code: 'timezone_search_failed',
            message: `Failed to search countries by timezone: ${req.params.timezone}`,
        });
    }
});

// endregion

// region ROUTES CRUD

/**
 * POST / - Créer un nouveau pays
 */
router.post(
    '/',
    Ensure.post(),
    // ServerAuth.requirePermission(E.postCountry),
    // UserAuth.authenticate,
    async (req: Request, res: Response) => {
        try {
            const { code, iso, name, timezone, mobileRegex, flag } = req.body;

            // Validation des champs requis
            if (!code) {
                return R.handleError(res, HttpStatus.BAD_REQUEST, {
                    code: 'code_required',
                    message: 'Country code is required',
                });
            }

            if (!iso) {
                return R.handleError(res, HttpStatus.BAD_REQUEST, {
                    code: 'iso_required',
                    message: 'Country ISO code is required',
                });
            }

            if (!name) {
                return R.handleError(res, HttpStatus.BAD_REQUEST, {
                    code: 'name_required',
                    message: 'Country name is required',
                });
            }

            const country = new Country().setCode(Number(code)).setIso(iso).setName(name);

            if (timezone) country.setTimezone(timezone);
            if (mobileRegex) country.setMobileRegex(mobileRegex);
            if (flag) country.setFlag(flag);

            await country.save();

            console.log(`✅ Pays créé: ${iso} - ${name} (GUID: ${country.getGuid()})`);
            R.handleCreated(res, country.toJSON());
        } catch (error: any) {
            console.error('❌ Erreur création pays:', error.message);

            if (error.message.includes('already exists')) {
                R.handleError(res, HttpStatus.CONFLICT, {
                    code: 'country_already_exists',
                    message: error.message,
                });
            } else if (error.message.includes('ISO')) {
                R.handleError(res, HttpStatus.BAD_REQUEST, {
                    code: 'invalid_iso',
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
    }
);

/**
 * PUT / : guid - Modifier un pays par GUID
 */
router.put(
    '/:guid',
    Ensure.put(),
    // ServerAuth.requirePermission(E.postCountry),
    // UserAuth.authenticate,
    async (req: Request, res: Response) => {
        try {
            // ✅ Validation manuelle du GUID
            if (!/^\d{6}$/.test(req.params.guid)) {
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

            const { code, iso, name, timezone, mobileRegex, flag } = req.body;

            // Mise à jour des champs fournis
            if (code !== undefined) country.setCode(Number(code));
            if (iso !== undefined) country.setIso(iso);
            if (name !== undefined) country.setName(name);
            if (timezone !== undefined) country.setTimezone(timezone);
            if (mobileRegex !== undefined) country.setMobileRegex(mobileRegex);
            if (flag !== undefined) country.setFlag(flag);

            await country.save();

            console.log(`✅ Pays modifié: GUID ${guid}`);
            R.handleSuccess(res, country.toJSON());
        } catch (error: any) {
            console.error('❌ Erreur modification pays:', error);

            if (error.message.includes('already exists')) {
                R.handleError(res, HttpStatus.CONFLICT, {
                    code: 'country_already_exists',
                    message: error.message,
                });
            } else if (error.message.includes('ISO')) {
                R.handleError(res, HttpStatus.BAD_REQUEST, {
                    code: 'invalid_iso',
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
    }
);

/**
 * DELETE /:guid - Supprimer un pays par GUID
 */
router.delete(
    '/:guid',
    Ensure.delete(),
    // ServerAuth.requirePermission(E.postCountry),
    // UserAuth.authenticate,
    async (req: Request, res: Response) => {
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
                console.log(`✅ Pays supprimé: GUID ${guid} (${country.getIso()} - ${country.getName()})`);
                R.handleSuccess(res, {
                    message: 'Country deleted successfully',
                    guid: guid,
                    iso: country.getIso(),
                    name: country.getName(),
                });
            } else {
                R.handleError(res, HttpStatus.INTERNAL_ERROR, G.savedError);
            }
        } catch (error: any) {
            console.error('❌ Erreur suppression pays:', error);
            R.handleError(res, HttpStatus.INTERNAL_ERROR, {
                code: 'deletion_failed',
                message: error.message,
            });
        }
    }
);

// endregion

// region ROUTES UTILITAIRES

/**
 * GET /list - Lister tous les pays (pour admin)
 */
router.get(
    '/list',
    Ensure.get(),
    // ServerAuth.requirePermission(E.postCountry),
    // UserAuth.authenticate,
    async (req: Request, res: Response) => {
        try {
            const { timezone } = req.query;
            const conditions: Record<string, any> = {};

            if (timezone) {
                conditions.timezone = timezone;
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
            console.error('❌ Erreur listing pays:', error);
            R.handleError(res, HttpStatus.INTERNAL_ERROR, {
                code: 'listing_failed',
                message: 'Failed to list countries',
            });
        }
    }
);

/**
 * GET /search/iso/:iso - Rechercher par code ISO
 */
router.get(
    '/search/iso/:iso',
    Ensure.get(),
    // ServerAuth.requirePermission(E.postCountry),
    // UserAuth.authenticate,
    async (req: Request, res: Response) => {
        try {
            const { iso } = req.params;

            // Validation du format ISO
            if (!/^[A-Z]{2}$/i.test(iso)) {
                return R.handleError(res, HttpStatus.BAD_REQUEST, {
                    code: 'invalid_iso_format',
                    message: 'ISO code must be exactly 2 letters',
                });
            }

            const country = await Country._load(iso.toUpperCase(), false, false, true);

            if (!country) {
                return R.handleError(res, HttpStatus.NOT_FOUND, {
                    code: 'country_not_found',
                    message: `Country with ISO '${iso.toUpperCase()}' not found`,
                });
            }

            R.handleSuccess(res, country.toJSON());
        } catch (error: any) {
            console.error('❌ Erreur recherche par ISO:', error);
            R.handleError(res, HttpStatus.INTERNAL_ERROR, {
                code: 'search_failed',
                message: 'Failed to search country by ISO',
            });
        }
    }
);

/**
 * GET /search/code/:code - Rechercher par code numérique
 */
router.get(
    '/search/code/:code',
    Ensure.get(),
    // ServerAuth.requirePermission(E.postCountry),
    // UserAuth.authenticate,
    async (req: Request, res: Response) => {
        try {
            const { code } = req.params;

            // Validation du format code
            if (!/^\d+$/.test(code)) {
                return R.handleError(res, HttpStatus.BAD_REQUEST, {
                    code: 'invalid_code_format',
                    message: 'Code must be a positive integer',
                });
            }

            const numericCode = parseInt(code);
            const country = await Country._load(numericCode, false, true, false);

            if (!country) {
                return R.handleError(res, HttpStatus.NOT_FOUND, {
                    code: 'country_not_found',
                    message: `Country with code '${numericCode}' not found`,
                });
            }

            R.handleSuccess(res, country.toJSON());
        } catch (error: any) {
            console.error('❌ Erreur recherche par code:', error);
            R.handleError(res, HttpStatus.INTERNAL_ERROR, {
                code: 'search_failed',
                message: 'Failed to search country by code',
            });
        }
    }
);

/**
 * GET /:identifier - Recherche intelligente par ID, GUID, ISO ou code
 */
router.get(
    '/:identifier',
    Ensure.get(),
    // ServerAuth.requirePermission(E.postCountry),
    // UserAuth.authenticate,
    async (req: Request, res: Response) => {
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

                // Si pas trouvé, essayer par code
                if (!country) {
                    country = await Country._load(numericId, false, true);
                }
            } else if (/^[A-Z]{2}$/i.test(identifier)) {
                // Recherche par ISO
                country = await Country._load(identifier.toUpperCase(), false, false, true);
            }

            if (!country) {
                return R.handleError(res, HttpStatus.NOT_FOUND, {
                    code: 'country_not_found',
                    message: `Country with identifier '${identifier}' not found`,
                });
            }

            R.handleSuccess(res, country.toJSON());
        } catch (error: any) {
            console.error('❌ Erreur recherche pays:', error);
            R.handleError(res, HttpStatus.INTERNAL_ERROR, {
                code: 'search_failed',
                message: 'Failed to search country',
            });
        }
    }
);

// endregion

export default router;
