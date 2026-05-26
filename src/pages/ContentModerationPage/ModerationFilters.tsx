import { Card, Col, Form, Row } from 'react-bootstrap';
import {
	AI_REVIEW_STATUSES,
	type AiReviewRiskLevel,
	type AiReviewStatus,
	type ContentApprovalStatus,
	type ModeratedContentType,
} from '@/utils/contentModeration';
import { APPROVAL_FILTERS, CONTENT_TYPES, RISK_FILTERS } from './constants';

import type { ModerationFiltersProps } from './types';

function formatEnumLabel(value: string): string {
	return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function ModerationFilters(props: ModerationFiltersProps) {
	const {
		contentType,
		setContentType,
		approvalStatus,
		setApprovalStatus,
		aiReviewStatus,
		setAiReviewStatus,
		riskLevel,
		setRiskLevel,
		authorId,
		setAuthorId,
		faceIdText,
		setFaceIdText,
		moderationVersionText,
		setModerationVersionText,
		flagContains,
		setFlagContains,
		minConfidenceText,
		setMinConfidenceText,
		maxConfidenceText,
		setMaxConfidenceText,
		submittedFromUtc,
		setSubmittedFromUtc,
		submittedToUtc,
		setSubmittedToUtc,
		reviewedByUserId,
		setReviewedByUserId,
		minQueueAgeHoursText,
		setMinQueueAgeHoursText,
	} = props;

	const col = { xs: 12, sm: 6, xl: 3 } as const;

	return (
		<Card className="content-moderation-page__filter-card shadow-sm">
			<Card.Body>
				<Form onSubmit={(e) => e.preventDefault()}>
					<Row className="g-3">
						<Col {...col}>
							<Form.Group controlId="moderation-filter-content-type">
								<Form.Label>Content type</Form.Label>
								<Form.Select
									value={contentType}
									onChange={(event) =>
										setContentType(event.target.value as ModeratedContentType | '')
									}
								>
									{CONTENT_TYPES.map((value) => (
										<option key={value || 'all'} value={value}>
											{value || 'All content'}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-approval-status">
								<Form.Label>Approval status</Form.Label>
								<Form.Select
									value={approvalStatus}
									onChange={(event) =>
										setApprovalStatus(event.target.value as ContentApprovalStatus | '')
									}
								>
									{APPROVAL_FILTERS.map((value) => (
										<option key={value || 'all'} value={value}>
											{value ? formatEnumLabel(value) : 'All statuses'}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-ai-status">
								<Form.Label>AI review status</Form.Label>
								<Form.Select
									value={aiReviewStatus}
									onChange={(event) => setAiReviewStatus(event.target.value as AiReviewStatus | '')}
								>
									{AI_REVIEW_STATUSES.map((value) => (
										<option key={value || 'all'} value={value}>
											{value ? formatEnumLabel(value) : 'All AI states'}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-risk-level">
								<Form.Label>AI risk level</Form.Label>
								<Form.Select
									value={riskLevel}
									onChange={(event) => setRiskLevel(event.target.value as AiReviewRiskLevel | '')}
								>
									{RISK_FILTERS.map((value) => (
										<option key={value || 'all'} value={value}>
											{value || 'All risks'}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>

						<Col {...col}>
							<Form.Group controlId="moderation-filter-author-id">
								<Form.Label>Author id</Form.Label>
								<Form.Control
									placeholder="e.g. 42"
									value={authorId}
									onChange={(event) => setAuthorId(event.target.value)}
								/>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-face-id">
								<Form.Label>Face id</Form.Label>
								<Form.Control
									placeholder="e.g. 7"
									value={faceIdText}
									onChange={(event) => setFaceIdText(event.target.value)}
								/>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-moderation-version">
								<Form.Label>Moderation version</Form.Label>
								<Form.Control
									placeholder="e.g. 1"
									value={moderationVersionText}
									onChange={(event) => setModerationVersionText(event.target.value)}
								/>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-flag-contains">
								<Form.Label>Flag contains</Form.Label>
								<Form.Control
									placeholder="Substring match"
									value={flagContains}
									onChange={(event) => setFlagContains(event.target.value)}
								/>
							</Form.Group>
						</Col>

						<Col {...col}>
							<Form.Group controlId="moderation-filter-min-confidence">
								<Form.Label>Min confidence</Form.Label>
								<Form.Control
									placeholder="0–1"
									inputMode="decimal"
									value={minConfidenceText}
									onChange={(event) => setMinConfidenceText(event.target.value)}
								/>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-max-confidence">
								<Form.Label>Max confidence</Form.Label>
								<Form.Control
									placeholder="0–1"
									inputMode="decimal"
									value={maxConfidenceText}
									onChange={(event) => setMaxConfidenceText(event.target.value)}
								/>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-submitted-from">
								<Form.Label>Submitted from (UTC)</Form.Label>
								<Form.Control
									placeholder="2026-01-01T00:00:00Z"
									value={submittedFromUtc}
									onChange={(event) => setSubmittedFromUtc(event.target.value)}
								/>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-submitted-to">
								<Form.Label>Submitted to (UTC)</Form.Label>
								<Form.Control
									placeholder="2026-12-31T23:59:59Z"
									value={submittedToUtc}
									onChange={(event) => setSubmittedToUtc(event.target.value)}
								/>
							</Form.Group>
						</Col>

						<Col {...col}>
							<Form.Group controlId="moderation-filter-reviewer-id">
								<Form.Label>Human reviewer id</Form.Label>
								<Form.Control
									placeholder="User id"
									value={reviewedByUserId}
									onChange={(event) => setReviewedByUserId(event.target.value)}
								/>
							</Form.Group>
						</Col>
						<Col {...col}>
							<Form.Group controlId="moderation-filter-queue-age">
								<Form.Label>Min queue age (hours)</Form.Label>
								<Form.Control
									placeholder="e.g. 24"
									inputMode="numeric"
									value={minQueueAgeHoursText}
									onChange={(event) => setMinQueueAgeHoursText(event.target.value)}
								/>
							</Form.Group>
						</Col>
					</Row>
				</Form>
			</Card.Body>
		</Card>
	);
}
