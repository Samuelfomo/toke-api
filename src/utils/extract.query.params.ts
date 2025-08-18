export default class ExtractQueryParams {
    public static async extractPaginationFromQuery(
        query: any
    ): Promise<{ offset?: number; limit?: number }> {
        const pagination: { offset?: number; limit?: number } = {};

        if (query.offset !== undefined) {
            const offset = parseInt(query.offset as string, 10);
            if (!isNaN(offset) && offset >= 0) {
                pagination.offset = offset;
            }
        }

        if (query.limit !== undefined) {
            const limit = parseInt(query.limit as string, 10);
            if (!isNaN(limit) && limit > 0 && limit <= 1000) {
                // Limite max pour éviter les abus
                pagination.limit = limit;
            }
        }

        return pagination;
    }
}
