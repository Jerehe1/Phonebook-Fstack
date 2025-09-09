 const express = require('express')
 const morgan = require('morgan')
 const app = express()

 app.use(express.static("dist"))

 app.use(express.json())

 morgan.token("body", (request) => JSON.stringify(request.body))

 app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms :body")
 )

 let personsData =
[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get("/api/persons" , (request, response) => {
    response.json(personsData)
})

app.get("/info", (request, response) => {
    const peopleNum = personsData.length
    const currentDate = new Date()
    response.send(`<p>Phonebook has info for ${peopleNum} People</p><p>${currentDate}</p>`)
})

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id
    const person = personsData.find(p => p.id === id)

    if (person) {
    response.json(person) 
    } else {
        response.status(404).end()
    }
})

app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id
    personsData = personsData.filter(person => person.id !== id )
    response.status(204).end()
})

const generateId = () => {
    const maxId = personsData.length > 0 
    ? Math.max(...personsData.map(p => Number(p.id)))
    : 0
    return maxId + 1
}

app.post("/api/persons", (request, response) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: "name or number is missing"
        })
    } else {
    if(personsData.find(p => p.name === body.name)) {
        return response.status(400).json({
            error: "Duplicate name"
        })
    }
    }
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    personsData = personsData.concat(person)
    response.status(201).json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log("server running on port" + PORT)
})