import { Request, Response, Router } from 'express';

import TaxRule from '../class/TaxRule';
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
 * GET / - Exporter toutes les règles fiscales
 */
router.get('/', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const taxRules = await TaxRule.exportable(paginationOptions);
    R.handleSuccess(res, { taxRules });
  } catch (error: any) {
    console.error('⚠️ Erreur export règles fiscales:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'export_failed',
      message: 'Failed to export tax rules',
    });
  }
});

/**
 * GET /revision - Récupérer uniquement la révision actuelle
 */
router.get('/revision', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const revision = await Revision.getRevision(TS.TAX_RULE);

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
 * GET /active/:status - Lister les règles fiscales par statut actif/inactif
 */
router.get('/active/:status', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const isActive = status.toLowerCase() === 'true' || status === '1';

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const taxRulesData = await TaxRule._listByActiveStatus(isActive, paginationOptions);
    const taxRules = {
      active: isActive,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || taxRulesData?.length,
        count: taxRulesData?.length || 0,
      },
      items: taxRulesData?.map((taxRule) => taxRule.toJSON()) || [],
    };

    R.handleSuccess(res, { taxRules });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par statut:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'status_search_failed',
      message: `Failed to search tax rules by status: ${req.params.status}`,
    });
  }
});

// endregion

// region ROUTES CRUD

/**
 * POST / - Créer une nouvelle règle fiscale
 */
router.post('/', Ensure.post(), async (req: Request, res: Response) => {
  try {
    const {
      country_code,
      tax_type,
      tax_name,
      tax_rate,
      applies_to,
      required_tax_number,
      effective_date,
      expiry_date,
      active
    } = req.body;

    // Validation des champs requis
    if (!country_code) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'country_code_required',
        message: 'Country code is required',
      });
    }

    if (!tax_type) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'tax_type_required',
        message: 'Tax type is required',
      });
    }

    if (!tax_name) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'tax_name_required',
        message: 'Tax name is required',
      });
    }

    if (tax_rate === undefined || tax_rate === null) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'tax_rate_required',
        message: 'Tax rate is required',
      });
    }

    if (!applies_to) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'applies_to_required',
        message: 'Applies to field is required',
      });
    }

    const taxRule = new TaxRule()
      .setCountryCode(country_code)
      .setTaxType(tax_type)
      .setTaxName(tax_name)
      .setTaxRate(tax_rate)
      .setAppliesTo(applies_to);

    if (required_tax_number !== undefined) {
      taxRule.setRequiredTaxNumber(Boolean(required_tax_number));
    }

    if (effective_date) {
      taxRule.setEffectiveDate(new Date(effective_date));
    }

    if (expiry_date) {
      taxRule.setExpiryDate(new Date(expiry_date));
    }

    if (active !== undefined) {
      taxRule.setActive(Boolean(active));
    }

    await taxRule.save();

    console.log(`✅ Règle fiscale créée: ${country_code} - ${tax_type} (GUID: ${taxRule.getGuid()})`);
    R.handleCreated(res, taxRule.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur création règle fiscale:', error.message);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'tax_rule_already_exists',
        message: error.message,
      });
    } else if (error.message.includes('rate') || error.message.includes('date')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_data',
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
 * PUT /:guid - Modifier une règle fiscale par GUID
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
    const taxRule = await TaxRule._load(guid, true);
    if (!taxRule) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tax_rule_not_found',
        message: 'Tax rule not found',
      });
    }

    const {
      country_code,
      tax_type,
      tax_name,
      tax_rate,
      applies_to,
      required_tax_number,
      effective_date,
      expiry_date,
      active
    } = req.body;

    // Mise à jour des champs fournis
    if (country_code !== undefined) taxRule.setCountryCode(country_code);
    if (tax_type !== undefined) taxRule.setTaxType(tax_type);
    if (tax_name !== undefined) taxRule.setTaxName(tax_name);
    if (tax_rate !== undefined) taxRule.setTaxRate(tax_rate);
    if (applies_to !== undefined) taxRule.setAppliesTo(applies_to);
    if (required_tax_number !== undefined) taxRule.setRequiredTaxNumber(Boolean(required_tax_number));
    if (effective_date !== undefined) taxRule.setEffectiveDate(new Date(effective_date));
    if (expiry_date !== undefined) taxRule.setExpiryDate(new Date(expiry_date));
    if (active !== undefined) taxRule.setActive(Boolean(active));

    await taxRule.save();

    console.log(`✅ Règle fiscale modifiée: GUID ${guid}`);
    R.handleSuccess(res, taxRule.toJSON());
  } catch (error: any) {
    console.error('⚠️ Erreur modification règle fiscale:', error);

    if (error.message.includes('already exists')) {
      R.handleError(res, HttpStatus.CONFLICT, {
        code: 'tax_rule_already_exists',
        message: error.message,
      });
    } else if (error.message.includes('rate') || error.message.includes('date')) {
      R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_data',
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
 * DELETE /:guid - Supprimer une règle fiscale par GUID
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
    const taxRule = await TaxRule._load(guid, true);
    if (!taxRule) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tax_rule_not_found',
        message: 'Tax rule not found',
      });
    }

    const deleted = await taxRule.delete();

    if (deleted) {
      console.log(
        `✅ Règle fiscale supprimée: GUID ${guid} (${taxRule.getCountryCode()} - ${taxRule.getTaxType()})`,
      );
      R.handleSuccess(res, {
        message: 'Tax rule deleted successfully',
        guid: guid,
        country_code: taxRule.getCountryCode(),
        tax_type: taxRule.getTaxType(),
      });
    } else {
      R.handleError(res, HttpStatus.INTERNAL_ERROR, G.savedError);
    }
  } catch (error: any) {
    console.error('⚠️ Erreur suppression règle fiscale:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'deletion_failed',
      message: error.message,
    });
  }
});

