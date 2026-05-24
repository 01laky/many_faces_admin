/**
 * App shell — providers, toast host, and router. Route tree lives in `src/routes/AppRoutes.tsx`.
 */
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppBootstrapGate } from './components/AppBootstrapGate';
import { AppRoutes } from './routes';
import './styles/toast.scss';

function App() {
	return (
		<AppProvider>
			<AuthProvider>
				<AppBootstrapGate>
					<BrowserRouter>
						<AppRoutes />
						<ToastContainer
							position="top-center"
							autoClose={5000}
							hideProgressBar={false}
							newestOnTop={false}
							closeOnClick
							rtl={false}
							pauseOnFocusLoss
							draggable
							pauseOnHover
							theme="light"
							limit={5}
						/>
					</BrowserRouter>
				</AppBootstrapGate>
			</AuthProvider>
		</AppProvider>
	);
}

export default App;
