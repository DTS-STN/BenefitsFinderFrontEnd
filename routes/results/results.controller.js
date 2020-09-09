const { routeUtils, getSessionData, simpleRoute } = require('./../../utils')
const { Schema } = require('./schema.js')
const { getBenefits, getAllBenefits } = require('./getBenefits')
const _ = require('lodash')


const getData = (req, res) => {
  /**
   * If there's querystring data use it,
   * otherwise get it from the session.
   */
  if (req.query === undefined || _.isEmpty(req.query)) {
    return getSessionData(req);
  }
  try {
    return JSON.parse(Buffer.from(req.query.q, 'base64').toString())
  } catch (err) {
    res.locals.log(`Thrown error: ${JSON.stringify(err)} Invalid QueryString ${JSON.stringify(req.query)}`)
    return {}
  }
}

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      const data = getData(req, res);

      res.locals.simpleRoute = (name, locale) => simpleRoute(name, locale)

      return Promise.all([getBenefits(data, req.locals.featureFlags), getAllBenefits(res.locale)])
        .then(
          (results) => {
            const benefitsApplicable = results[0]
            const allBenefits = results[1]

            const benefits = []
            const benefitNames = []

            for(let benefit in benefitsApplicable ){
              benefit = benefitsApplicable[benefit]
              if(allBenefits[benefit]){
                benefits.push(
                  allBenefits[benefit],
                )
                benefitNames.push(benefit)
              }
            }

            const unavailableBenefits = Object.keys(allBenefits).filter(
              (value) => !benefitNames.includes(value) && !value.startsWith("province-"),
            ).map(
              (value) => {
                return allBenefits[
                  value
                ]
              },
            )

            const provincial = data.province ? allBenefits["province-" + data.province]: undefined

            let title = res.__n('results_title', benefits.length);

            if (benefits.length === 0) {
              title = res.__('results_title_no_results');
            }

            res.render(name, routeUtils.getViewData(req, {
              benefits: benefits,
              unavailableBenefits: unavailableBenefits,
              provincial: provincial,
              no_results: benefits.length === 0,
              title: title,
              data: data,
            }))
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

    })
    .post(route.applySchema(Schema), route.doRedirect())
}