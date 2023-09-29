import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Code from 'src/components/code/Code'

import ConnectedWalletLabel from 'src/components/connected-wallet-label/ConnectedWalletLabel'
import SafeAccount from 'src/components/safe-account/SafeAccount'
import { ConnectContainer, ConnectedContainer } from 'src/components/styles'
import { useAccountAbstraction } from 'src/store/accountAbstractionContext'
import { WEB3AUTH_SNIPPET } from 'src/utils/snippets'

const AuthKitDemo = () => {
  const { loginWeb3Auth, isAuthenticated } = useAccountAbstraction()

  return (
    <>
      <Typography variant="h2" component="h1">
        The Auth Kit
      </Typography>

      <Typography marginTop="16px" marginBottom="28px">
        Generate or authenticate a blockchain account using an email address, social media account,
        or traditional crypto wallets like Metamask.
      </Typography>

      {isAuthenticated ? (
        <Box display="flex" gap={3}>
          {/* safe Account */}
          <SafeAccount flex={1} />

          {/* owner ID */}
          <ConnectedContainer flex={2}>
            <Typography fontWeight="700">Owner ID</Typography>

            <Typography fontSize="14px" marginTop="8px" marginBottom="32px">
              Your Owner account signs transactions to unlock your assets.
            </Typography>

            {/* Owner details */}
            <ConnectedWalletLabel />
          </ConnectedContainer>
        </Box>
      ) : (
        <ConnectContainer display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h4" component="h3" fontWeight="700">
            Create a safe using the Auth Kit
          </Typography>

          <Button variant="contained" onClick={loginWeb3Auth}>
            Connect
          </Button>
        </ConnectContainer>
      )}
    </>
  )
}

export default AuthKitDemo
