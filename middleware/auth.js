const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req,res,next) => {
   try {
       const token = req.cookies['session-token']
       const decoded = jwt.verify(token, 'spiderman')
       const user = await User.findOne({ _id: decoded._id })

       if (!user) {
           throw new Error()
       }
       req.token = token
       req.user = user
       next()
   } catch (error) {
       res.status(401).send('Error: Please authenticate..')
   }
}

module.exports = auth