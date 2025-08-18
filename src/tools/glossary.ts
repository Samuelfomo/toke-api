export default class G {
    static authenticatorMissing = {
        code: 'missing_authentication_keys',
        message: 'Missing authentication keys',
    };
    static serviceIsInitialising = {
        code: 'service_is_initialising',
        message: 'Service is initialising',
    };
    static authenticationFailed = {
        code: 'authentication_failed',
        message: 'Authentication failed!',
    };
    static sectionExpired = { code: 'section_expired', message: 'User section expired!' };
    static clientBlocked = { code: 'authentication_failed', message: 'Client is blocked!' };

    static tokenIsRequired = { code: 'token_is_required', message: 'Token is required' };

    static UUIDGeneratorFailed = { code: 'UUID_generator_failed', message: 'UUID generator failed' };
    static requestBodyRequired = {
        code: 'body_request_required',
        message: 'The body of you requested is required',
    };

    static accessForbidden = {
        code: 'access_forbidden',
        message: 'Client access forbidden',
    };

    static identifierMissing = { code: 'identifier_missing', message: 'identifier is missing' };

    static missingRequired = { code: 'missing_required_fields', message: 'entry is required' };
    static unauthorizedAccess = { code: 'access_unauthorized', message: 'access unauthorized' };
    static savedError = { code: 'data_saved_error', message: 'items not saved' };

    static invalidGuid = {
        code: 'invalid_guid',
        message: 'Invalid GUID provided',
    };

    static referenceRequired = {
        code: 'reference_required',
        message: 'Reference is required and must be in camelCase format',
    };

    static translationRequired = {
        code: 'translation_required',
        message: 'Translation object is required with at least French (fr)',
    };

    static invalidLanguageCode = {
        code: 'invalid_language_code',
        message: 'Invalid language code. Must be ISO 639-1 format',
    };

    static referenceExists = {
        code: 'reference_already_exists',
        message: 'This reference already exists',
    };

    static frenchTranslationRequired = {
        code: 'french_translation_required',
        message: 'French translation is required as default language',
    };

    static lexiconNotFound = {
        code: 'lexicon_not_found',
        message: 'Lexicon entry not found',
    };

    static dataNotFound = {
        code: 'data_not_found',
        message: 'Data entry not found',
    };

    static endpointNotFound = {
        code: 'endpoint_not_found',
        message: 'Endpoint not found',
    };

    static featureNotFound = {
        code: 'feature_not_found',
        message: 'Feature not found',
    };

    static guidGenerationFailed = {
        code: 'guid_generation_failed',
        message: 'Failed to generate unique GUID',
    };

    static metadataValidationFailed = {
        code: 'metadata_validation_failed',
        message: 'Metadata validation failed',
    };
    static positionValidationFailed = {
        code: 'position_validation_failed',
        message: 'Position validation failed',
    };
    static activityValidationFailed = {
        code: 'activity_validation_failed',
        message: 'Activity validation failed',
    };

    static creationFailed = {
        code: 'creation_failed',
        message: 'Creation failed',
    };
    static updateFailed = {
        code: 'update_failed',
        message: 'Update failed',
    };
    static deletionFailed = {
        code: 'deletion_failed',
        message: 'Deletion failed',
    };

    static tableConf = `xf`;
    static tableOp = `pcr`;
    static tableAp = 'xa';
}
