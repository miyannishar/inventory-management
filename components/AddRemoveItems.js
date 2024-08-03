import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { db } from '../config/firebase-config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export default function AddRemoveItems() {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (itemName && quantity) {
      const itemRef = doc(db, 'inventory', itemName);
      try {
        await setDoc(itemRef, { quantity: parseInt(quantity) }, { merge: true });
        setItemName('');
        setQuantity('');
        alert('Item updated successfully');
      } catch (error) {
        console.error('Error updating document: ', error);
        alert('Error updating item');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Add/Remove Items
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="itemName"
          label="Item Name"
          name="itemName"
          autoFocus
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="quantity"
          label="Quantity"
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Update Item
        </Button>
      </Box>
    </Container>
  );
}