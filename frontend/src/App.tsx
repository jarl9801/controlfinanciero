import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Payables from './pages/Payables';
import Receivables from './pages/Receivables';
import CostCenters from './pages/CostCenters';
import Projects from './pages/Projects';
import CashFlow from './pages/CashFlow';
import Reports from './pages/Reports';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="payables" element={<Payables />} />
          <Route path="receivables" element={<Receivables />} />
          <Route path="cost-centers" element={<CostCenters />} />
          <Route path="projects" element={<Projects />} />
          <Route path="cash-flow" element={<CashFlow />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
