/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlbumTypeEnum } from './AlbumTypeEnum';
import type { MediaTypeEnum } from './MediaTypeEnum';
export type CreateAlbumDto = {
	title?: string | null;
	description?: string | null;
	albumType?: AlbumTypeEnum;
	mediaType?: MediaTypeEnum;
	faceIds?: Array<number> | null;
};
