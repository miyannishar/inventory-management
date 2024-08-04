import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';

const RecipeSuggestion = ({ open, onClose, inventoryItems }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRecipeSuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending request with ingredients:', inventoryItems);
      const response = await fetch('/api/suggestrecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: inventoryItems }),
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received data:', data);
      setRecipe(data.recipe);
    } catch (error) {
      console.error('Error fetching recipe suggestion:', error.message);
      setError(`Failed to get recipe suggestion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Recipe Suggestion</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Available Ingredients:
        </Typography>
        <List dense>
          {inventoryItems.map((item) => (
            <ListItem key={item}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : recipe ? (
          <>
            <Typography variant="h6" gutterBottom>
              Suggested Recipe: {recipe.name}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Ingredients:
            </Typography>
            <List dense>
              {recipe.ingredients.map((ingredient, index) => (
                <ListItem key={index}>
                  <ListItemText primary={ingredient} />
                </ListItem>
              ))}
            </List>
            <Typography variant="subtitle1" gutterBottom>
              Steps:
            </Typography>
            <List dense>
              {recipe.steps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${index + 1}. ${step}`} />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Typography>Click "Get Recipe Suggestion" to generate a recipe.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={getRecipeSuggestion} color="primary" disabled={loading}>
          Get Recipe Suggestion
        </Button>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeSuggestion;