import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import BookingsPage from './pages/BookingsPage';
import Finance from './pages/Finance';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import type { PageName } from './components/Sidebar';
import type { Booking, UserRole } from './types';
import { mockBookings, mockUnits, mockVillas, mockUser, mockOwnerUser, mockExpenses } from './data/mockData';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <span className="text-3xl">🚧</span>
    </div>
    <h3 className="text-lg font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-sm">Halaman ini sedang dalam pengembangan</p>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('OPERATOR');
  const [activePage, setActivePage] = useState<PageName>('dashboard');
  const [selectedVilla, setSelectedVilla] = useState(mockVillas[0].id);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [expenses] = useState(mockExpenses);

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

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            bookings={bookings}
            units={mockUnits}
            villas={mockVillas}
            selectedVilla={selectedVilla}
            onNavigate={(page) => setActivePage(page)}
          />
        );
      case 'availability':
        return (
          <Availability
            bookings={bookings}
            units={mockUnits}
            villas={mockVillas}
            selectedVilla={selectedVilla}
            onSelectVilla={setSelectedVilla}
            onAddBooking={handleAddBooking}
            onUpdateBooking={handleUpdateBooking}
            isReadOnly={userRole === 'OWNER'}
          />
        );
      case 'bookings':
        return (
          <BookingsPage
            bookings={bookings}
            units={mockUnits}
            villas={mockVillas}
            selectedVilla={selectedVilla}
            onUpdateBooking={handleUpdateBooking}
            isReadOnly={userRole === 'OWNER'}
          />
        );
      case 'keuangan':
        return (
          <Finance
            bookings={bookings}
            units={mockUnits}
            villas={mockVillas}
            selectedVilla={selectedVilla}
            expenses={expenses}
          />
        );
      case 'villa':
        return <PlaceholderPage title="Villa & Unit" />;
      case 'laporan':
        return (
          <Reports
            bookings={bookings}
            units={mockUnits}
            villas={mockVillas}
            selectedVilla={selectedVilla}
          />
        );
      case 'pengaturan':
        return <PlaceholderPage title="Pengaturan" />;
      default:
        return null;
    }
  };

  return (
    <Layout
      user={currentUser}
      activePage={activePage}
      onNavigate={setActivePage}
      villas={mockVillas}
      selectedVilla={selectedVilla}
      onSelectVilla={setSelectedVilla}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
