import {useState, useContext} from 'react'
import {WalletContext} from './context'
import server from './server'

function Transfer({balance, setBalance}) {
  const {signer} = useContext(WalletContext)
  const [sendAmount, setSendAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  const setValue = setter => evt => setter(evt.target.value)

  async function transfer(evt) {
    if (balance < parseInt(sendAmount)) {
      alert("'Not enough funds!")
      return
    }

    evt.preventDefault()
    try {
      const {
        data: {nonce},
      } = await server.get('/nonce')
      const message = `Transfer ${sendAmount} to ${recipient} with nonce ${nonce}`
      const signature = await signer.signMessage(message)
      const {
        data: {balance},
      } = await server.post(`send`, {
        signature,
        message,
        amount: parseInt(sendAmount),
        recipient,
        nonce,
      })
      setBalance(balance)
    } catch (ex) {
      alert(ex.response.data.message)
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input
        disabled={!recipient || !sendAmount}
        type="submit"
        className="button"
        value="Transfer"
      />
    </form>
  )
}

export default Transfer