// endregion

// region ROUTES UTILITAIRES

/**
 * GET /list - Lister toutes les règles fiscales (pour admin)
 */
router.get('/list', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    const conditions: Record<string, any> = {};

    if (active !== undefined) {
      conditions.active = active === 'true' || active === '1';
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);

    const taxRuleEntries = await TaxRule._list(conditions, paginationOptions);
    const taxRules = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || taxRuleEntries?.length,
        count: taxRuleEntries?.length || 0,
      },
      items: taxRuleEntries?.map((taxRule) => taxRule.toJSON()) || [],
    };

    R.handleSuccess(res, { taxRules });
  } catch (error: any) {
    console.error('⚠️ Erreur listing règles fiscales:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'listing_failed',
      message: 'Failed to list tax rules',
    });
  }
});

/**
 * GET /search/country/:code - Rechercher par code pays
 */
router.get('/search/country/:code', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Validation du format de code pays (ISO 3166-1)
    if (!/^[A-Z]{2,3}$/i.test(code)) {
      return R.handleError(res, HttpStatus.BAD_REQUEST, {
        code: 'invalid_country_code_format',
        message: 'Country code must be 2 or 3 letters (ISO 3166-1)',
      });
    }

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);
    const taxRulesData = await TaxRule._listByCountryCode(code.toUpperCase(), paginationOptions);

    if (!taxRulesData || taxRulesData.length === 0) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tax_rules_not_found',
        message: `No tax rules found for country code '${code.toUpperCase()}'`,
      });
    }

    const taxRules = {
      country_code: code.toUpperCase(),
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || taxRulesData.length,
        count: taxRulesData.length,
      },
      items: taxRulesData.map((taxRule) => taxRule.toJSON()),
    };

    R.handleSuccess(res, { taxRules });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par code pays:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search tax rules by country code',
    });
  }
});

/**
 * GET /search/type/:type - Rechercher par type de taxe
 */
router.get('/search/type/:type', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);
    const taxRulesData = await TaxRule._listByTaxType(type, paginationOptions);

    if (!taxRulesData || taxRulesData.length === 0) {
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tax_rules_not_found',
        message: `No tax rules found for tax type '${type}'`,
      });
    }

    const taxRules = {
      tax_type: type,
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || taxRulesData.length,
        count: taxRulesData.length,
      },
      items: taxRulesData.map((taxRule) => taxRule.toJSON()),
    };

    R.handleSuccess(res, { taxRules });
  } catch (error: any) {
    console.error('⚠️ Erreur recherche par type:', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search tax rules by type',
    });
  }
});

/**
 * GET /search/applies-to/:value - Rechercher par champ "applies_to"
 */
router.get('/search/applies-to/:value', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { value } = req.params;

    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);
    const taxRulesData = await TaxRule._listByAppliesTo(value, paginationOptions);

    if (!taxRulesData || taxRulesData.length === 0){
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tax_rules_not_found',
        message: `No tax rules found for applies_to '${value}'`,
      });
    }
    const taxRules = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || taxRulesData.length,
        count: taxRulesData.length,
      },
      items: taxRulesData.map((taxRule) => taxRule.toJSON()),
    };

    return R.handleSuccess(res, {taxRules});
    // return R.handleSuccess(res, taxRulesData.map((taxRule) => taxRule.toJSON()));
    } catch (error: any){
    console.error('error', error);
    R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search tax rules by applies_to',
    });
  }
});

/**
 * GET /search/tax-number-required/:value - Rechercher
 */
router.get('/search/tax-number-required/:value', Ensure.get(), async (req: Request, res: Response) => {
  try {
    const { value } = req.params;
    const required = value.toLowerCase() === 'true' || value === '1';
    const paginationOptions = await ExtractQueryParams.extractPaginationFromQuery(req.query);
    const taxRulesData = await TaxRule._listByRequiredTaxNumber(required, paginationOptions);
    if (!taxRulesData || taxRulesData.length === 0){
      return R.handleError(res, HttpStatus.NOT_FOUND, {
        code: 'tax_rules_not_found',
        message: `No tax rules found for required_tax_number '${value}'`,
      });
    }
    const taxRules = {
      pagination: {
        offset: paginationOptions.offset || 0,
        limit: paginationOptions.limit || taxRulesData.length,
        count: taxRulesData.length,
      },
      items: taxRulesData.map((taxRule) => taxRule.toJSON()),
    }
    return R.handleSuccess(res, {taxRules});
  } catch (error: any) {
    console.error('error', error)
    return R.handleError(res, HttpStatus.INTERNAL_ERROR, {
      code: 'search_failed',
      message: 'Failed to search tax rules by required_tax_number',
    });
  }
})

// router.get('/:identifier', Ensure.get(), async (req: Request, res: Response) => {
//   try {
//     const { identifier } = req.params;
//
//   } catch (error: any){
//
//   }
// }
// )

export default router;