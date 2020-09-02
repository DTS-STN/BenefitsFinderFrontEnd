const uuidv4 = require('uuid').v4

const session = (req, res, next) => {
  // set a unique user id per session
  if (!req.session.id) req.session.id = uuidv4()

  // add user session req.locals so that the logger has access to it
  req.locals = { session: req.session }

  // remove the back button if the session has no history
  if (
    req.session === undefined ||
    req.session.previousquestionid === undefined ||
    req.session.previousquestionid === req.session.currentquestionid)
  {
    console.log(req.session.previousquestionid)
    res.locals.hideBackButton = true
  }
  else{
    console.log(req.session.previousquestionid)
    console.log(req.session.currentquestionid)
  }


  next()
}

module.exports = {
  session,
}
