import { Toaster } from 'react-hot-toast';
import BackendWarmup from './components/BackendWarmup';
import AppRoutes from './routes/AppRoutes';
import { ReelVideoProvider } from './context/ReelVideoContext';
import './App.css';

function App() {

  return (
    <>
      <BackendWarmup />
      <Toaster position="top-center" reverseOrder={false} />
      <ReelVideoProvider>
        <AppRoutes />
      </ReelVideoProvider>
    </>
  )
}

export default App
