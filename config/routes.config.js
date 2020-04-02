// 1) add your route(s) here ⬇️
const routes = [
  { name: 'start', path: { en: '/start', fr: '/debut' } },
  { name: 'question-lost-job', path: { en: '/lost-job', fr: '/lost-job' } },

  // main sorting
  { name: 'question-your-situation-no-income', path: { en: '/your-situation/no-income', fr: '/your-situation/no-income' } },
  { name: 'question-your-situation-some-income', path: { en: '/your-situation/some-income', fr: '/your-situation/some-income' } },
  { name: 'question-your-situation-unchanged-income', path: { en: '/your-situation/unchanged-income', fr: '/your-situation/unchanged-income' } },
  
  // everyone ends up here (not sure of order?)
  { name: 'question-mortgage-payments', path: { en: '/mortgage-payments', fr: '/paiement-hypothecaire' } },
  { name: 'question-ccb', path: { en: '/CCB', fr: '/ARC' } },
  { name: 'question-gst', path: { en: '/GST', fr: '/TPS' } },
  { name: 'question-student-debt', path: { en: '/student-debt', fr: '/dette-des-etudiants' } },

  { name: 'results', path: { en: '/results', fr: '/resultats' } },

  // retirees only
  { name: 'question-rrif', path: { en: '/RRIF', fr: '/FERR' } },

  // 3a/b lost income fork
  { name: 'question-gross-income', path: { en: '/gross-income', fr: '/revenu-brut' } },
  { name: 'question-days-stopped-working', path: { en: '/days-stopped-working', fr: '/jours-ont-cesse-de-fonctionner' } },
]

const locales = ['en', 'fr']

// note: you can define and export a custom configRoutes function here
// see route.helpers.js which is where the default one is defined
// if configRoutes is defined here it will be used in pacle of the default

module.exports = {
  routes,
  locales,
}
