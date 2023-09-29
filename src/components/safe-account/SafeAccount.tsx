import Typography from '@mui/material/Typography'
import SafeInfo from 'src/components/safe-info/SafeInfo'
import { BoxProps } from '@mui/material/Box'

import { ConnectedContainer } from 'src/components/styles'
import { useAccountAbstraction } from 'src/store/accountAbstractionContext'
import { ethers } from 'ethers'

interface SafeAccountProps extends BoxProps {
  destination?: boolean
}

function SafeAccount(props: SafeAccountProps) {
  const { destination } = props
  const { safeSelected, chain, destinationChain, safeErc20Balance, destinationErc20Balance } =
    useAccountAbstraction()

  return (
    <ConnectedContainer {...props}>
      <Typography fontWeight="700">Safe Account</Typography>

      <Typography fontSize="14px" marginTop="8px" marginBottom="32px">
        Your Safe account (Smart Contract) holds and protects your assets.
      </Typography>

      {/* Safe Info */}
      {/* {safeSelected && <SafeInfo safeAddress={safeSelected} chainId={chainId} />}
      {props.destination && safeSelected && (
        <SafeInfo safeAddress={safeSelected} chainId={destinationChainId} destination />
      )} */}

      {safeSelected && destination && chain && destinationChain ? (
        <>
          <SafeInfo
            safeAddress={safeSelected}
            chain={chain}
            balance={safeErc20Balance ? ethers.utils.formatUnits(safeErc20Balance.toString(), 6).toString() : undefined}

            destination
          />
          <SafeInfo
            safeAddress={safeSelected}
            chain={destinationChain}
            balance={destinationErc20Balance}
            destination
          />
        </>
      ) : safeSelected && chain ? (
        <SafeInfo safeAddress={safeSelected} chain={chain} />
      ) : null}
    </ConnectedContainer>
  )
}

export default SafeAccount
