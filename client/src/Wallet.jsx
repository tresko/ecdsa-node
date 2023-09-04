import {useState, useEffect} from 'react'
import {ethers} from 'ethers'
import {WalletContext} from './context'

export default function Wallet({children}) {
  const [hasProvider, setHasProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const initialState = {accounts: []}
  const [wallet, setWallet] = useState(initialState)

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const refreshAccounts = accounts => {
      if (accounts.length > 0) {
        updateWallet(accounts)
      } else {
        // if length 0, user is disconnected
        setWallet(initialState)
      }
    }

    const refreshChain = chainId => {
      setWallet(wallet => ({...wallet, chainId}))
    }

    const getProvider = async () => {
      let provider
      if (window.ethereum == null) {
        // If MetaMask is not installed, we use the default provider,
        // which is backed by a variety of third-party services (such
        // as INFURA). They do not have private keys installed so are
        // only have read-only access
        console.log('MetaMask not installed; using read-only defaults')
        provider = ethers.getDefaultProvider()
      } else {
        // Connect to the MetaMask EIP-1193 object. This is a standard
        // protocol that allows Ethers access to make all read-only
        // requests through MetaMask.
        provider = new ethers.BrowserProvider(window.ethereum)

        // It also provides an opportunity to request access to write
        // operations, which will be performed by the private key
        // that MetaMask manages for the user.
        setSigner(await provider.getSigner())
      }
      setHasProvider(Boolean(provider))

      if (provider) {
        const accounts = await window.ethereum.request({method: 'eth_accounts'})
        refreshAccounts(accounts)
        window.ethereum.on('accountsChanged', refreshAccounts)
        window.ethereum.on('chainChanged', refreshChain)
      }
    }

    getProvider()

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', refreshAccounts)
        window.ethereum.removeListener('chainChanged', refreshChain)
      }
    }
  }, [])

  const updateWallet = async accounts => {
    setWallet({accounts})
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    await window.ethereum
      .request({
        method: 'eth_requestAccounts',
      })
      .then(accounts => {
        setError(false)
        updateWallet(accounts)
      })
      .catch(err => {
        setError(true)
        setErrorMessage(err.message)
      })
    setIsConnecting(false)
  }

  const disableConnect = Boolean(wallet) && isConnecting

  const renderBody = ({children}) => {
    if (!hasProvider) {
      return <h2>Install MetaMask</h2>
    } else if (wallet.accounts.length > 0) {
      return (
        <WalletContext.Provider value={{address: wallet.accounts[0], signer}}>
          {children}
        </WalletContext.Provider>
      )
    } else if (window.ethereum?.isMetaMask) {
      return (
        <>
          {wallet.accounts.length < 1 && (
            <button className="button" disabled={disableConnect} onClick={handleConnect}>
              Connect MetaMask
            </button>
          )}
          {error && (
            <div onClick={() => setError(false)}>
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
        </>
      )
    }
    return <h2>Something wen wrong</h2>
  }

  return <div className="wallet">{renderBody({children})}</div>
}
