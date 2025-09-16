const mongoose = require('mongoose')

const personsSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    validate: {
      validator: function(v) {
        const parts = v.split('-')
        if (parts.length !== 2) return false

        const [first, second] = parts;

        
        if (!/^\d{2,3}$/.test(first)) return false;
        if (!/^\d{2,}$/.test(second)) return false;
        

        return true;
    },      message: props => `${props.value} is not a valid phone number!`
    }
  }
});

personsSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personsSchema)
