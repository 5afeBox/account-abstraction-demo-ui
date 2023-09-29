import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded'
import SendIcon from '@mui/icons-material/SendRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ethers, utils } from 'ethers'
import { useState } from 'react'

import AddressLabel from 'src/components/address-label/AddressLabel'
import AuthenticateMessage from 'src/components/authenticate-message/AuthenticateMessage'
import { DestinationChainSelector } from 'src/components/chain-selector/ChainSelector'
import Code from 'src/components/code/Code'
import GelatoTaskStatusLabel from 'src/components/gelato-task-status-label/GelatoTaskStatusLabel'
import SafeAccount from 'src/components/safe-account/SafeAccount'
import { ConnectedContainer } from 'src/components/styles'
import { useAccountAbstraction } from 'src/store/accountAbstractionContext'
import { GELATO_SNIPPET } from 'src/utils/snippets'

const transferAmount = 0.01
const tokenAmount = 10

const TreasuryManagementDemo = () => {
  // const tokenApproved = false
  const {
    chainId,
    chain,
    destinationChain,

    safeSelected,
    safeBalance,

    isRelayerLoading,
    // relayTransaction,
    crosschainSend,
    approveToken,
    gelatoTaskId,

    isAuthenticated,
    loginWeb3Auth,
    safeCrossChainAllowance,
    safeErc20Balance
  } = useAccountAbstraction()

  const [transactionHash, setTransactionHash] = useState<string>('')

  const hasNativeFunds =
    !!safeBalance && Number(utils.formatEther(safeBalance || '0')) > transferAmount

  // console.log('safeCrossChainAllowance', safeCrossChainAllowance)
  // console.log('safeErc20Balance', safeErc20Balance)
  const hasTokenFunds =
    safeCrossChainAllowance && safeErc20Balance
      ? ethers.BigNumber.from(safeCrossChainAllowance).gte(ethers.BigNumber.from(safeErc20Balance))
      : false

  return (
    <>
      <Typography variant="h2" component="h1">
        Treasury Management
      </Typography>

      <Typography marginTop="16px" marginBottom="28px">
        Allow users to pay fees using any ERC-20 tokens, without having to manage gas. Sponsor
        transactions on behalf of your users. On your first relayed transaction, a Safe Account will
        be automatically deployed and your address will be assigned as the Safe owner.
      </Typography>

      {!isAuthenticated ? (
        <AuthenticateMessage
          message="Change Owner you need to be authenticated"
          onConnect={loginWeb3Auth}
        />
      ) : (
        <Box display="flex" gap={3}>
          {/* safe Account */}
          <SafeAccount flex={1} destination />

          {/* Relay Transaction */}
          <ConnectedContainer
            display="flex"
            flex={2}
            flexDirection="column"
            gap={2}
            alignItems="flex-start"
            flexShrink={0}
          >
            <Typography fontWeight="700">Crosschain fund transaction</Typography>

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
                <Typography fontSize="14px">Check the status of your transaction.</Typography>
                <Box display="flex" gap={2}>
                  {/* {console.log('hasTokenFunds', hasTokenFunds)} */}
                  {!hasTokenFunds ? (
                    <Button
                      variant="contained"
                      disabled={!hasNativeFunds}
                      onClick={approveToken}
                      hidden={false}
                    >
                      Approve Token
                    </Button>
                  ) : (
                    <Button
                      startIcon={<SendIcon />}
                      variant="contained"
                      disabled={!hasNativeFunds}
                      onClick={async () => {
                        if (safeSelected && chain && destinationChain)
                          await crosschainSend({
                            srcChain: chain.bridgeChainId,
                            dstChain: destinationChain.bridgeChainId,
                            to: safeSelected,
                            tokenSymbol: 'aUSDC',
                            amount: '10'
                          })
                      }}
                    >
                      Send Token
                    </Button>
                  )}

                  <DestinationChainSelector />
                </Box>
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
              <Typography>Transfer {tokenAmount} aUSDC</Typography>

              {safeSelected && (
                <Stack gap={0.5} display="flex" flexDirection="row">
                  <Typography>{chain?.label}</Typography>
                  <ArrowRightAltRoundedIcon />
                  <Typography>{destinationChain?.label}</Typography>
                </Stack>
              )}
            </Stack>
          </ConnectedContainer>
        </Box>
      )}
    </>
  )
}

export default TreasuryManagementDemo
