import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import '@safe-global/safe-react-components/dist/fonts.css'

import Header from 'src/components/header/Header'
import Providers from 'src/components/providers/Providers'

import Intro from 'src/pages/Intro'
import NavMenu from './components/nav-menu/NavMenu'
import SafeCoreInfo from './components/safe-core-info/SafeCoreInfo'
import { useAccountAbstraction } from './store/accountAbstractionContext'
import isMoneriumRedirect from './utils/isMoneriumRedirect'
import RelayerKitDemo from './pages/RelayerKitDemo'
import TreasuryManagementDemo from './pages/TreasuryManagementDemo'
import ChangeOwnerKitDemo from './pages/ChangeOwnerDemo'

function App() {
  const { setChainId } = useAccountAbstraction()
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (isMoneriumRedirect()) {
      setActiveStep(2)
    }
  }, [setChainId])

  const nextStep = useCallback(() => {
    setActiveStep((activeStep) => activeStep + 1)
  }, [])

  const previousStep = useCallback(() => {
    setActiveStep((activeStep) => activeStep - 1)
  }, [])

  const setStep = useCallback((newStep: number) => {
    setActiveStep(newStep)
  }, [])

  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === steps.length - 1

  const showSafeCoreVideo = isFirstStep

  const ActiveStepComponent = steps[activeStep].component
  const nextLabel = steps[activeStep].nextLabel

  return (
    <Providers>
      <>
        <CssBaseline />

        {/* App header */}
        <Header setStep={setStep} />
        {!isFirstStep && (
          <Box
            display="flex"
            gap={3}
            alignItems="flex-start"
            maxWidth="1200px"
            margin="120px auto 42px auto"
          >
            <Typography variant="h1" component="h1">
              Multichain Account Abstraction
            </Typography>
          </Box>
        )}
        <Box
          display="flex"
          gap={3}
          alignItems="flex-start"
          maxWidth="1200px"
          margin="60px auto 42px auto"
        >
          {!showSafeCoreVideo && <NavMenu setStep={setStep} activeStep={activeStep} />}

          <main style={{ flexGrow: 1 }}>
            {/* Active Step Component */}
            <ActiveStepComponent setStep={setStep} />

            {/* next & back Buttons */}
            {/* {!isFirstStep && (
              <Stack direction="row" alignItems="center" spacing={2} marginTop="32px">
                <Button onClick={previousStep} variant="outlined">
                  Back
                </Button>

                {!isLastStep && (
                  <>
                    {nextLabel && (
                      <Typography
                        variant="h3"
                        component="h2"
                        fontWeight="700"
                        flexGrow="1"
                        textAlign="right"
                        fontSize="20px"
                      >
                        {nextLabel}
                      </Typography>
                    )}

                    <Button onClick={nextStep} variant="contained">
                      Next
                    </Button>
                  </>
                )}
              </Stack>
            )} */}
          </main>
        </Box>
      </>
    </Providers>
  )
}

export default App

const steps = [
  {
    // Intro step
    component: Intro
  },
  {
    // Relay Kit step
    component: ChangeOwnerKitDemo,
    nextLabel: 'to Treasury Management Kit'
  },
  {
    // Relay Kit step
    component: TreasuryManagementDemo
  },
  {
    // Relayer Kit step
    component: RelayerKitDemo
  }
]
