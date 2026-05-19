/**
 * Admin stance B: operator list/create/revoke/resend for pending email-code signups.
 * API status values are lowercase (`pending`, `completed`, …) from the backend.
 */
import { useState } from 'react';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { Container, Button, Form, Row, Col } from 'react-bootstrap';
import { RegistrationInvitesTable } from '@/components/tables/RegistrationInvitesTable';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
	useCreateRegistrationInvite,
	useRegistrationInvitesList,
	useResendRegistrationInviteEmail,
	useRevokeRegistrationInvite,
} from '@/hooks/api/useRegistrationInvitesAdminApi';

export function RegistrationInvitesPage() {
	const { t } = useTranslation('common');
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');

	const [pageIndex, setPageIndex] = useState(0);
	const {
		data,
		isLoading: loading,
		isError,
		error,
	} = useRegistrationInvitesList({
		page: pageIndex + 1,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
		sortBy: 'createdAtUtc',
		sortDir: 'desc',
	});
	const rows = data?.items ?? [];
	const createInvite = useCreateRegistrationInvite();
	const resendInvite = useResendRegistrationInviteEmail();
	const revokeInvite = useRevokeRegistrationInvite();

	const actionBusy = createInvite.isPending || resendInvite.isPending || revokeInvite.isPending;

	const onCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await createInvite.mutateAsync({ email, firstName, lastName });
			toast.success(t('pages.registrationInvites.created'));
			setEmail('');
			setFirstName('');
			setLastName('');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('pages.registrationInvites.createError'));
		}
	};

	const onResend = async (rowEmail: string) => {
		try {
			await resendInvite.mutateAsync(rowEmail);
			toast.success(t('pages.registrationInvites.resent'));
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('pages.registrationInvites.resendError'));
		}
	};

	const onRevoke = async (id: string) => {
		try {
			await revokeInvite.mutateAsync(id);
			toast.success(t('pages.registrationInvites.revoked'));
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('pages.registrationInvites.revokeError'));
		}
	};

	return (
		<div className="registration-invites-page" style={{ padding: '2rem' }}>
			<Container fluid>
				<h1>{t('pages.registrationInvites.title')}</h1>
				<p className="text-muted">{t('pages.registrationInvites.subtitle')}</p>

				{isError && (
					<p className="text-danger">
						{error instanceof Error ? error.message : t('pages.registrationInvites.loadError')}
					</p>
				)}

				<Form onSubmit={(e) => void onCreate(e)} className="mb-4">
					<Row className="g-2 align-items-end">
						<Col md={4}>
							<Form.Label>{t('pages.registrationInvites.email')}</Form.Label>
							<Form.Control
								type="email"
								required
								value={email}
								onChange={(ev) => setEmail(ev.target.value)}
								disabled={actionBusy}
							/>
						</Col>
						<Col md={3}>
							<Form.Label>{t('pages.registrationInvites.firstName')}</Form.Label>
							<Form.Control
								value={firstName}
								onChange={(ev) => setFirstName(ev.target.value)}
								disabled={actionBusy}
							/>
						</Col>
						<Col md={3}>
							<Form.Label>{t('pages.registrationInvites.lastName')}</Form.Label>
							<Form.Control
								value={lastName}
								onChange={(ev) => setLastName(ev.target.value)}
								disabled={actionBusy}
							/>
						</Col>
						<Col md={2}>
							<Button type="submit" variant="primary" className="w-100" disabled={actionBusy}>
								{t('pages.registrationInvites.create')}
							</Button>
						</Col>
					</Row>
				</Form>

				{loading ? (
					<p>{t('pages.registrationInvites.loading')}</p>
				) : (
					<RegistrationInvitesTable
						rows={rows}
						totalCount={data?.totalCount ?? 0}
						totalPages={data?.totalPages ?? 1}
						pageIndex={pageIndex}
						onPageIndexChange={setPageIndex}
						actionBusy={actionBusy}
						onResend={(rowEmail) => void onResend(rowEmail)}
						onRevoke={(id) => void onRevoke(id)}
					/>
				)}
			</Container>
		</div>
	);
}
