import { normalizeContentBlocks } from '../components/Blocks/Row/normalize';

/**
 * Redux middleware that intercepts content loading and saving.
 * - In-flight deserialization: On GET_CONTENT_SUCCESS, normalizes any legacy columnsBlock or gridBlock to @type: 'row'.
 * - Clean persistence: On content mutation actions, normalizes outgoing block payloads to @type: 'row'.
 */
export const rowMigrationMiddleware =
  (store?: any) => (next: any) => (action: any) => {
    if (!action || typeof action !== 'object') {
      return next(action);
    }

    // Deserialization: Normalizing incoming content from Plone REST API
    if (
      typeof action.type === 'string' &&
      action.type.includes('GET_CONTENT') &&
      action.type.endsWith('_SUCCESS') &&
      action.result?.blocks
    ) {
      const normalized = normalizeContentBlocks(
        action.result.blocks,
        action.result.blocks_layout,
      );
      action.result = {
        ...action.result,
        blocks: normalized.blocks,
        blocks_layout: normalized.blocks_layout,
      };
    }

    // Serialization: Normalizing outgoing payload before saving to Plone REST API
    if (
      typeof action.type === 'string' &&
      (action.type.includes('CREATE_CONTENT') ||
        action.type.includes('UPDATE_CONTENT') ||
        action.type.includes('SAVE_CONTENT')) &&
      action.type.endsWith('_PENDING') &&
      action.request?.data?.blocks
    ) {
      const normalized = normalizeContentBlocks(
        action.request.data.blocks,
        action.request.data.blocks_layout,
      );
      action.request.data = {
        ...action.request.data,
        blocks: normalized.blocks,
        blocks_layout: normalized.blocks_layout,
      };
    }

    return next(action);
  };

export default function installRowMigrationMiddleware(config: any) {
  if (!config.settings.storeExtenders) {
    config.settings.storeExtenders = [];
  }

  config.settings.storeExtenders.push((middlewares: any[]) => [
    rowMigrationMiddleware,
    ...middlewares,
  ]);

  return config;
}
