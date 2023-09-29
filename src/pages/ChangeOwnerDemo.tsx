import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded'
import SendIcon from '@mui/icons-material/SendRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Input from '@mui/material/Input'
import { utils } from 'ethers'
import { useState } from 'react'

import AddressLabel from 'src/components/address-label/AddressLabel'
import AuthenticateMessage from 'src/components/authenticate-message/AuthenticateMessage'
import Code from 'src/components/code/Code'
import GelatoTaskStatusLabel from 'src/components/gelato-task-status-label/GelatoTaskStatusLabel'
import SafeAccount from 'src/components/safe-account/SafeAccount'
import { ConnectedContainer } from 'src/components/styles'
import { useAccountAbstraction } from 'src/store/accountAbstractionContext'
import { GELATO_SNIPPET } from 'src/utils/snippets'

const transferAmount = 0.01

const ChangeOwnerKitDemo = () => {
  const {
    chainId,
    chain,

    ownerAddress,

    safeBalance,

    isRelayerLoading,
    relayTransaction,
    gelatoTaskId,

    isAuthenticated,
    loginWeb3Auth
  } = useAccountAbstraction()

  const [transactionHash, setTransactionHash] = useState<string>('')

  // TODO: ADD PAY FEES USING USDC TOKEN

  const hasNativeFunds =
    !!safeBalance && Number(utils.formatEther(safeBalance || '0')) > transferAmount

  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value)
  }

  return (
    <>
      <Typography variant="h2" component="h1">
        Change Owner
      </Typography>

      <Typography marginTop="16px" marginBottom="28px">
        Allow users to change owners across multiple chains at once through a single transaction.
      </Typography>

      {!isAuthenticated ? (
        <AuthenticateMessage
          message="To use the Change Owner you need to be authenticated"
          onConnect={loginWeb3Auth}
        />
      ) : (
        <Box display="flex" gap={3}>
          {/* safe Account */}
          <SafeAccount flex={1} />

          {/* Relay Transaction */}
          <ConnectedContainer
            display="flex"
            flex={2}
            flexDirection="column"
            gap={2}
            alignItems="flex-start"
            flexShrink={0}
          >
            <Typography fontWeight="700">Change owner transaction</Typography>

            {/* Gelato status label */}
            {gelatoTaskId && (
              <GelatoTaskStatusLabel
                gelatoTaskId={gelatoTaskId}
                chainId={chainId}
                setTransactionHash={setTransactionHash}
                transactionHash={transactionHash}
              />
            )}

            {isRelayerLoading && <LinearProgress sx={{ alignSelf: 'stretch' }} />}

            {!isRelayerLoading && !gelatoTaskId && (
              <>
                <Typography fontSize="14px">Check the status of your transaction</Typography>

                {/* send fake transaction to Gelato relayer */}
                <Button
                  startIcon={<SendIcon />}
                  variant="contained"
                  disabled={!hasNativeFunds}
                  onClick={relayTransaction}
                >
                  Change Owner
                </Button>

                <Input
                  placeholder="0x1234..."
                  value={inputValue} // Bind the value to the state
                  onChange={handleInputChange} // Step 5: Use the event handler
                  fullWidth
                />

                {!hasNativeFunds && (
                  <Typography color="error">
                    Insufficient funds. Send some funds to the Safe Account
                  </Typography>
                )}

                {!hasNativeFunds && chain?.faucetUrl && (
                  <Link href={chain.faucetUrl} target="_blank">
                    Request 0.5 {chain.token}.
                  </Link>
                )}
              </>
            )}

            {/* Transaction details */}
            <Stack gap={0.5} display="flex" flexDirection="column">
              <Typography>Change owner from</Typography>

              {ownerAddress && (
                <Stack gap={0.5} display="flex" flexDirection="row">
                  <AddressLabel address={ownerAddress} showCopyIntoClipboardButton={false} />

                  <ArrowRightAltRoundedIcon />

                  <AddressLabel
                    address={inputValue ?? '0x0000...0000'}
                    showCopyIntoClipboardButton={false}
                  />
                </Stack>
              )}
            </Stack>
          </ConnectedContainer>
        </Box>
      )}
    </>
  )
}

export default ChangeOwnerKitDemo
