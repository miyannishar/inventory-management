import { Container, Typography, Paper, List, ListItem, ListItemText, Switch } from '@mui/material';
import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoUpdate: true,
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Paper>
        <List>
          {Object.entries(settings).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText primary={key.charAt(0).toUpperCase() + key.slice(1)} />
              <Switch
                edge="end"
                onChange={() => handleToggle(key)}
                checked={value}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}