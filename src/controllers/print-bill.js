const router = require('express').Router()
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer')
const logger = require('../util/logger')
const { signData } = require('../midleware/security')

const eigthHoursInMill = 8 * 60 * 60 * 1000
router.post('/print-bill', printBill)
router.post('/kitchen-bill', kitchenBill)

async function printBill ({ decode, res }) {
  const requestBody = JSON.parse(decode)
  console.log('Req body type: ', typeof requestBody)
  try {
    for (const bill of requestBody) {
      const today = new Date()
      today.setTime(today.getTime() + eigthHoursInMill)
      bill.today = today.toISOString().replace('T', ' ').slice(0, 19)
      await sendPrinter(bill)
    }
  } catch (err) {
    logger.log('error', err)
    console.log('error', err)
    // throw err
    return res.status(200).json({ result: err })
  }

  // console.log('Print bill body: ', requestBody)
  return res.status(200).json({ result: signData('Printer done') })
}

async function kitchenBill ({ decode, res }) {
  const requestBody = JSON.parse(decode)

  try {
    for (const bill of requestBody) {
      const today = new Date()
      today.setTime(today.getTime() + eigthHoursInMill)
      console.log('Today', today)
      bill.today = today.toISOString().replace('T', ' ').slice(0, 19)
      console.log('Bill', bill)
      await sendKitchenPrint(bill)
    }
  } catch (err) {
    logger.log('error', err)
    console.log('error', err)
    // throw err
    return res.status(200).json({ result: err })
  }
  return res.status(200).json({ result: signData('Printer done') })
}

async function sendPrinter (data) {
  logger.log('debug', 'Print bill function called')
  const printerInterface = '//localhost/' + process.env.KITCHEN_PRINTER_INTERFACE || 'SLK-TS400'
  const PRINTER = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
    interface: printerInterface,
    width: 42,
    // driver: require('printer'),                   // Printer interface
    characterSet: CharacterSet.PC866_CYRILLIC2, // Printer character set - default: SLOVENIA
    removeSpecialCharacters: false, // Removes special characters - default: false
    breakLine: BreakLine.NONE, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options: { // Additional options
      timeout: 5000 // Connection timeout (ms) [applicable only for network printers] - default: 3000
    }
  })

  console.log('Req: ', data)

  try {
    // const isConn = await PRINTER.isPrinterConnected()
    // if (!isConn) {
    //   throw 'Printer not connected!'
    // }
    PRINTER.clear()
    PRINTER.alignCenter()
    PRINTER.setTextQuadArea()
    PRINTER.bold()
    PRINTER.println(data.title)
    PRINTER.newLine()
    PRINTER.setTextNormal()

    PRINTER.alignLeft()
    PRINTER.println(data.billType)
    PRINTER.bold(true)
    // PRINTER.println('Bill type: ' + data.address.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'),)
    PRINTER.println('Хоол авах цаг: ' + (data.schedule ? data.schedule : '='))
    PRINTER.println('Хэрэглэгчийн утас: ' + data.phone)
    PRINTER.println('Хvргэх хаяг: ' + data.address.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'))
    PRINTER.println('Нэмэлт мэдээлэл: ' + data.description.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'))
    PRINTER.newLine()
    PRINTER.println('Огноо: ' + data.today)
    PRINTER.newLine()
    PRINTER.drawLine()
    PRINTER.setTextDoubleHeight()
    for (const item of data.items) {
      PRINTER.leftRight(item.name.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'), item.qty)
    }
    PRINTER.setTextNormal()
    PRINTER.drawLine()
    PRINTER.setTextQuadArea()
    PRINTER.println('Нийт хоол: ' + data.totalItems)
    PRINTER.newLine()
    // PRINTER.println('Нийт vнэ: ' + data.totalAmount)
    // PRINTER.newLine()
    PRINTER.printQR(data.title, { cellSize: 8, correction: 'Q', model: 2 })
    // PRINTER.setTextNormal()
    PRINTER.print(data.billType)
    PRINTER.beep()
    PRINTER.cut()

    const result = await PRINTER.execute()
    return result
  } catch (e) {
    logger.log('debug', 'Catched ERROR: ' + e)
    throw e
  }
}

async function sendKitchenPrint (data) {
  logger.log('debug', 'Kitchen bill function called')
  console.log('kitchen bill started')
  const printerInterface = '//localhost/' + process.env.KITCHEN_PRINTER_INTERFACE || 'SLK-TS400'
  const PRINTER = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
    interface: printerInterface,
    width: 42,
    // driver: require('printer'),                   // Printer interface
    characterSet: CharacterSet.PC866_CYRILLIC2, // Printer character set - default: SLOVENIA
    removeSpecialCharacters: false, // Removes special characters - default: false
    breakLine: BreakLine.NONE, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options: { // Additional options
      timeout: 5000 // Connection timeout (ms) [applicable only for network printers] - default: 3000
    }
  })

  console.log('Req shuu: ', data)
console.log('PRINTER: ',PRINTER)
  try {
    PRINTER.clear()
    PRINTER.alignLeft()
    PRINTER.println('Ubeats cloud kitchen')
    PRINTER.println(data.today)
    PRINTER.drawLine()
    PRINTER.setTextQuadArea()
    PRINTER.print(data.kitchen.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'))
    // PRINTER.println('Bill type: ' + data.address.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'),)
    PRINTER.newLine()
    PRINTER.setTextNormal()
    PRINTER.println('Хоол авах цаг: ' + (data.schedule ? data.schedule : '='))
    PRINTER.newLine()
    PRINTER.bold(true)
    PRINTER.setTextDoubleHeight()
    for (const item of data.items) {
      console.log('Item: ', item)
      PRINTER.leftRight(item.name.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'), item.qty)
    }
    PRINTER.drawLine()
    PRINTER.newLine()
    PRINTER.println('Бvгд: ' + data.totalItems)
    PRINTER.beep()
    PRINTER.cut()
console.log('Finish....')
    const result = await PRINTER.execute()
    console.log('Finish1111....')
    return result
  } catch (e) {
    logger.log('debug', 'Catched ERROR: ' + e)
    console.log('debug', 'Catched ERROR: ' + e)
    throw e
  }
}

module.exports = router
