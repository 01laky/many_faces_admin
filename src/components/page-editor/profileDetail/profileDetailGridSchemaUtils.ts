import { DEFAULT_PROFILE_DETAIL_GRID_SCHEMA } from './defaultProfileDetailSchema';
import type { ProfileDetailGridSchema } from './profileDetailGridTypes';

export function parseProfileDetailGridSchema(
	json: string | null | undefined
): ProfileDetailGridSchema {
	if (!json) {
		return DEFAULT_PROFILE_DETAIL_GRID_SCHEMA;
	}

	try {
		return JSON.parse(json) as ProfileDetailGridSchema;
	} catch {
		// Broken persisted JSON should not make the edit page unusable. The backend
		// still validates on save, but the admin needs a known-good layout to recover.
		return DEFAULT_PROFILE_DETAIL_GRID_SCHEMA;
	}
}

export function serializeProfileDetailGridSchema(
	schema: ProfileDetailGridSchema | null | undefined
): string {
	// If the editor has not emitted a value yet, save the default template rather
	// than `{ "schemaVersion": 1 }`, which the backend correctly rejects because
	// it has no `items` array.
	return JSON.stringify({
		...(schema ?? DEFAULT_PROFILE_DETAIL_GRID_SCHEMA),
		schemaVersion: 1,
	});
}
