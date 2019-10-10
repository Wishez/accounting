const transactionsFromSheets = require('../api/transactionsFromSheets')
const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const getId = require('lodash/uniqueId')

const getResponse = (config = {}) => {
  const {
    data = null,
    status = 'OK',
    message = null,
  } = config
  return {
    meta: {
      status,
      message,
    },
    data,
  }
}

const getBadResponse = (res, statusCode, message) => {
  res.status(statusCode)
  res.json(getResponse({
    status: "ERROR",
    message: message,
  }))
}

router.get('/transactions/create/status', (req, res) => {
  const { processId } = req.query
  if (!processId) return getBadResponse(res, 400, '"processId" must be in the request\'s parameters')

  const processStatus = transactionsFromSheets.getProcessStatus(processId)
  if (processStatus) {
    res.json(getResponse({
      data: processStatus,
    }))

    if (processStatus.isDone) transactionsFromSheets.removeProcessStatus(processId)
  } else res.json(getBadResponse(res, 400, `Not process with id: ${processStatus}`))
})

router.post('/transactions/create', (req, res) => {
  const authorizationHeader = req.headers.authorization || ''
  const token = authorizationHeader.split(' ')[1]
  if (!token) return getBadResponse(res, 401, "Login before make actions")

  const file = req.files.file
  const fileName = req.files.file.name
  const fileExtention = fileName.slice(fileName.lastIndexOf('.') + 1)
  const isExcelFile = ['xls', 'xlsx'].some((type) => type === fileExtention)
  if (isExcelFile) {
    const tempFilePath = path.resolve(__dirname, `../files/${fileName}`)
    fs.writeFile(tempFilePath, Buffer.from(file.data), (error) => {
      if (error) return getBadResponse(res, 400, error.message)

      const processId = getId('createTransactions')
      transactionsFromSheets.create(tempFilePath, token, processId)
      res.json(getResponse({
        data: processId,
      }))
    })

  } else return getBadResponse(res, 400, "Not excel file")
})

module.exports = router
