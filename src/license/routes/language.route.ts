import { Request, Response, Router } from 'express';

import Language from '../class/Language';
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
 * GET / - Exporter toutes les langues
 */
router.get('/', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const languages = await Language.exportable(paginationOptions);
    R.handleSuccess(res, { languages });
  } catch (error: any) {
    console.error('⚠️ Erreur export langues:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'export_failed',
      message: 'Failed to export languages',
    });
  }
});

/**
 * GET /revision - Récupérer uniquement la révision actuelle
 */
router.get('/revision', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const revision = await Revision.getRevision(TS.LANGUAGE);

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
 * GET /active/:status - Lister les langues par statut actif/inactif
 */
router.get('/active/:status', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const isActive = status.toLowerCase() === 'true' || status === '1';

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const languagesData = await Language._listByActiveStatus(isActive, paginationOptions);
    const languages = {
      active: isActive,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || languagesData?.length,
        count: languagesData?.length || 0,
      },
      items: languagesData?.map((language) => language.toJSON()) || [],
    };

    R.handleSuccess(res, { languages });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par statut:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'status_search_failed',
      message: `Failed to search languages by status: ${req.params.status}`,
    });
  }
});

// endregion

// region ROUTES CRUD

/**
 * POST / - Créer une nouvelle langue
 */
router.post('/', Ensure.post(), async (req: Request, res: Response) => {
  try {
    const { code, name_en, name_local, active } = req.body;

    // Validation des champs requis
    if (!code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'code_required',
        message: 'Language code (ISO 639-1) is required',
      });
    }

    if (!name_en) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'name_en_required',
        message: 'English language name is required',
      });
    }

    if (!name_local) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'name_local_required',
        message: 'Local language name is required',
      });
    }

    const language = new Language()
      .setCode(code)
      .setNameEn(name_en)
      .setLocalName(name_local);

    if (active !== undefined) language.setActive(Boolean(active));

    await language.save();

    console.log(`✅ Langue créée: ${code} - ${name_en} (GUID: ${language.getGuid()})`);
    R.handleCreated(res, language.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur création langue:', error.message);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'language_already_exists',
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
 * PUT /:guid - Modifier une langue par GUID
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
    const language = await Language._load(guid, true);
    if (!language) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'language_not_found',
        message: 'Language not found',
      });
    }

    const { code, name_en, name_local, active } = req.body;

    // Mise à jour des champs fournis
    if (code !== undefined) language.setCode(code);
    if (name_en !== undefined) language.setNameEn(name_en);
    if (name_local !== undefined) language.setLocalName(name_local);
    if (active !== undefined) language.setActive(Boolean(active));

    await language.save();

    console.log(`✅ Langue modifiée: GUID ${guid}`);
    R.handleSuccess(res, language.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur modification langue:', error);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'language_already_exists',
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
 * DELETE /:guid - Supprimer une langue par GUID
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
    const language = await Language._load(guid, true);
    if (!language) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'language_not_found',
        message: 'Language not found',
      });
    }

    const deleted = await language.delete();

    if (deleted) {
      console.log(
        `✅ Langue supprimée: GUID ${guid} (${language.getCode()} - ${language.getNameEn()})`,
      );
      R.handleSuccess(res, {
        message: 'Language deleted successfully',
        guid: guid,
        code: language.getCode(),
        name_en: language.getNameEn(),
      });
    } else {
      R.handleError(res, HttpStatus.INTERNAL_ERROR, G.savedError);
    }
  } catch (error: any) {
    console.error('⚠️ Erreur suppression langue:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'deletion_failed',
      message: error.message,
    });
  }
});

// endregion

// region ROUTES UTILITAIRES

/**
 * GET /list - Lister toutes les langues (pour admin)
 */
router.get('/list', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    const conditions: Record<string, any> = {};

    if (active !== undefined) {
      conditions.active = active === 'true' || active === '1';
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const languageEntries = await Language._list(conditions, paginationOptions);
    const languages = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || languageEntries?.length,
        count: languageEntries?.length || 0,
      },
      items: languageEntries?.map((language) => language.toJSON()) || [],
    };

    R.handleSuccess(res, { languages });
  } catch (error: any) {
    console.error('⚠️ Erreur listing langues:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'listing_failed',
      message: 'Failed to list languages',
    });
  }
});

/**
 * GET /search/code/:code - Rechercher par code ISO 639-1
 */
router.get('/search/code/:code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Validation du format ISO 639-1 (2 lettres)
    if (!/^[A-Z]{2}$/i.test(code)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_code_format',
        message: 'Language code must be exactly 2 letters (ISO 639-1)',
      });
    }

    const language = await Language._load(code.toUpperCase(), false, true);

    if (!language) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'language_not_found',
        message: `Language with code '${code.toUpperCase()}' not found`,
      });
    }

    R.handleSuccess(res, language.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par code:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search language by code',
    });
  }
});

/**
 * GET /:identifier - Recherche intelligente par ID, GUID ou code ISO
 */
router.get('/:identifier', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let language: Language | null = null;

    // Essayer différentes méthodes de recherche selon le format
    if (/^\d+$/.test(identifier)) {
      const numericId = parseInt(identifier);

      // Essayer par ID d'abord
      language = await Language._load(numericId);

      // Si pas trouvé, essayer par GUID
      if (!language) {
        language = await Language._load(numericId, true);
      }
    } else if (/^[A-Z]{2}$/i.test(identifier)) {
      // Recherche par code ISO 639-1
      language = await Language._load(identifier.toUpperCase(), false, true);
    }

    if (!language) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'language_not_found',
        message: `Language with identifier '${identifier}' not found`,
      });
    }

    R.handleSuccess(res, language.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur recherche langue:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search language',
    });
  }
});

// endregion

export default router;