// Node.js require:
const fs = require('fs')
const Ajv = require('ajv')
const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()
const ajv = new Ajv()

const defaultValidate = ajv.compile(
  JSON.parse(fs.readFileSync('./assets/validator.json'))
)

router.use(bodyParser.json())

router.post('/', bodyParser.json(), function(req, res) {
  console.log(req.body)
  const valid = defaultValidate(req.body)
  if (!valid) res.status(400).send({ error: defaultValidate.errors })
  else res.status(200).send()
})

module.exports = router
