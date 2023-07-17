const mongoose = require('mongoose')
// const config = require('./config.json')

mongoPath=process.env.MONGO
// mongoPath=config.mongoPath
module.exports = async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));
  return mongoose
}