import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import How from './pages/How';
import Crew from './pages/Crew';
import OrganizationChart from './pages/OrganizationChart';
import Dashboard from './pages/Dashboard';
import NotFoundPage from './pages/404';

const App = () => {
  return (
    <main className='font-poppins'>
     <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how" element={<How />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crew" element={<Crew />} />
        <Route path="/organization-chart" element={<OrganizationChart />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
      <Footer/>
    </main>
  );
};

export default App;
