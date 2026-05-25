import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { useAdminGlobalSearch } from '@/hooks/api/useAdminGlobalSearch';
import {
	ADMIN_SEARCH_ENTITY_TYPES,
	ADMIN_SEARCH_LOAD_MORE_THRESHOLD_PX,
	ADMIN_SEARCH_MIN_QUERY_LENGTH,
} from '@/constants/adminGlobalSearchConstants';
import {
	buildAdminSearchDetailPath,
	isAdminSearchHitNavigable,
} from '@/utils/adminSearchDetailPath';
import {
	adminSearchEntityTypeKey,
	pickSearchHighlightLabel,
	renderSafeSearchHighlight,
} from '@/utils/adminSearchHighlight';
import type { AdminSearchHitDto } from '@/api/models/AdminSearchAutocompleteDto';
import './GlobalSearchAutocomplete.scss';

const LISTBOX_ID_SUFFIX = '-listbox';

export function GlobalSearchAutocomplete() {
	const { token } = useAuth();
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const { t } = useTranslation('common');
	const baseId = useId();
	const listboxId = `${baseId}${LISTBOX_ID_SUFFIX}`;

	const [expanded, setExpanded] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const inputRef = useRef<HTMLInputElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	const search = useAdminGlobalSearch({ token, enabled: expanded });

	const collapse = useCallback(() => {
		setExpanded(false);
		setActiveIndex(-1);
		search.reset();
	}, [search]);

	const toggleExpanded = useCallback(() => {
		setExpanded((prev) => {
			if (prev) {
				search.reset();
				setActiveIndex(-1);
				return false;
			}
			return true;
		});
	}, [search]);

	const handleQueryChange = useCallback(
		(value: string) => {
			setActiveIndex(-1);
			search.setQuery(value);
		},
		[search]
	);

	useEffect(() => {
		if (expanded) {
			inputRef.current?.focus();
		}
	}, [expanded]);

	const {
		debouncedQuery,
		hits,
		hasMore,
		status,
		loadMore,
		searchAvailable,
		message,
		query,
		selectedTypes = [],
		toggleEntityType,
	} = search;

	useEffect(() => {
		if (!expanded || !hasMore || status === 'loadingMore') return;
		const sentinel = sentinelRef.current;
		const root = listRef.current?.closest('.global-search__dropdown');
		if (!sentinel || !root) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					loadMore();
				}
			},
			{
				root,
				rootMargin: `0px 0px ${ADMIN_SEARCH_LOAD_MORE_THRESHOLD_PX}px 0px`,
			}
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [expanded, hasMore, status, hits.length, loadMore]);

	const selectHit = useCallback(
		(hit: AdminSearchHitDto) => {
			const path = buildAdminSearchDetailPath(hit.routeParams, getLocalizedPath);
			if (!path) return;
			collapse();
			navigate(path);
		},
		[collapse, getLocalizedPath, navigate]
	);

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			collapse();
			return;
		}

		if (!hits.length) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setActiveIndex((prev) => Math.min(prev + 1, hits.length - 1));
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setActiveIndex((prev) => Math.max(prev - 1, 0));
		} else if (event.key === 'Enter' && activeIndex >= 0) {
			event.preventDefault();
			const hit = hits[activeIndex];
			if (hit && isAdminSearchHitNavigable(hit.routeParams, getLocalizedPath)) {
				selectHit(hit);
			}
		}
	};

	const showDropdown =
		expanded &&
		debouncedQuery.length >= ADMIN_SEARCH_MIN_QUERY_LENGTH &&
		(hits.length > 0 ||
			status === 'loading' ||
			status === 'ready' ||
			status === 'error' ||
			!searchAvailable);

	const isLoading = status === 'loading';
	const queryValid = debouncedQuery.length >= ADMIN_SEARCH_MIN_QUERY_LENGTH;

	return (
		<div className="global-search" data-testid="global-search">
			<button
				type="button"
				className={`global-search__toggle ${expanded ? 'global-search__toggle--active' : ''}`}
				onClick={toggleExpanded}
				aria-label={t('globalSearch.toggle')}
				aria-expanded={expanded}
				aria-controls={expanded ? listboxId : undefined}
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
					<path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
				</svg>
			</button>

			{expanded && (
				<div className="global-search__field-wrap">
					<input
						ref={inputRef}
						type="search"
						className="global-search__input"
						role="combobox"
						aria-expanded={showDropdown}
						aria-controls={showDropdown ? listboxId : undefined}
						aria-autocomplete="list"
						aria-activedescendant={
							activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
						}
						placeholder={t('globalSearch.placeholder')}
						value={query}
						onChange={(event) => handleQueryChange(event.target.value)}
						onKeyDown={handleKeyDown}
						autoComplete="off"
						data-testid="global-search-input"
					/>
					{isLoading && <span className="global-search__spinner" aria-hidden="true" />}

					<div className="global-search__filters" data-testid="global-search-type-filters">
						{ADMIN_SEARCH_ENTITY_TYPES.map((entityType) => {
							const active = selectedTypes.includes(entityType);
							return (
								<button
									key={entityType}
									type="button"
									className={`global-search__filter-chip ${active ? 'global-search__filter-chip--active' : ''}`}
									aria-pressed={active}
									onClick={() => toggleEntityType(entityType)}
								>
									{t(adminSearchEntityTypeKey(entityType), { defaultValue: entityType })}
								</button>
							);
						})}
					</div>

					{showDropdown && (
						<div className="global-search__dropdown">
							{!searchAvailable && (
								<p className="global-search__message global-search__message--error">
									{t('globalSearch.unavailable')}
									{message ? `: ${message}` : ''}
								</p>
							)}

							{searchAvailable && status === 'ready' && hits.length === 0 && (
								<p className="global-search__message">
									{t('globalSearch.noResults', { query: debouncedQuery })}
								</p>
							)}

							{hits.length > 0 && (
								<ul
									ref={listRef}
									id={listboxId}
									className="global-search__list"
									role="listbox"
									aria-busy={status === 'loadingMore'}
								>
									{hits.map((hit, index) => {
										const navigable = isAdminSearchHitNavigable(hit.routeParams, getLocalizedPath);
										const label = pickSearchHighlightLabel(hit);
										return (
											<li key={`${hit.entityType}-${hit.entityId}-${index}`} role="presentation">
												<button
													type="button"
													id={`${listboxId}-option-${index}`}
													role="option"
													aria-selected={index === activeIndex}
													className={`global-search__option ${index === activeIndex ? 'global-search__option--active' : ''} ${!navigable ? 'global-search__option--disabled' : ''}`}
													disabled={!navigable}
													onMouseEnter={() => setActiveIndex(index)}
													onClick={() => navigable && selectHit(hit)}
												>
													<span className="global-search__badge">
														{t(adminSearchEntityTypeKey(hit.entityType), {
															defaultValue: hit.entityType,
														})}
													</span>
													<span className="global-search__label">
														<span className="global-search__title">
															{label.isHtml ? renderSafeSearchHighlight(label.text) : label.text}
														</span>
														{hit.subtitle && (
															<span className="global-search__subtitle">{hit.subtitle}</span>
														)}
													</span>
												</button>
											</li>
										);
									})}
									{hasMore && (
										<li className="global-search__load-more" aria-live="polite">
											{status === 'loadingMore' ? t('globalSearch.loadingMore') : null}
										</li>
									)}
									<li aria-hidden="true">
										<div ref={sentinelRef} className="global-search__sentinel" />
									</li>
								</ul>
							)}

							{searchAvailable && queryValid && status === 'loading' && (
								<p className="global-search__message">{t('globalSearch.loading')}</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
