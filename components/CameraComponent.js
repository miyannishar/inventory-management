// components/CameraComponent.js
import React, { useState, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import { Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import e from 'cors';

const CameraComponent = ({ onDetection, inventoryItems }) => {
  
  const camera = useRef(null);
  const [image, setImage] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState(null);

  const captureImage = async () => {
    setError(null);
    const imageSrc = camera.current.takePhoto();
    setImage(imageSrc);
    setDetecting(true);

    try {
      const response = await axios.post('/api/object-detection', { 
        image: imageSrc,
        inventoryItems: inventoryItems
      });
      const detectedObject = response.data.detectedObject;
      onDetection(detectedObject);
    } catch (error) {
      console.error('Error detecting object:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(`Server error: ${error.response.data.error}`);
      } else {
        setError('An error occurred while detecting the object');
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <Box sx={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
        <Camera ref={camera} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </Box>
      <Button variant="contained" color="primary" onClick={captureImage} disabled={detecting} fullWidth sx={{ mt: 2 }}>
        {detecting ? 'Detecting...' : 'Capture and Detect'}
      </Button>
      {image && (
        <Box mt={2}>
          <img src={image} alt="Captured" style={{ maxWidth: '100%' }} />
        </Box>
      )}
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default CameraComponent;