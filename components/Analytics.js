import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { db } from '../config/firebase-config';
import { collection, getDocs } from 'firebase/firestore';

export default function Analytics() {
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    const inventoryCollection = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryCollection);
    const data = inventorySnapshot.docs.map(doc => ({
      name: doc.id,
      quantity: doc.data().quantity || 0
    }));
    setInventoryData(data);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Inventory Distribution</Typography>
            <PieChart
              series={[
                {
                  data: inventoryData.map(item => ({ id: item.name, value: item.quantity, label: item.name })),
                },
              ]}
              width={400}
              height={200}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Top 5 Items</Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: inventoryData.slice(0, 5).map(item => item.name) }]}
              series={[{ data: inventoryData.slice(0, 5).map(item => item.quantity) }]}
              width={400}
              height={200}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}