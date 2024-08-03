import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon /> },
  { text: 'Inventory', icon: <InventoryIcon /> },
  { text: 'Add/Remove', icon: <AddCircleIcon /> },
  { text: 'Analytics', icon: <AnalyticsIcon /> },
  { text: 'Settings', icon: <SettingsIcon /> },
];

export default function Sidebar({ open, onClose, onPageChange }) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <List sx={{ width: 250 }}>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => onPageChange(item.text)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}