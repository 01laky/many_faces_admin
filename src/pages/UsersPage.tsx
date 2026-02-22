import { Container } from 'react-bootstrap';
import { UsersTable } from '../components/UsersTable';
import './UsersPage.scss';

export function UsersPage() {
	return (
		<div
			className="users-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid className="h-100 p-0">
				<div className="users-page-content">
					<UsersTable />
				</div>
			</Container>
		</div>
	);
}
