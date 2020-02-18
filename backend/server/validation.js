// Node.js require:
const fs = require('fs')
const Ajv = require('ajv')
const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()
const ajv = new Ajv()

const outterValidator = ajv.compile(
  JSON.parse(fs.readFileSync('./assets/validator.json'))
)

const componentValidators = {}

fs.readdir('./components', function(err, files) {
  if (err) {
    return -1
  }

  files.forEach((file) => {
    if (file.endsWith('.json')) {
      componentValidators[file.substring(0, file.length - 5)] = ajv.compile(
        JSON.parse(fs.readFileSync('./components/' + file))
      )
    }
  })
})

router.use(bodyParser.json())

router.post('/', bodyParser.json(), function(req, res) {
  let valid = outterValidator(req.body)
  if (!valid) res.status(400).send({ error: outterValidator.errors })
  else {
    let slides = []
    req.body.sections.forEach((section) => {
      slides = slides.concat(section.slides)
    })
    slides.forEach((slide) => {
      if (valid) {
        if (componentValidators[slide.component]) {
          valid = componentValidators[slide.component](slide)
          if (!valid) {
            console.log(componentValidators[slide.component](slide))
            res.status(400).send({
              error: componentValidators[slide.component].errors
            })
          }
        } else {
          valid = false
          res.status(400).send({
            error: 'Component type "' + slide.component + '" does not exist'
          })
        }
      }
    })
    res.status(200).send()
  }
})

module.exports = router
