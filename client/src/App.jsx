import Wallet from './Wallet'
import Balance from './Balance'
import Transfer from './Transfer'
import './App.scss'
import {useState} from 'react'

function App() {
  const [balance, setBalance] = useState(0)

  return (
    <Wallet>
      <div className="app">
        <Balance balance={balance} setBalance={setBalance} />
        <Transfer balance={balance} setBalance={setBalance} />
      </div>
    </Wallet>
  )
}

export default App
