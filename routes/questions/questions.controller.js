require('node-fetch')
require('cross-fetch/polyfill')
const {
  routeUtils,
  simpleRoute,
  saveSessionData,
} = require('./../../utils')


const fetchQuestion = (req, res, currentQuestionId) => {
  // fetch the data for the province question
  /* eslint-disable no-undef */
  return fetch(process.env.STRAPI_ENDPOINT + `/questions/${currentQuestionId}`).then(
    (questionResult) => {
      if(questionResult.ok){
        return questionResult.json()
      }
      else{
        res.status(500)
        res.render('500', {
          message: 'Question unavailable',
        })
      }
    },
  )
  .catch((err) => {
    res.status(500)
    res.render(
      '500', {
        message: err,
      },
    )
  })
}

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      let currentQuestionId = req.session.currentquestionid
      console.log(currentQuestionId)
      res.locals.simpleRoute = (name, locale) => simpleRoute(name, locale)
      const locale = res.locale

      // no existing question load the first question
      if(typeof currentQuestionId === "undefined"){
        req.session.currentquestionid = 1
        currentQuestionId = 1
      }

      fetchQuestion(req, res, currentQuestionId)
        .then(
          (data) => {
            const {
              id,
              name_en: nameEn,
              name_fr: nameFr,
              display_name_en: displayNameEn,
              display_name_fr: displayNameFr,
              type,
              description_en: descriptionEn,
              description_fr: descriptionFr,
              options,
            } = data

            req.session.currentquestion= nameEn
            req.session.currentquestionid = id

            if(!req.session.formdata){
              req.session.formdata = {}
              req.session.formdata[req.session.currentquestion] = ""
            }
            else if(req.session.formdata[req.session.currentquestion]){
              req.session.formdata[req.session.currentquestion] = ""
            }
            else{
              req.session.formdata[req.session.currentquestion] = req.session.formdata[req.session.currentquestion]
            }

            // generate the options for the radio button
            const viewOptions = options.map(
              (value) =>{
                if(locale === "fr"){
                  return {
                    value: value.name_fr,
                    text: value.display_name_fr || value.name_fr,
                  }
                }
                return {
                  value: value.name_en,
                  text: value.display_name_en || value.name_en,
                }
              },
            )

            let dataParams = {}
            if(locale === "fr"){
              dataParams = {
                display_name: displayNameFr || nameFr,
                question_name: nameFr,
                description: descriptionFr || "",
              }
            }
            else {
              dataParams = {
                display_name: displayNameEn || nameEn,
                question_name: nameEn,
                description: descriptionEn || "",
              }
            }

            dataParams.options = viewOptions
            dataParams.type = type

            return res.render(name, routeUtils.getViewData(
              req, dataParams,
            ))
          },
        )

    })
    .post((req, res) => {
      const currentQuestionId = req.session.currentquestionid
      const currentQuestionName = req.session.currentquestion
      const locale = res.locals
      const jsonData = JSON.parse(JSON.stringify(req.body))
      if (typeof currentQuestionId === "undefined" || typeof currentQuestionName === "undefined"){
        return res.redirect(res.locals.routePath('questions'))
      }
      else if(typeof currentQuestionName !== "undefined" && !jsonData[currentQuestionName]){
        req.session.flashmessage = {
          [currentQuestionName]: {
            msg: res.__("You must select one of the options listed below"),
          },
        }
        return res.redirect('back')
      }
      else{
        console.log("not")
        fetchQuestion(req, res, currentQuestionId)
          .then(
            (data) => {
              const { options, next_questions: nextQuestions} = data
              const responseValue = jsonData[currentQuestionName]
              const questionsFollowingOption = {}
              const optionsValue = options.map(
                (option) => {
                  const value = locale === "fr"? option.name_en : option.name_fr
                  questionsFollowingOption[value] = option.question_following_option
                  return value
                },
              )

              if(!optionsValue.includes(responseValue)){
                req.session.flashmessage = {
                  [currentQuestionName]: {
                    msg: res.__("The value you have specified is not valid"),
                  },
                }
                return res.redirect('back')
              }

              saveSessionData(req)

              if(questionsFollowingOption[responseValue]){
                req.session.currentquestionid = questionsFollowingOption[responseValue]
                return res.redirect(res.locals.routePath('questions'))
              }
              else if(nextQuestions && nextQuestions.length > 0 ){
                req.session.currentquestionid = nextQuestions[0].id
                return res.redirect(res.locals.routePath('questions'))
              }
              else{
                return res.redirect(res.locals.routePath('prepare'))
              }

            },
          )
      }
    })
}