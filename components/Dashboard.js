"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Switch } from '@mui/material'
import { db } from "../config/firebase-config";
import SearchIcon from "@mui/icons-material/Search";
import {Clear as ClearIcon} from '@mui/icons-material';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import CameraComponent from "./CameraComponent";
import { styled } from "@mui/material/styles";
import { PieChart, BarChart } from "@mui/x-charts";
import { motion } from "framer-motion";
import RecipeSuggestion from "./RecipeSuggestion";


const darkPalette = {
    primary: {
      main: "#bb86fc",
      light: "#e2b8ff",
      dark: "#8858c8",
    },
    secondary: {
      main: "#03dac6",
      light: "#66fff9",
      dark: "#00a896",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    error: {
      main: "#cf6679",
    },
  };
  
  const lightPalette = {
    primary: {
      main: "#6200ee",
      light: "#9c4dff",
      dark: "#3700b3",
    },
    secondary: {
      main: "#03dac6", 
      light: "#66fff9",
      dark: "#00a896",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#121212",
      secondary: "#6e6e6e",
    },
  };
  const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    background: theme.palette.background.paper,
  }));
  
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
  }));
  
  const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    padding: "8px 16px",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
  }));
  
  const ActionButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  }));
  

const AnimatedCard = motion(Card);

export default function Dashboard() {
  const [inventory, setInventory] = useState({});
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCamera, setOpenCamera] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [openNewItemDialog, setOpenNewItemDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    item: null,
  });
  const [openRecipeSuggestion, setOpenRecipeSuggestion] = useState(false);
  const [cameraMode, setCameraMode] = useState('');
  const [searchTerm, setSearchTerm] = useState("");

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
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
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
    const inventoryCollection = collection(db, "inventory");
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
    const itemRef = doc(db, "inventory", item);

    if (inventory[item] === undefined) {
      await setDoc(itemRef, { quantity: newQuantity });
    } else {
      await updateDoc(itemRef, { quantity: newQuantity });
    }

    setInventory((prev) => ({
      ...prev,
      [item]: newQuantity,
    }));
  };

  const deleteItem = async (item) => {
    const itemRef = doc(db, "inventory", item);
    await deleteDoc(itemRef);
    setInventory((prev) => {
      const newInventory = { ...prev };
      delete newInventory[item];
      return newInventory;
    });
    setDeleteConfirmation({ open: false, item: null });
  };

  const handleDetection = async (detectedObject) => {
    setOpenCamera(false);
    if (detectedObject !== 'none') {
      if (cameraMode === 'add_new') {
        await updateInventory(detectedObject, 1);
        setOpenNewItemDialog(false);
      } else {
        await updateInventory(detectedObject, action === 'in' ? 1 : -1);
      }
    } else {
      alert('No valid object detected');
    }
  };

  const handleAddNewItem = async () => {
    if (newItemName.trim()) {
      await updateInventory(newItemName.trim(), 1);
      setNewItemName('');
      setOpenNewItemDialog(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm(''); 
  };

  const filteredInventory = Object.entries(inventory).filter(([item, _]) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box my={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Inventory Dashboard
            </Typography>
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="default"
              inputProps={{ 'aria-label': 'toggle dark mode' }}
            />
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClear}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Grid container spacing={4}>
            {/* Inventory Overview Chart */}
            <Grid item xs={12} md={6}>
              <AnimatedCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary.main">
                    Inventory Overview
                  </Typography>
                  <PieChart
                    series={[
                      {
                        data: Object.entries(inventory).map(
                          ([name, quantity]) => ({
                            id: name,
                            value: quantity,
                            label: name,
                          })
                        ),
                        innerRadius: 30,
                        paddingAngle: 2,
                        cornerRadius: 5,
                        highlightScope: {
                          faded: "global",
                          highlighted: "item",
                        },
                        faded: { innerRadius: 30, additionalRadius: -30 },
                      },
                    ]}
                    width={500}
                    height={300}
                    colors={[
                      customTheme.palette.primary.main,
                      customTheme.palette.secondary.main,
                      customTheme.palette.error.main,
                    ]}
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
                  <Typography variant="h6" gutterBottom color="secondary.main">
                    Top 5 Items
                  </Typography>
                  <BarChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: Object.keys(inventory).slice(0, 5),
                      },
                    ]}
                    series={[
                      {
                        data: Object.values(inventory).slice(0, 5),
                        color: customTheme.palette.primary.main,
                      },
                    ]}
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
                  <Typography variant="h6" gutterBottom color="secondary.main">
                    Inventory List
                  </Typography>
                  <StyledTableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Item</StyledTableCell>
                          <StyledTableCell align="right">
                            Quantity
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            Actions
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredInventory.map(([item, quantity]) => (
                          <TableRow key={item}>
                            <StyledTableCell component="th" scope="row">
                              {item}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {quantity}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <ActionButton
                                onClick={() => updateInventory(item, 1)}
                              >
                                <AddIcon />
                              </ActionButton>
                              <ActionButton
                                onClick={() => updateInventory(item, -1)}
                              >
                                <RemoveIcon />
                              </ActionButton>
                              <ActionButton
                                onClick={() =>
                                  setDeleteConfirmation({ open: true, item })
                                }
                              >
                                <DeleteIcon />
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
                setAction("in");
                setCameraMode("add");
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
                setAction("out");
                setCameraMode("remove");
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
            <StyledButton
              variant="outlined"
              color="primary"
              startIcon={<RestaurantIcon />}
              onClick={() => setOpenRecipeSuggestion(true)}
            >
              Suggest Recipe
            </StyledButton>
          </Box>

          {/* Camera Dialog */}
          <Dialog
            open={openCamera}
            onClose={() => setOpenCamera(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Capture Image
              <IconButton onClick={() => setOpenCamera(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <CameraComponent
                onDetection={handleDetection}
                inventoryItems={Object.keys(inventory)}
                mode={cameraMode}
              />
            </DialogContent>
          </Dialog>

          {/* Add New Item Dialog */}
          <Dialog
            open={openNewItemDialog}
            onClose={() => setOpenNewItemDialog(false)}
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Add New Item
              <IconButton onClick={() => setOpenNewItemDialog(false)}>
                <CloseIcon />
              </IconButton>
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
              <Button onClick={() => setOpenNewItemDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewItem}>Add</Button>
              <Button
                onClick={() => {
                  setCameraMode('add_new');
                  setOpenCamera(true);
                }}
                startIcon={<CameraAltIcon />}
              >
                Use Camera
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteConfirmation.open}
            onClose={() => setDeleteConfirmation({ open: false, item: null })}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete {deleteConfirmation.item} from
                the inventory?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setDeleteConfirmation({ open: false, item: null })
                }
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteItem(deleteConfirmation.item)}
                color="error"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {/* Recipe Suggestion Dialog */}
          <RecipeSuggestion
            open={openRecipeSuggestion}
            onClose={() => setOpenRecipeSuggestion(false)}
            inventoryItems={Object.keys(inventory)}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}