import Typography from '@mui/material/Typography'
import SafeInfo from 'src/components/safe-info/SafeInfo'
import { BoxProps } from '@mui/material/Box'

import { ConnectedContainer } from 'src/components/styles'
import { useAccountAbstraction } from 'src/store/accountAbstractionContext'

interface SafeAccountProps extends BoxProps {
  destination?: boolean
}

function SafeAccount(props: SafeAccountProps) {
  const { safeSelected, chainId, destinationChainId } = useAccountAbstraction()

  return (
    <ConnectedContainer {...props}>
      <Typography fontWeight="700">Safe Account</Typography>

      <Typography fontSize="14px" marginTop="8px" marginBottom="32px">
        Your Safe account (Smart Contract) holds and protects your assets.
      </Typography>

      {/* Safe Info */}
      {safeSelected && <SafeInfo safeAddress={safeSelected} chainId={chainId} />}
      {props.destination && safeSelected && (
        <SafeInfo safeAddress={safeSelected} chainId={destinationChainId} destination />
      )}
    </ConnectedContainer>
  )
}

export default SafeAccount
