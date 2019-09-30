const xls = require('xlsx')
const workbook = xls.readFile(`${__dirname}/../files/2019.xls`)
console.log(workbook.SheetNames)
const sheetNames = workbook.SheetNames
console.log(workbook.Sheets[sheetNames[0]])
sheetNames.forEach((sheetName) => {
})