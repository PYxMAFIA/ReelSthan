import { Toaster } from 'react-hot-toast';
import BackendWarmup from './components/BackendWarmup';
import AppRoutes from './routes/appRoutes';
import './App.css';

function App() {

  return (
    <>
      <BackendWarmup />
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </>
  )
}

export default App
