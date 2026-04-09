import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import BookingsPage from './pages/BookingsPage';
import Finance from './pages/Finance';
import Reports from './pages/Reports';
import VillaManagement from './pages/VillaManagement';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import type { PageName } from './components/Sidebar';
import type { Booking, UserRole, Villa, Unit, PricingRule } from './types';
import { mockBookings, mockUnits, mockVillas, mockUser, mockOwnerUser, mockExpenses, mockPricingRules } from './data/mockData';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('OPERATOR');
  const [activePage, setActivePage] = useState<PageName>('dashboard');
  const [selectedVilla, setSelectedVilla] = useState(mockVillas[0].id);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [villas, setVillas] = useState<Villa[]>(mockVillas);
  const [units, setUnits] = useState<Unit[]>(mockUnits);
  const [expenses] = useState(mockExpenses);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(mockPricingRules);

  const currentUser = userRole === 'OPERATOR' ? mockUser : mockOwnerUser;

  function handleLogin(role: UserRole) {
    setUserRole(role);
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setActivePage('dashboard');
  }

  function handleAddBooking(booking: Booking) {
    setBookings((prev) => [...prev, booking]);
  }

  function handleUpdateBooking(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function handleUpdateVilla(updated: Villa) {
    setVillas((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  }

  function handleUpdateUnit(updated: Unit) {
    setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  function handleUpdatePricingRule(updated: PricingRule) {
    setPricingRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  function handleAddPricingRule(rule: PricingRule) {
    setPricingRules((prev) => [...prev, rule]);
  }

  function handleDeletePricingRule(id: string) {
    setPricingRules((prev) => prev.filter((r) => r.id !== id));
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            bookings={bookings}
            units={units}
            villas={villas}
            selectedVilla={selectedVilla}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case 'availability':
        return (
          <Availability
            bookings={bookings}
            units={units}
            villas={villas}
            selectedVilla={selectedVilla}
            onSelectVilla={setSelectedVilla}
            onAddBooking={handleAddBooking}
            onUpdateBooking={handleUpdateBooking}
            pricingRules={pricingRules}
            isReadOnly={userRole === 'OWNER'}
          />
        );
      case 'bookings':
        return (
          <BookingsPage
            bookings={bookings}
            units={units}
            villas={villas}
            selectedVilla={selectedVilla}
            onUpdateBooking={handleUpdateBooking}
            pricingRules={pricingRules}
            isReadOnly={userRole === 'OWNER'}
          />
        );
      case 'keuangan':
        return (
          <Finance
            bookings={bookings}
            units={units}
            villas={villas}
            selectedVilla={selectedVilla}
            expenses={expenses}
          />
        );
      case 'villa':
        return (
          <VillaManagement
            villas={villas}
            units={units}
            selectedVilla={selectedVilla}
            onUpdateVilla={handleUpdateVilla}
            onUpdateUnit={handleUpdateUnit}
            pricingRules={pricingRules}
            onUpdatePricingRule={handleUpdatePricingRule}
            onAddPricingRule={handleAddPricingRule}
            onDeletePricingRule={handleDeletePricingRule}
          />
        );
      case 'laporan':
        return (
          <Reports
            bookings={bookings}
            units={units}
            villas={villas}
            selectedVilla={selectedVilla}
          />
        );
      case 'pengaturan':
        return <Settings user={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <Layout
      user={currentUser}
      activePage={activePage}
      onNavigate={setActivePage}
      villas={villas}
      selectedVilla={selectedVilla}
      onSelectVilla={setSelectedVilla}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
