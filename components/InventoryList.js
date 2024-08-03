import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { db } from '../config/firebase-config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function InventoryList() {
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);

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
    const newQuantity = Math.max(0, inventory[item] + change);
    const itemRef = doc(db, 'inventory', item);
    await updateDoc(itemRef, { quantity: newQuantity });
    setInventory(prev => ({
      ...prev,
      [item]: newQuantity
    }));
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Inventory List
      </Typography>
      <TableContainer component={Paper}>
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
    </Container>
  );
}