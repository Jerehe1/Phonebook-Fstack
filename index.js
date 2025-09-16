require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Person = require('./module/person')

const app = express()

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err.message))

app.use(express.static("dist"))
app.use(express.json())
morgan.token("body", request => JSON.stringify(request.body))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

const errorhandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorhandler)

app.get("/info", (request, response) => {
  Person.countDocuments({})
    .then(count => 
      response.send(
        `<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`
      )
    )
})

app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => response.json(persons))
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number is missing" })
  }

  Person.findOne({ name: body.name }).then(existing => {
    if (existing) {
      return response.status(400).json({ error: "Duplicate name" })
    }

    const person = new Person({ name: body.name, number: body.number })
    person.save()
      .then(saved => response.json(saved))
      .catch(error => next(error))
  })
})

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then(updatedPerson => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
