import { Container, Row, Col } from 'react-bootstrap';
import { FacesTable } from '../components/FacesTable';
import './FacesPage.scss';

export function FacesPage() {
	return (
		<div
			className="faces-page-wrapper"
			style={{
				padding: '2rem',
			}}
		>
			<Container fluid className="h-100 p-0">
				<Row className="h-100 g-0">
					<Col xs={12} className="d-flex flex-column">
						<FacesTable />
					</Col>
				</Row>
			</Container>
		</div>
	);
}
