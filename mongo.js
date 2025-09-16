require('dotenv').config()
const mongoose = require('mongoose')
const Person = require('./models/person')

const url = process.env.MONGODB_URI

if (process.argv.length < 3) {
  console.log("Please provide password in the URI")
  process.exit(1)
}

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => {
    if (process.argv.length === 3) {
      Person.find({}).then(result => {
        console.log("Phonebook:")
        result.forEach(p => console.log(`${p.name} ${p.number}`))
        mongoose.connection.close()
      })
    } else if (process.argv.length === 5) {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })

      person.save().then(() => {
        console.log(`Added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
      })
    }
  })
  .catch(err => console.error("Mongo connection error:", err.message))
