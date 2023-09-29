import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'

import ChainLabel from 'src/components/chain-label/ChainLabel'
import chains from 'src/chains/chains'
import { useAccountAbstraction } from 'src/store/accountAbstractionContext'
import { useEffect, useState } from 'react'

export const ChainDropDown = () => {
  const [chainId, setChainId] = useState<string>(chains[0].id)

  return (
    <div>
      <FormControl fullWidth sx={{ minWidth: '150px' }}>
        <Select aria-label="chain selector" id="switch-chain-selector" value={chainId}>
          {chains.map((chain) => (
            <MenuItem value={chain.id} onClick={() => setChainId(chain.id)}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ChainLabel chain={chain} />
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export const DestinationChainSelector = () => {
  const { destinationChainId, destinationChain, setDestinationChainId, setDestinationChain } =
    useAccountAbstraction()

  useEffect(() => {
    setDestinationChain()
  }, [destinationChain, destinationChainId])

  return (
    <div>
      <FormControl fullWidth sx={{ minWidth: '150px' }}>
        <Select
          aria-label="destination chain selector"
          id="switch-destination-chain-selector"
          value={destinationChain?.id}
          onChange={(event: SelectChangeEvent) =>
            setDestinationChainId(event.target.value as string)
          }
        >
          {chains.map((chain) => (
            <MenuItem value={chain.id} onClick={() => setDestinationChainId(chain.id)}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ChainLabel chain={chain} />
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

const ChainSelector = () => {
  const { chain, setChainId } = useAccountAbstraction()

  return (
    <div>
      <FormControl fullWidth sx={{ minWidth: '150px' }}>
        <Select
          aria-label="chain selector"
          id="switch-chain-selector"
          value={chain?.id}
          onChange={(event: SelectChangeEvent) => setChainId(event.target.value as string)}
        >
          {chains.map((chain) => (
            <MenuItem value={chain.id} onClick={() => setChainId(chain.id)}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ChainLabel chain={chain} />
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export default ChainSelector
