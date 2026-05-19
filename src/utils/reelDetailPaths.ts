export interface ReelFaceRef {
	faceId: number;
	title?: string;
}

/** Picks a face id for reel detail navigation (shared face with user, else first on reel). */
export function resolveReelDetailFaceId(
	row: { faces?: ReelFaceRef[] },
	userFaceIds: number[]
): number {
	const reelFaceIds = row.faces?.map((f) => f.faceId) ?? [];
	const shared = reelFaceIds.find((id) => userFaceIds.includes(id));
	return shared ?? reelFaceIds[0] ?? userFaceIds[0] ?? 0;
}
