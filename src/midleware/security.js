// import { getEncryptionKey } from './common'
const crypto = require('crypto')
// mMSiIHAaJoctRbanA19rXmUqWXXqV3M8eaGb9OvQCjk=
const SIGN_SECRET = process.env.SECRET_KEY || 'dfgdfhfgnhhlksjfdlgdfgksdfgdfgsdfhdfghf'
console.log('SECREt', SIGN_SECRET)
const ENCRYPTION_KEY = Buffer.from(SIGN_SECRET.slice(0, 33))
const ALGORITHM = 'aes-256-ctr'
const IV_LENGTH = 16
const KEY_SIZE = 32

function encrypt256ctr (text, key = null) {
  const encryptionKey = key ? Buffer.from(getEncryptionKey(key, KEY_SIZE)) : ENCRYPTION_KEY
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(encryptionKey, 'hex'), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decrypt256ctr (text, key = null) {
  try {
    const encryptionKey = key ? Buffer.from(getEncryptionKey(key, KEY_SIZE)) : ENCRYPTION_KEY
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(encryptionKey, 'hex'), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error) {
    return null
  }
}

function getEncryptionKey (key, length = 32) {
  if (key.length < length) {
    let i = 0
    const keyLength = key.length
    while (key.length !== 32) {
      key = `${key}${key[i]}`
      i = (i + 1) % keyLength
    }
    return key
  }
  return key.substr(0, length)
}
function decodTest (req, res) {
  const { data } = req.body
  console.log('Decode data: ', data)
  let decodedData = decrypt256ctr(data, SIGN_SECRET.slice(0, 32))
  decodedData = JSON.parse(decodedData)
  // console.log('Decode data: ', typeof decodedData)
  return res.status(200).json({ result: JSON.parse(decodedData) })
}
function encodTest (req, res) {
  const data = req.body
  console.log('Encode data: ', req.body)
  const encodedData = signData(JSON.stringify(data), SIGN_SECRET.slice(0, 32))
  return res.status(200).json({ data: encodedData })
}
function secure (req, res, next) {
  const { data } = req.body
    console.log('Req: ', req)
  //   const enc = encrypt256ctr(JSON.stringify(body), SIGN_SECRET.slice(0, 32))
  const decode = decrypt256ctr(data, SIGN_SECRET.slice(0, 32))
  console.log('>>>>>>>>>>', decode)
  // req.decode = {data: JSON.parse(decode)}
  req.decode = decode
  console.log('>>>>>>>>>>', req.decode)
  return next()
}
function signData (data) {
  return encrypt256ctr(JSON.stringify(data), SIGN_SECRET.slice(0, 32))
}

module.exports = { secure, signData, decodTest, encodTest }
