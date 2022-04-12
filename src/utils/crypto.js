const aes = require('aes-js')
const bcrypt = require('bcryptjs')

const key = aes.utils.utf8.toBytes(process.env.APP_KEY)

if (key.length !== 32) throw new Error('Invalid APP_KEY. Must be 256-bit / 32 bytes.')

exports.encrypt = (text) => {
    const bytesInfo = aes.utils.utf8.toBytes(text)
    const aesCTR = new aes.ModeOfOperation.ctr(key)
    const encryptedBytes = aesCTR.encrypt(bytesInfo)
    return aes.utils.hex.fromBytes(encryptedBytes)
}

exports.decrypt = (encryptedHex) => {
    const encryptedBytes = aes.utils.hex.toBytes(encryptedHex)
    const aesCTR = new aes.ModeOfOperation.ctr(key)
    const decryptedBytes = aesCTR.decrypt(encryptedBytes)
    return aes.utils.utf8.fromBytes(decryptedBytes)
}

exports.hashPassword = password => bcrypt.hashSync(password)

exports.checkPassword = (password, hash) => bcrypt.compareSync(password, hash)
