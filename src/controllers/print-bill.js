const router = require('express').Router()
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const logger = require('../midleware/logger');

router.post('/print-bill', printBill);

async function printBill(data) {
  const requestBody = data.body
  for (const bill of requestBody) {
    bill.today = new Date().toISOString().replace('T',' ') 
    sendPrinter(bill)
  }
 
  return data.res.status(200).json({result: 'Printer done'})
}

async function sendPrinter(data) {
  logger.log('debug',"Print bill function called")
  let PRINTER = new ThermalPrinter({
    type: PrinterTypes.EPSON,                                  // Printer type: 'star' or 'epson'
    interface: '//localhost/SLK-TS400' ,
    width:  42,
    // driver: require('printer'),                   // Printer interface
    characterSet: CharacterSet.PC866_CYRILLIC2,                      // Printer character set - default: SLOVENIA
    removeSpecialCharacters: false,                           // Removes special characters - default: false
    breakLine: BreakLine.NONE,                                // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options:{                                                 // Additional options
      timeout: 5000                                           // Connection timeout (ms) [applicable only for network printers] - default: 3000
    }
  });

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
        PRINTER.bold()
        PRINTER.alignLeft()
        PRINTER.println('Хvргэх хаяг: ' + data.address.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'),)
        PRINTER.println('Нэмэлт мэдээлэл: ' + data.description.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'),)
        PRINTER.newLine()
        PRINTER.println('Огноо: ' + data.today)
        PRINTER.newLine()
        PRINTER.drawLine()

        for (const item of data.items) {
          PRINTER.leftRight(item.name.replace(/Ө/g, 'Є').replace(/ө/g, 'є').replace(/Ү/g, 'V').replace(/ү/g, 'v'), item.quantity)
        }
    
        PRINTER.drawLine()
        PRINTER.setTextQuadArea()
        PRINTER.println('Нийт хоол: ' + data.totalItems)
        PRINTER.newLine()
        PRINTER.println('Нийт vнэ: ' + data.totalAmount)
        PRINTER.newLine()
        PRINTER.printQR(data.title, { cellSize: 8, correction: 'Q', model: 2})
        PRINTER.setTextNormal()
        PRINTER.print(data.title)
        PRINTER.beep()
        PRINTER.cut()
    
    const result = await PRINTER.execute()
      return result
    } catch(e) {
        logger.log('debug','Catched ERROR: ' + e)
      throw e
    }
}

module.exports = router