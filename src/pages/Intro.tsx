import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import styled from '@emotion/styled'
import { Theme } from '@mui/material'

import xafeLogo from 'src/assets/logo/gray.png'
import ChainSelector from 'src/components/chain-selector/ChainSelector'

type IntroProps = {
  setStep: (newStep: number) => void
}

const Intro = ({ setStep }: IntroProps) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" paddingTop="72px">
      <img src={xafeLogo} alt="safe logo" height="30px" />

      <Typography variant="h1" fontSize="56px" lineHeight="76px">
        Multichain Account Abstraction
      </Typography>

      <Typography variant="body1">
        The Multichain Kit is a collection of tools that will help manage your Safe on multiple
        chains.
      </Typography>

      {/* Kit list */}
      <Box display="grid" gap={2} marginTop="36px" gridTemplateColumns="repeat(2, 1fr)">
        <Box display="flex" gap={1}>
          <OrderLabel fontSize="10px" fontWeight="700">
            01
          </OrderLabel>
          <Typography fontWeight="700" fontSize="20px">
            Change Owner
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <OrderLabel fontSize="10px" fontWeight="700">
            02
          </OrderLabel>
          <Typography fontWeight="700" fontSize="20px">
            Treasury Management
          </Typography>
        </Box>
      </Box>

      <Divider style={{ margin: '42px 0', width: '50%' }} />

      <Box display="flex" gap={2} alignItems="center">
        <ChainSelector />

        <Button variant="contained" onClick={() => setStep(1)}>
          Start Demo
        </Button>
      </Box>
    </Box>
  )
}

export default Intro

const OrderLabel = styled(Typography)<{
  theme?: Theme
}>(
  ({ theme }) => `
  border: 1px solid ${theme.palette.text.primary};
  border-radius: 4px;
  padding: 4px 6px;
  line-height: 12px;
`
)
