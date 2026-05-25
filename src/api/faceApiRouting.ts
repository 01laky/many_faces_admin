/**
 * Admin SPA always uses the admin face URL segment (default "admin"): /admin/api/...
 */

import { env } from '../config/env';

export function isApiPathExemptFromFacePrefix(absPath: string): boolean {
	const p = absPath.split('?')[0].toLowerCase();
	return p.startsWith('/api/oauth2') || p.startsWith('/api/auth');
}

export function pathAlreadyHasFaceApiPrefix(absPath: string): boolean {
	const p = absPath.split('?')[0];
	return /^\/[^/]+\/api(\/|$)/i.test(p);
}

export function prependFaceBeforeApi(absPath: string, facePrefix: string): string {
	const qIdx = absPath.indexOf('?');
	const pathPart = qIdx >= 0 ? absPath.slice(0, qIdx) : absPath;
	const query = qIdx >= 0 ? absPath.slice(qIdx) : '';

	if (!pathPart.startsWith('/api/') && pathPart !== '/api') return absPath;
	if (isApiPathExemptFromFacePrefix(pathPart)) return absPath;
	if (pathAlreadyHasFaceApiPrefix(pathPart)) return absPath;

	const afterApi = pathPart === '/api' ? '' : pathPart.slice('/api'.length);
	return `/${facePrefix}/api${afterApi}${query}`;
}

export function prependFaceBeforeHubs(absPath: string, facePrefix: string): string {
	const qIdx = absPath.indexOf('?');
	const pathPart = qIdx >= 0 ? absPath.slice(0, qIdx) : absPath;
	const query = qIdx >= 0 ? absPath.slice(qIdx) : '';

	if (!pathPart.startsWith('/hubs/') && pathPart !== '/hubs') return absPath;
	if (/^\/[^/]+\/hubs(\/|$)/i.test(pathPart)) return absPath;

	const after = pathPart === '/hubs' ? '' : pathPart.slice('/hubs'.length);
	return `/${facePrefix}/hubs${after}${query}`;
}

function prependFaceScopeToRelativePath(rel: string, facePrefix: string): string {
	const withApi = prependFaceBeforeApi(rel, facePrefix);
	if (withApi !== rel) return withApi;
	return prependFaceBeforeHubs(rel, facePrefix);
}

export function applyFacePrefixToRequestUrl(
	url: string,
	facePrefix: string,
	apiBaseUrl: string
): string {
	const base = apiBaseUrl.replace(/\/$/, '');
	if (url.startsWith('http://') || url.startsWith('https://')) {
		if (!url.startsWith(base)) return url;
		const rest = url.slice(base.length);
		const rel = rest.startsWith('/') ? rest : `/${rest}`;
		return base + prependFaceScopeToRelativePath(rel, facePrefix);
	}
	return prependFaceScopeToRelativePath(url, facePrefix);
}

export function scopePathForCurrentFace(path: string): string {
	const face = env.defaultFacePrefix;
	const rel = path.startsWith('/') ? path : `/${path}`;
	const withApi = prependFaceBeforeApi(rel, face);
	if (withApi !== rel) return withApi;
	return prependFaceBeforeHubs(rel, face);
}

export function absoluteScopedUrl(path: string): string {
	return `${env.apiUrl.replace(/\/$/, '')}${scopePathForCurrentFace(path)}`;
}

/** Same as {@link scopePathForCurrentFace} but pinned to the `public` face (anonymous-safe API routes). */
export function scopePathForPublicFace(path: string): string {
	const rel = path.startsWith('/') ? path : `/${path}`;
	const withApi = prependFaceBeforeApi(rel, 'public');
	if (withApi !== rel) return withApi;
	return prependFaceBeforeHubs(rel, 'public');
}

export function absolutePublicFaceUrl(path: string): string {
	return `${env.apiUrl.replace(/\/$/, '')}${scopePathForPublicFace(path)}`;
}
