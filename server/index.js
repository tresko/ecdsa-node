const express = require('express')
const app = express()
const cors = require('cors')
const uuid = require('uuid')
const {addSeconds, isBefore} = require('date-fns')
const {verifyMessage} = require('ethers')

const port = 3042

app.use(cors())
app.use(express.json())

const balances = {
  '0x1': 100,
  '0x2': 50,
  '0x3': 75,
  '0x227913fcfc29902fea568fa7f3f40be7a64556bf': 120,
}

const nonces = {}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params
  const balance = balances[address] || 0
  res.send({balance})
})

app.get('/nonce', (req, res) => {
  const nonce = uuid.v4()
  nonces[nonce] = addSeconds(new Date(), 30)
  res.send({nonce})
})

app.post('/send', (req, res) => {
  let {signature, recipient, amount, message, nonce} = req.body
  if (!nonces[nonce]) {
    res.status(400).send({message: 'Nonce is missing!'})
    return
  } else if (isBefore(nonces[nonce], new Date())) {
    res.status(400).send({message: 'Nonce has expired!'})
    return
  }

  recipient = recipient.toLowerCase()

  const sender = decodeSignature(message, signature)

  setInitialBalance(sender)
  setInitialBalance(recipient)

  if (balances[sender] < amount) {
    res.status(400).send({message: 'Not enough funds!'})
  } else {
    balances[sender] -= amount
    balances[recipient] += amount
    res.send({balance: balances[sender]})
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
})

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0
  }
}

function decodeSignature(message, signature) {
  return verifyMessage(message, signature).toLowerCase()
}
