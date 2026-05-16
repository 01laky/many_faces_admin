/**
 * Admin stance B: operator list/create/revoke/resend for pending email-code signups.
 * API status values are lowercase (`pending`, `completed`, …) from the backend.
 */
import { useCallback, useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import {
	createRegistrationInvite,
	listRegistrationInvites,
	revokeRegistrationInvite,
	resendRegistrationInviteEmail,
	type RegistrationInviteRow,
} from '../api/services/registrationInvitesAdminApi';

export function RegistrationInvitesPage() {
	const { t } = useTranslation('common');
	const { token } = useAuth();
	const [rows, setRows] = useState<RegistrationInviteRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');

	const load = useCallback(async () => {
		if (!token) return;
		setLoading(true);
		try {
			const data = await listRegistrationInvites(token);
			setRows(data);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : t('pages.registrationInvites.loadError'));
		} finally {
			setLoading(false);
		}
	}, [token, t]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- bootstrap table when token is ready
		void load();
	}, [load]);

	const onCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!token) return;
		try {
			await createRegistrationInvite(token, { email, firstName, lastName });
			toast.success(t('pages.registrationInvites.created'));
			setEmail('');
			setFirstName('');
			setLastName('');
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('pages.registrationInvites.createError'));
		}
	};

	const onResend = async (rowEmail: string) => {
		if (!token) return;
		try {
			await resendRegistrationInviteEmail(token, rowEmail);
			toast.success(t('pages.registrationInvites.resent'));
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('pages.registrationInvites.resendError'));
		}
	};

	const onRevoke = async (id: string) => {
		if (!token) return;
		try {
			await revokeRegistrationInvite(token, id);
			toast.success(t('pages.registrationInvites.revoked'));
			await load();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t('pages.registrationInvites.revokeError'));
		}
	};

	return (
		<div className="registration-invites-page" style={{ padding: '2rem' }}>
			<Container fluid>
				<h1>{t('pages.registrationInvites.title')}</h1>
				<p className="text-muted">{t('pages.registrationInvites.subtitle')}</p>

				<Form onSubmit={(e) => void onCreate(e)} className="mb-4">
					<Row className="g-2 align-items-end">
						<Col md={4}>
							<Form.Label>{t('pages.registrationInvites.email')}</Form.Label>
							<Form.Control
								type="email"
								required
								value={email}
								onChange={(ev) => setEmail(ev.target.value)}
							/>
						</Col>
						<Col md={3}>
							<Form.Label>{t('pages.registrationInvites.firstName')}</Form.Label>
							<Form.Control value={firstName} onChange={(ev) => setFirstName(ev.target.value)} />
						</Col>
						<Col md={3}>
							<Form.Label>{t('pages.registrationInvites.lastName')}</Form.Label>
							<Form.Control value={lastName} onChange={(ev) => setLastName(ev.target.value)} />
						</Col>
						<Col md={2}>
							<Button type="submit" variant="primary" className="w-100">
								{t('pages.registrationInvites.create')}
							</Button>
						</Col>
					</Row>
				</Form>

				{loading ? (
					<p>{t('pages.registrationInvites.loading')}</p>
				) : (
					<Table striped bordered hover responsive>
						<thead>
							<tr>
								<th>{t('pages.registrationInvites.email')}</th>
								<th>{t('pages.registrationInvites.status')}</th>
								<th>{t('pages.registrationInvites.expires')}</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.id}>
									<td>{row.email}</td>
									<td>
										<Badge bg={row.status === 'Pending' ? 'warning' : 'secondary'}>
											{row.status}
										</Badge>
									</td>
									<td>{new Date(row.expiresAtUtc).toLocaleString()}</td>
									<td>
										{row.status === 'pending' ? (
											<>
												<Button
													size="sm"
													variant="outline-secondary"
													className="me-2"
													onClick={() => void onResend(row.email)}
												>
													{t('pages.registrationInvites.resend')}
												</Button>
												<Button
													size="sm"
													variant="outline-danger"
													onClick={() => void onRevoke(row.id)}
												>
													{t('pages.registrationInvites.revoke')}
												</Button>
											</>
										) : null}
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				)}
			</Container>
		</div>
	);
}
