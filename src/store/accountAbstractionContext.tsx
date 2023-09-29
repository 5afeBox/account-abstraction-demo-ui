import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ethers, utils } from 'ethers'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'

import AccountAbstraction from '@safe-global/account-abstraction-kit-poc'
import { Web3AuthModalPack } from '@safe-global/auth-kit'
import { MoneriumPack, StripePack } from '@safe-global/onramp-kit'
import { GelatoRelayPack } from '@safe-global/relay-kit'
import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types'
import { CHAINS, Environment, AxelarQueryAPI } from '@axelar-network/axelarjs-sdk'
import testnetConfig from './config/testnet.json'

import { initialChain, initialDestinationChain } from 'src/chains/chains'
import usePolling from 'src/hooks/usePolling'
import Chain from 'src/models/chain'
import getChain from 'src/utils/getChain'
import getMoneriumInfo, { MoneriumInfo } from 'src/utils/getMoneriumInfo'
import isMoneriumRedirect from 'src/utils/isMoneriumRedirect'
type crossChainSend = {
  srcChain: string
  dstChain: string
  to: string
  amount: string
  tokenSymbol: string
}

type accountAbstractionContextValue = {
  ownerAddress?: string
  chainId: string
  destinationChainId: string
  safes: string[]
  chain?: Chain
  destinationChain?: Chain
  isAuthenticated: boolean
  web3Provider?: ethers.providers.Web3Provider
  destinationWeb3Provider?: ethers.providers.Web3Provider
  loginWeb3Auth: () => void
  logoutWeb3Auth: () => void
  setChainId: (chainId: string) => void
  setDestinationChainId: (chainId: string) => void
  safeSelected?: string
  safeBalance?: string
  destinationSafeBalance?: string
  setSafeSelected: React.Dispatch<React.SetStateAction<string>>
  isRelayerLoading: boolean
  relayTransaction: () => Promise<void>
  gelatoTaskId?: string
  openStripeWidget: () => Promise<void>
  closeStripeWidget: () => Promise<void>
  startMoneriumFlow: () => Promise<void>
  closeMoneriumFlow: () => void
  moneriumInfo?: MoneriumInfo
  crosschainSend: (data: crossChainSend) => Promise<void>
  approveToken: () => Promise<void>
  safeErc20Balance?: ethers.BigNumberish
  destinationErc20Balance?: string
  setDestinationChain: () => void
  safeCrossChainAllowance?: ethers.BigNumberish
}

const initialState = {
  isAuthenticated: false,
  loginWeb3Auth: () => {},
  logoutWeb3Auth: () => {},
  relayTransaction: async () => {},
  setChainId: () => {},
  setDestinationChainId: () => {},
  setSafeSelected: () => {},
  onRampWithStripe: async () => {},
  safes: [],
  chainId: initialChain.id,
  destinationChainId: initialDestinationChain.id,
  isRelayerLoading: true,
  openStripeWidget: async () => {},
  closeStripeWidget: async () => {},
  startMoneriumFlow: async () => {},
  closeMoneriumFlow: () => {},
  crosschainSend: async () => {},
  approveToken: async () => {},
  setDestinationChain: () => {}
}

const accountAbstractionContext = createContext<accountAbstractionContextValue>(initialState)

const useAccountAbstraction = () => {
  const context = useContext(accountAbstractionContext)

  if (!context) {
    throw new Error('useAccountAbstraction should be used within a AccountAbstraction Provider')
  }

  return context
}

const MONERIUM_TOKEN = 'monerium_token'
const CROSSCHAIN_EXECUABLE_ADDRESS = '0x94C35B4Dfb8D01A668AbCAB1AC44c84F8242472f'

