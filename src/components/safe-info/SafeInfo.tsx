import { useCallback, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { Box, Skeleton, Theme } from '@mui/material'
import styled from '@emotion/styled'
import { utils } from 'ethers'

import AddressLabel from 'src/components/address-label/AddressLabel'
import AmountLabel from 'src/components/amount-label/AmountLabel'
import getSafeInfo from 'src/api/getSafeInfo'
import useApi from 'src/hooks/useApi'

import usePolling from 'src/hooks/usePolling'
import { useAccountAbstraction } from 'src/store/accountAbstractionContext'

import isContractAddress from 'src/utils/isContractAddress'
import Chain from 'src/models/chain'

type SafeInfoProps = {
  safeAddress: string
  chain: Chain
  destination?: boolean
  balance?: string
}

// TODO: ADD USDC LABEL
// TODO: ADD CHAIN LABEL

function SafeInfo({ safeAddress, chain, destination, balance }: SafeInfoProps) {
  const { id: chainId, color: chainColor, label: chainLabel } = chain
  const { web3Provider, safeBalance } = useAccountAbstraction()

  const [isDeployed, setIsDeployed] = useState<boolean>(false)
  const [isDeployLoading, setIsDeployLoading] = useState<boolean>(true)

  // detect if the safe is deployed with polling
  const detectSafeIsDeployed = useCallback(async () => {
    const isDeployed = await isContractAddress(safeAddress, web3Provider)

    setIsDeployed(isDeployed)
    setIsDeployLoading(false)
  }, [web3Provider, safeAddress])

  usePolling(detectSafeIsDeployed)

  // safe info from Safe transaction service (used to know the threshold & owners of the Safe if its deployed)
  const fetchInfo = useCallback(
    (signal: AbortSignal) => getSafeInfo(safeAddress, chainId, { signal }),
    [safeAddress, chainId]
  )

  const { data: safeInfo, isLoading: isGetSafeInfoLoading } = useApi(fetchInfo)

  const owners = safeInfo?.owners.length || 1
  const threshold = safeInfo?.threshold || 1
  const isLoading = isDeployLoading || isGetSafeInfoLoading

  return (
    <Stack direction="row" spacing={2}>
      <div style={{ position: 'relative' }}>
        {/* Safe Logo */}
        {isLoading ? (
          <Skeleton variant="circular" width={50} height={50} />
        ) : (
          <Box
            height="49px"
            width="49px"
            bgcolor={chainColor}
            borderRadius="50%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            color="black"
            fontSize="12px"
            margin="1px"
          >
            {chainLabel.slice(0, 3).toLocaleUpperCase()}
          </Box>
        )}

        {/* Threshold & owners label */}
        {isDeployed && (
          <SafeSettingsLabel>
            <Typography fontSize="12px" fontWeight="700" color="inherit" lineHeight="initial">
              {threshold}/{owners}
            </Typography>
          </SafeSettingsLabel>
        )}
      </div>

      <Stack direction="column" spacing={0.5} alignItems="flex-start">
        {/* Safe address label */}
        <Typography variant="body2">
          <AddressLabel address={safeAddress} showBlockExplorerLink chain={chain} />
        </Typography>

        {isLoading && <Skeleton variant="text" width={110} height={20} />}

        {!isDeployed && !isDeployLoading && (
          <CreationPendingLabel>
            <Tooltip title="This Safe is not deployed yet, it will be deployed when you execute the first transaction">
              <Typography fontWeight="700" fontSize="12px" color="inherit">
                Creation pending
              </Typography>
            </Tooltip>
          </CreationPendingLabel>
        )}

        {!isLoading && destination ? (
          <AmountContainer>
            {/* Safe Balance */}
            <Typography fontWeight="700">
              <AmountLabel amount={balance || '0'} tokenSymbol={chain?.bridgeToken?.symbol || ''} />
            </Typography>
          </AmountContainer>
        ) : !isLoading ? (
          <AmountContainer>
            {/* Safe Balance */}
            <Typography fontWeight="700">
              <AmountLabel
                amount={utils.formatEther(safeBalance || '0')}
                tokenSymbol={chain?.token || ''}
              />
            </Typography>
          </AmountContainer>
        ) : null}
      </Stack>
    </Stack>
  )
}

export default SafeInfo

const SafeSettingsLabel = styled('div')<{
  theme?: Theme
}>(
  ({ theme }) => `
  position: absolute;
  top: -6px;
  right: -4px;
  border-radius: 50%;
  background-color: ${theme.palette.secondary.light};
  color: ${theme.palette.getContrastText(theme.palette.secondary.light)};
  padding: 5px 6px;
`
)

const CreationPendingLabel = styled('div')<{
  theme?: Theme
}>(
  ({ theme }) => `
  border-radius: 4px;
  background-color: ${theme.palette.info.light};
  color: ${theme.palette.getContrastText(theme.palette.secondary.light)}; 
  padding: 0px 10px;
`
)

const AmountContainer = styled('div')<{
  theme?: Theme
}>(
  ({ theme, onClick }) => `
  border-radius: 6px;
  background-color: ${theme.palette.background.light};
  padding: 0px 8px;
  cursor: ${!!onClick ? 'pointer' : 'initial'};
  `
)
