'use client'

import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { db } from '../config/firebase-config';
import { collection, getDocs, doc, updateDoc, setDoc, addDoc } from 'firebase/firestore';
import CameraComponent from './CameraComponent';
import { styled } from '@mui/material/styles';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { motion } from 'framer-motion';


// Updated color palette
const darkPalette = {
    primary: {
      main: '#bb86fc', // Light purple
      light: '#e2b8ff',
      dark: '#8858c8',
    },
    secondary: {
      main: '#03dac6', // Teal
      light: '#66fff9',
      dark: '#00a896',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#cf6679',
    },
  };
  
  const lightPalette = {
    primary: {
      main: '#6200ee', // Deep purple
      light: '#9c4dff',
      dark: '#3700b3',
    },
    secondary: {
      main: '#03dac6', // Teal
      light: '#66fff9',
      dark: '#00a896',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#121212',
      secondary: '#6e6e6e',
    },
  };
  const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    background: theme.palette.background.paper,
  }));
  
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
  }));
  
  const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    padding: '8px 16px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
  }));
  
  const ActionButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }));
  

const AnimatedCard = motion(Card);

export default function Dashboard() {
  const [inventory, setInventory] = useState({});
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCamera, setOpenCamera] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [openNewItemDialog, setOpenNewItemDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const customTheme = createTheme({
    palette: darkMode ? darkPalette : lightPalette,
    typography: {
      fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const inventoryCollection = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryCollection);
    const inventoryData = {};
    inventorySnapshot.forEach((doc) => {
      inventoryData[doc.id] = doc.data().quantity || 0;
    });
    setInventory(inventoryData);
    setLoading(false);
  };

  const updateInventory = async (item, change) => {
    const newQuantity = Math.max(0, (inventory[item] || 0) + change);
    const itemRef = doc(db, 'inventory', item);
    
    if (inventory[item] === undefined) {
      await setDoc(itemRef, { quantity: newQuantity });
    } else {
      await updateDoc(itemRef, { quantity: newQuantity });
    }
    
    setInventory(prev => ({
      ...prev,
      [item]: newQuantity
    }));
  };

  const handleDetection = async (detectedObject) => {
    setOpenCamera(false);
    if (detectedObject !== 'none') {
      await updateInventory(detectedObject, action === 'in' ? 1 : -1);
    } else {
      alert('No valid object detected');
    }
  };

  const addNewItem = async () => {
    if (newItemName.trim() !== '') {
      await updateInventory(newItemName.trim(), 0);
      setNewItemName('');
      setOpenNewItemDialog(false);
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box my={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Inventory Dashboard
            </Typography>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>

          <Grid container spacing={4}>
            {/* Inventory Overview Chart */}
            <Grid item xs={12} md={6}>
              <AnimatedCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">Inventory Overview</Typography>
                  <PieChart
                    series={[
                      {
                        data: Object.entries(inventory).map(([name, quantity]) => ({ id: name, value: quantity, label: name })),
                        innerRadius: 30,
                        paddingAngle: 2,
                        cornerRadius: 5,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30 },
                      },
                    ]}
                    width={500}
                    height={300}
                    colors={[customTheme.palette.primary.main, customTheme.palette.secondary.main, customTheme.palette.error.main]}
                  />
                </CardContent>
              </AnimatedCard>
            </Grid>

            {/* Top Items Chart */}
            <Grid item xs={12} md={6}>
              <AnimatedCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">Top 5 Items</Typography>
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: Object.keys(inventory).slice(0, 5) }]}
                    series={[{ 
                      data: Object.values(inventory).slice(0, 5),
                      color: customTheme.palette.primary.main,
                    }]}
                    width={500}
                    height={300}
                  />
                </CardContent>
              </AnimatedCard>
            </Grid>

            {/* Inventory Table */}
            <Grid item xs={12}>
              <AnimatedCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">Inventory List</Typography>
                  <StyledTableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Item</StyledTableCell>
                          <StyledTableCell align="right">Quantity</StyledTableCell>
                          <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(inventory).map(([item, quantity]) => (
                          <TableRow key={item}>
                            <StyledTableCell component="th" scope="row">
                              {item}
                            </StyledTableCell>
                            <StyledTableCell align="right">{quantity}</StyledTableCell>
                            <StyledTableCell align="right">
                              <ActionButton onClick={() => updateInventory(item, 1)}>
                                <AddIcon />
                              </ActionButton>
                              <ActionButton onClick={() => updateInventory(item, -1)}>
                                <RemoveIcon />
                              </ActionButton>
                            </StyledTableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <StyledButton
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setAction('in');
                setOpenCamera(true);
              }}
            >
              Add to Inventory
            </StyledButton>
            <StyledButton
              variant="contained"
              color="secondary"
              startIcon={<RemoveIcon />}
              onClick={() => {
                setAction('out');
                setOpenCamera(true);
              }}
            >
              Remove from Inventory
            </StyledButton>
            <StyledButton
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewItemDialog(true)}
            >
              Add New Item
            </StyledButton>
          </Box>

          {/* Camera Dialog */}
          <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Capture Image
              <IconButton onClick={() => setOpenCamera(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <CameraComponent onDetection={handleDetection} inventoryItems={Object.keys(inventory)} />
            </DialogContent>
          </Dialog>

          {/* Add New Item Dialog */}
          <Dialog open={openNewItemDialog} onClose={() => setOpenNewItemDialog(false)}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Add New Item
              <IconButton onClick={() => setOpenNewItemDialog(false)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Item Name"
                type="text"
                fullWidth
                variant="standard"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenNewItemDialog(false)}>Cancel</Button>
              <Button onClick={addNewItem}>Add</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </ThemeProvider>
  );
}