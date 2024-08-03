'use client'

import { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Dashboard from '../components/Dashboard';
import InventoryList from '../components/InventoryList';
import AddRemoveItems from '../components/AddRemoveItems';
import Analytics from '../components/Analytics';
import Settings from '../components/Settings';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handlePageChange = (pageName) => {
    setCurrentPage(pageName);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* <TopBar toggleDrawer={toggleDrawer} /> */}
      {/* <Sidebar open={drawerOpen} onClose={toggleDrawer(false)} onPageChange={handlePageChange} /> */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {currentPage === 'Dashboard' && <Dashboard />}
        {currentPage === 'Inventory' && <InventoryList />}
        {currentPage === 'Add/Remove' && <AddRemoveItems />}
        {currentPage === 'Analytics' && <Analytics />}
        {currentPage === 'Settings' && <Settings />}
      </Box>
    </Box>
  );
}