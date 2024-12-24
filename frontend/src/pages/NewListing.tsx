import React, { useState } from 'react';
import {
  Container,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import UPCScanner from '../components/UPCScanner';

const steps = ['Scan Products', 'Review Analysis', 'Edit Details', 'Create Listing'];

const NewListing: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Grid>
        <Grid item xs={12}>
          {activeStep === 0 && <UPCScanner />}
          {activeStep === 1 && (
            <Typography>Review Analysis (Coming Soon)</Typography>
          )}
          {activeStep === 2 && (
            <Typography>Edit Details (Coming Soon)</Typography>
          )}
          {activeStep === 3 && (
            <Typography>Create Listing (Coming Soon)</Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default NewListing;
