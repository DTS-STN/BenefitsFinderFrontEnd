const { routeUtils, getSessionData } = require('./../../utils')
const { Schema } = require('./schema.js')
const { getBenefits } = require('./getBenefits');

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      const data = getSessionData(req)
      const benefits = ['ccb_payment', 'cerb', 'ei_regular_cerb', 'ei_sickness_cerb', 'ei_workshare', 'mortgage_deferral', 'rent_help', 'rrif', 'student_loan']; // getBenefits(data);
      let title = res.__n('results_title', benefits.length);

      if (benefits.length === 0) {
        title = res.__('results_title_no_results');
      }

      res.render(name, routeUtils.getViewData(req, {
        benefits: benefits,
        no_results: benefits.length === 0,
        hideBackButton: true,
        title: title,
      }))
    })
    .post(route.applySchema(Schema), route.doRedirect())
}