const AccountAbstractionProvider = ({ children }: { children: JSX.Element }) => {
  // owner address from the email  (provided by web3Auth)
  const [ownerAddress, setOwnerAddress] = useState<string>('')

  // safes owned by the user
  const [safes, setSafes] = useState<string[]>([])

  // chain selected
  const [chainId, setChainId] = useState<string>(() => {
    if (isMoneriumRedirect()) {
      return '0x5'
    }

    return initialChain.id
  })

  const [destinationChainId, setDestinationChainId] = useState<string>(initialDestinationChain.id)

  // web3 provider to perform signatures
  const [web3Provider, setWeb3Provider] = useState<ethers.providers.Web3Provider>()
  const [destinationWeb3Provider, setDestinationWeb3Provider] =
    useState<ethers.providers.JsonRpcProvider>()

  const isAuthenticated = !!ownerAddress && !!chainId
  const chain = getChain(chainId) || initialChain
  const destinationChain = getChain(destinationChainId) || initialDestinationChain

  // reset React state when you switch the chain
  useEffect(() => {
    setOwnerAddress('')
    setSafes([])
    setChainId(chain.id)
    setWeb3Provider(undefined)
    setSafeSelected('')
  }, [chain])
  // useEffect(() => {
  //   setDestinationChainId(destinationChain.id)
  //   setDestinationWeb3Provider(undefined)
  // }, [destinationChain])

  // authClient
  const [web3AuthModalPack, setWeb3AuthModalPack] = useState<Web3AuthModalPack>()

  // onRampClient
  const [stripePack, setStripePack] = useState<StripePack>()

  useEffect(() => {
    ;(async () => {
      const options: Web3AuthOptions = {
        clientId: process.env.REACT_APP_WEB3AUTH_CLIENT_ID || '',
        web3AuthNetwork: 'testnet',
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: chain.id,
          rpcTarget: chain.rpcUrl
        },
        uiConfig: {
          theme: 'dark',
          loginMethodsOrder: ['google', 'facebook']
        }
      }

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: 'torus',
          showOnModal: false
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: 'metamask',
          showOnDesktop: true,
          showOnMobile: false
        }
      }

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'mandatory'
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Safe'
          }
        }
      })

      const web3AuthModalPack = new Web3AuthModalPack({
        txServiceUrl: chain.transactionServiceUrl
      })

      await web3AuthModalPack.init({
        options,
        adapters: [openloginAdapter],
        modalConfig
      })

      setWeb3AuthModalPack(web3AuthModalPack)

      //   const destinationWeb3AuthModalPack = new Web3AuthModalPack({
      //     txServiceUrl: destinationChain.transactionServiceUrl
      //   })

      //   await destinationWeb3AuthModalPack.init({
      //     options,
      //     adapters: [openloginAdapter],
      //     modalConfig
      //   })

      //   setDestinationWeb3AuthModalPack(destinationWeb3AuthModalPack)
    })()
  }, [chain])

  // auth-kit implementation
  const loginWeb3Auth = useCallback(async () => {
    if (!web3AuthModalPack) return

    try {
      const { safes, eoa } = await web3AuthModalPack.signIn()
      const provider = web3AuthModalPack.getProvider() as ethers.providers.ExternalProvider

      // we set react state with the provided values: owner (eoa address), chain, safes owned & web3 provider
      setChainId(chain.id)
      setOwnerAddress(eoa)
      setSafes(safes || [])
      setWeb3Provider(new ethers.providers.Web3Provider(provider))
    } catch (error) {
      console.log('error: ', error)
    }
  }, [chain, web3AuthModalPack])

  const setDestinationChain = useCallback(async () => {
    const provider = new ethers.providers.JsonRpcProvider(destinationChain.rpcUrl)
    setDestinationChainId(destinationChain.id)
    // console.log('destinationChain.provider', provider)
    setDestinationWeb3Provider(provider)
  }, [destinationChainId])

  useEffect(() => {
    if (web3AuthModalPack && web3AuthModalPack.getProvider()) {
      ;(async () => {
        await loginWeb3Auth()
      })()
    }
  }, [web3AuthModalPack, loginWeb3Auth])

  const logoutWeb3Auth = () => {
    web3AuthModalPack?.signOut()
    setOwnerAddress('')
    setSafes([])
    setChainId(chain.id)
    setWeb3Provider(undefined)
    setSafeSelected('')
    setGelatoTaskId(undefined)
    closeMoneriumFlow()
  }

  // current safe selected by the user
  const [safeSelected, setSafeSelected] = useState<string>('')
  const [moneriumInfo, setMoneriumInfo] = useState<MoneriumInfo>()
  const [moneriumPack, setMoneriumPack] = useState<MoneriumPack>()

  // Initialize MoneriumPack
  useEffect(() => {
    ;(async () => {
      if (!web3Provider || !safeSelected) return

      const safeOwner = web3Provider.getSigner()
      const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: safeOwner })

      const safeSdk = await Safe.create({
        ethAdapter: ethAdapter,
        safeAddress: safeSelected,
        isL1SafeMasterCopy: true
      })

      const pack = new MoneriumPack({
        clientId: process.env.REACT_APP_MONERIUM_CLIENT_ID || '',
        environment: 'sandbox'
      })

      await pack.init({
        safeSdk
      })

      setMoneriumPack(pack)
    })()
  }, [web3Provider, safeSelected])

  const startMoneriumFlow = useCallback(
    async (authCode?: string, refreshToken?: string) => {
      if (!moneriumPack) return

      const moneriumClient = await moneriumPack.open({
        redirectUrl: process.env.REACT_APP_MONERIUM_REDIRECT_URL,
        authCode,
        refreshToken
      })

      if (moneriumClient.bearerProfile) {
        localStorage.setItem(MONERIUM_TOKEN, moneriumClient.bearerProfile.refresh_token)

        const authContext = await moneriumClient.getAuthContext()
        const profile = await moneriumClient.getProfile(authContext.defaultProfile)
        const balances = await moneriumClient.getBalances(authContext.defaultProfile)

        setMoneriumInfo(getMoneriumInfo(safeSelected, authContext, profile, balances))
      }
    },
    [moneriumPack, safeSelected]
  )

  const closeMoneriumFlow = useCallback(() => {
    moneriumPack?.close()
    localStorage.removeItem(MONERIUM_TOKEN)
    setMoneriumInfo(undefined)
  }, [moneriumPack])

  useEffect(() => {
    const authCode = new URLSearchParams(window.location.search).get('code') || undefined
    const refreshToken = localStorage.getItem(MONERIUM_TOKEN) || undefined

    if (authCode || refreshToken) startMoneriumFlow(authCode, refreshToken)
  }, [startMoneriumFlow])

  // TODO: add disconnect owner wallet logic ?

  // conterfactual safe Address if its not deployed yet
  useEffect(() => {
    const getSafeAddress = async () => {
      if (web3Provider) {
        const signer = web3Provider.getSigner()
        const relayPack = new GelatoRelayPack()
        const safeAccountAbstraction = new AccountAbstraction(signer)

        await safeAccountAbstraction.init({ relayPack })

        const hasSafes = safes.length > 0

        const safeSelected = hasSafes ? safes[0] : await safeAccountAbstraction.getSafeAddress()

        setSafeSelected(safeSelected)
      }
    }

    getSafeAddress()
  }, [safes, web3Provider])

  const [isRelayerLoading, setIsRelayerLoading] = useState<boolean>(false)
  const [gelatoTaskId, setGelatoTaskId] = useState<string>()

  // refresh the Gelato task id
  useEffect(() => {
    setIsRelayerLoading(false)
    setGelatoTaskId(undefined)
  }, [chainId])

  // relay-kit implementation using Gelato
  const relayTransaction = async () => {
    if (web3Provider) {
      setIsRelayerLoading(true)

      const signer = web3Provider.getSigner()
      const relayPack = new GelatoRelayPack()
      const safeAccountAbstraction = new AccountAbstraction(signer)
      await safeAccountAbstraction.init({ relayPack })

      // we use a dump safe transfer as a demo transaction
      const dumpSafeTransafer: MetaTransactionData[] = [
        {
          to: safeSelected,
          data: '0x',
          value: utils.parseUnits('0.01', 'ether').toString(),
          operation: 0 // OperationType.Call,
        }
      ]

      const options: MetaTransactionOptions = {
        isSponsored: false,
        gasLimit: '600000', // in this alfa version we need to manually set the gas limit
        gasToken: ethers.constants.AddressZero // native token
      }

      const gelatoTaskId = await safeAccountAbstraction.relayTransaction(dumpSafeTransafer, options)

      setIsRelayerLoading(false)
      setGelatoTaskId(gelatoTaskId)
    }
  }

  // crosschain-kit implementation using Gelato
  const crosschainTransaction = async (data: string, value: string) => {
    if (web3Provider) {
      setIsRelayerLoading(true)

      const signer = web3Provider.getSigner()
      const relayPack = new GelatoRelayPack()
      const safeAccountAbstraction = new AccountAbstraction(signer)
      await safeAccountAbstraction.init({ relayPack })

      // we use a dump safe transfer as a demo transaction
      const dumpSafeTransafer: MetaTransactionData[] = [
        {
          to: CROSSCHAIN_EXECUABLE_ADDRESS,
          data: data,
          value: value,
          operation: 0 // OperationType.Call,
        }
      ]

      const options: MetaTransactionOptions = {
        isSponsored: false,
        gasLimit: '600000', // in this alfa version we need to manually set the gas limit
        gasToken: ethers.constants.AddressZero // native token
      }

      const gelatoTaskId = await safeAccountAbstraction.relayTransaction(dumpSafeTransafer, options)

      setIsRelayerLoading(false)
      setGelatoTaskId(gelatoTaskId)
    }
  }

  const crosschainSend = async ({
    srcChain,
    dstChain,
    to,
    amount,
    tokenSymbol
  }: {
    srcChain: string
    dstChain: string
    to: string
    amount: string
    tokenSymbol: string
  }) => {
    const { chains: testnetChains } = testnetConfig
    const CROSSCHAIN_EXECUABLE_ABI = [
      'function crossChainSend(string memory destinationChain,string memory destinationAddress,address destRecipient,string memory symbol,uint256 amount) external payable'
    ]

    const iface = new ethers.utils.Interface(CROSSCHAIN_EXECUABLE_ABI)
    const data = iface.encodeFunctionData('crossChainSend', [
      dstChain,
      CROSSCHAIN_EXECUABLE_ADDRESS,
      to,
      tokenSymbol,
      ethers.utils.parseUnits(amount, 'mwei').toString()
    ])
    const axlQueryApi = new AxelarQueryAPI({ environment: Environment.TESTNET })
    const src_chain = testnetChains[srcChain as keyof typeof testnetChains]
    const dst_chain = testnetChains[dstChain as keyof typeof testnetChains]
    const gasFee = await axlQueryApi.estimateGasFee(
      src_chain.id,
      dst_chain.id,
      src_chain.tokenSymbol
    )
    await crosschainTransaction(data, gasFee.toString())
  }

  const approveToken = async () => {
    const ERC20_APPROVE_ABI = [
      'function approve(address spender, uint256 amount) external returns (bool)'
    ]
    const iface = new ethers.utils.Interface(ERC20_APPROVE_ABI)
    const data = iface.encodeFunctionData('approve', [
      CROSSCHAIN_EXECUABLE_ADDRESS,
      ethers.utils.parseUnits('100000', 6).toString()
    ])

    if (web3Provider) {
      setIsRelayerLoading(true)

      const signer = web3Provider.getSigner()
      const relayPack = new GelatoRelayPack()
      const safeAccountAbstraction = new AccountAbstraction(signer)
      await safeAccountAbstraction.init({ relayPack })

      const aUSDC = '0x254d06f33bDc5b8ee05b2ea472107E300226659A'

      // we use a dump safe transfer as a demo transaction
      const dumpSafeTransafer: MetaTransactionData[] = [
        {
          to: aUSDC,
          data: data,
          value: '0',
          operation: 0 // OperationType.Call,
        }
      ]

      const options: MetaTransactionOptions = {
        isSponsored: false,
        gasLimit: '600000', // in this alfa version we need to manually set the gas limit
        gasToken: ethers.constants.AddressZero // native token
      }

      const gelatoTaskId = await safeAccountAbstraction.relayTransaction(dumpSafeTransafer, options)

      setIsRelayerLoading(false)
      setGelatoTaskId(gelatoTaskId)
    }
  }

  // onramp-kit implementation
  const openStripeWidget = async () => {
    const stripePack = new StripePack({
      stripePublicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY || '',
      onRampBackendUrl: process.env.REACT_APP_STRIPE_BACKEND_BASE_URL || ''
    })

    await stripePack.init()

    const sessionData = await stripePack.open({
      // sessionId: sessionId, optional parameter
      element: '#stripe-root',
      defaultOptions: {
        transaction_details: {
          wallet_address: safeSelected,
          supported_destination_networks: ['ethereum', 'polygon'],
          supported_destination_currencies: ['usdc'],
          lock_wallet_address: true
        },
        customer_information: {
          email: 'john@doe.com'
        }
      }
    })

    setStripePack(stripePack)

    console.log('Stripe sessionData: ', sessionData)
  }

  const closeStripeWidget = async () => {
    stripePack?.close()
  }

  // we can pay Gelato tx relayer fees with native token & USDC
  // TODO: ADD native Safe Balance polling
  // TODO: ADD USDC Safe Balance polling

  // fetch safe address balance with polling
  const fetchSafeBalance = useCallback(async () => {
    const balance = await web3Provider?.getBalance(safeSelected)

    return balance?.toString()
  }, [web3Provider, safeSelected])
  const fetchErc20Balance = async (
    addr: string,
    provider: ethers.providers.JsonRpcProvider | undefined
  ) => {
    const erc20 = new ethers.Contract(
      addr,
      ['function balanceOf(address account) external view returns (uint256)'],
      provider
    )
    const balance = await erc20.balanceOf(safeSelected)
    return balance
  }

  const fetchChainErc20Balance = useCallback(async () => {
    const balance = await fetchErc20Balance(chain.bridgeToken?.address || '', web3Provider)
    // return ethers.utils.formatUnits(balance, 6).toString()
    return balance
  }, [web3Provider, safeSelected])

  const fetchDstErc20Balance = useCallback(async () => {
    // if (destinationWeb3Provider) {
    // console.log('fetch dst erc20 balance', destinationWeb3Provider)

    const balance = await fetchErc20Balance(
      destinationChain.bridgeToken?.address || '',
      destinationWeb3Provider
    )
    return ethers.utils.formatUnits(balance, 6).toString()
    // }
  }, [destinationWeb3Provider, safeSelected])

  const fetchDestinationSafeBalance = useCallback(async () => {
    const balance = await destinationWeb3Provider?.getBalance(safeSelected)

    return balance?.toString()
  }, [destinationWeb3Provider, safeSelected])

  const fetchSafeCrossChainAllowance = useCallback(async () => {
    const erc20 = new ethers.Contract(
      chain.bridgeToken?.address || '',
      ['function allowance(address owner, address spender) external view returns (uint256)'],
      web3Provider
    )
    const allowance = await erc20.allowance(safeSelected, CROSSCHAIN_EXECUABLE_ADDRESS)
    return allowance
  }, [web3Provider, safeSelected])

  const safeBalance = usePolling(fetchSafeBalance)
  const safeErc20Balance = usePolling(fetchChainErc20Balance)
  const destinationErc20Balance = usePolling(fetchDstErc20Balance)
  const destinationSafeBalance = usePolling(fetchDestinationSafeBalance)
  const safeCrossChainAllowance = usePolling(fetchSafeCrossChainAllowance)

  const state = {
    ownerAddress,
    chainId,
    destinationChainId,
    chain,
    destinationChain,
    safes,

    isAuthenticated,

    web3Provider,

    loginWeb3Auth,
    logoutWeb3Auth,

    setChainId,
    setDestinationChainId,

    setDestinationChain,

    safeSelected,
    safeBalance,
    destinationSafeBalance,
    setSafeSelected,

    isRelayerLoading,
    relayTransaction,
    gelatoTaskId,

    openStripeWidget,
    closeStripeWidget,

    startMoneriumFlow,
    closeMoneriumFlow,
    moneriumInfo,

    crosschainSend,
    approveToken,

    safeErc20Balance,
    destinationErc20Balance,
    safeCrossChainAllowance
  }

  return (
    <accountAbstractionContext.Provider value={state}>
      {children}
    </accountAbstractionContext.Provider>
  )
}

export { useAccountAbstraction, AccountAbstractionProvider }
