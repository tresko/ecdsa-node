import {useContext, useEffect} from 'react'
import {WalletContext} from './context'
import server from './server'

function Balance({balance, setBalance}) {
  const wallet = useContext(WalletContext)

  useEffect(() => {
    if (wallet.address) {
      server
        .get(`balance/${wallet.address}`)
        .then(({data: {balance}}) => {
          setBalance(balance)
        })
        .catch(() => {
          setBalance(0)
        })
    }
  }, [wallet.address])

  return (
    <div className="container balance-widget">
      <h1>Your Wallet</h1>
      <div className="item">Address: {wallet.address}</div>
      <div className="item">Balance: {balance}</div>
    </div>
  )
}

export default Balance
