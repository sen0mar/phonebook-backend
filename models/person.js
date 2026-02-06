const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;
if (!url) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}

console.log("connecting to", url);

mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
  number: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number. Format must be XX-XXXXXXX or XXX-XXXXXXX`,
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
