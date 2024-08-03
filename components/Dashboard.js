'use client'

import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
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
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { db } from '../config/firebase-config';
import { collection, getDocs, doc, updateDoc, setDoc, addDoc } from 'firebase/firestore';
import CameraComponent from './CameraComponent';
// ... (rest of the Dashboard component code remains the same as in the previous version)

export default function Dashboard() {
    const [inventory, setInventory] = useState({});
    const [action, setAction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openCamera, setOpenCamera] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [openNewItemDialog, setOpenNewItemDialog] = useState(false);
  
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
  
    // if (loading) {
    //   return (
    //     <Container maxWidth="md">
    //       <Box my={4} display="flex" justifyContent="center">
    //         <CircularProgress />
    //       </Box>
    //     </Container>
    //   );
    // }
  
    return (
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Management
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(inventory).map(([item, quantity]) => (
                  <TableRow key={item}>
                    <TableCell component="th" scope="row">
                      {item}
                    </TableCell>
                    <TableCell align="right">{quantity}</TableCell>
                    <TableCell align="right">
                      <Button onClick={() => updateInventory(item, 1)}>+</Button>
                      <Button onClick={() => updateInventory(item, -1)}>-</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
  
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => {
                  setAction('in');
                  setOpenCamera(true);
                }}
              >
                Add to Inventory
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<RemoveIcon />}
                onClick={() => {
                  setAction('out');
                  setOpenCamera(true);
                }}
              >
                Remove from Inventory
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="info" 
                startIcon={<AddIcon />}
                onClick={() => setOpenNewItemDialog(true)}
              >
                Add New Item
              </Button>
            </Grid>
          </Grid>
  
          <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md" fullWidth>
            <DialogTitle>Capture Image</DialogTitle>
            <DialogContent>
              <CameraComponent onDetection={handleDetection} inventoryItems={Object.keys(inventory)} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCamera(false)}>Close</Button>
            </DialogActions>
          </Dialog>
  
          <Dialog open={openNewItemDialog} onClose={() => setOpenNewItemDialog(false)}>
            <DialogTitle>Add New Item</DialogTitle>
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
    );
  }