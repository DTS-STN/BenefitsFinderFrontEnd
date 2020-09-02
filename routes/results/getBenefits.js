require("node-fetch")
require("cross-fetch/polyfill")
const glob = require('glob')
const path = require('path')

/*
This method checks to see if an input object matches a pattern
This pattern can have scalar values, or arrays as the item being matched
If it's a scalar we need an exact match, if it's an array we only care if the value
matches one of the items in the output.
*/
function match(input, pattern, result) {
  const keys = Object.keys(pattern)

  const value = keys.reduce((previousIterationResult, key) => {
    const patternValueToMatch = pattern[key]
    const actualValue = input[key]

    // If the value is an array we only care if we match one item
    if (typeof patternValueToMatch === typeof []) {
      /* algorithm is as follows:
        Logical OR the result of the current match against the previous
        Since all we care is if the value we are matching is equal to
        one item in the patternValueToMatch array we are iterating through
      */
      return patternValueToMatch.reduce((p, c) => p || c === actualValue, false)
    }

    const matchResult = patternValueToMatch === actualValue
    return previousIterationResult && matchResult
  }, true)

  if (value === true) {
    return result
  }

  return undefined
}

const getBenefits = (data, featureFlags) => {
  /* eslint-disable-next-line no-undef */
  return fetch(process.env.STRAPI_ENDPOINT + "/rules")
    .then(
      (benefitsResponse) =>{
        if(benefitsResponse.ok){
          return benefitsResponse.json()
        }
        else{
          throw new Error("Benefits endpoint returned an invalid response")
        }
      },
  )
    .then(
      (benefitsData) =>{
        const results = []
        if(Array.isArray(benefitsData) && benefitsData.length > 0){
          for(const i in benefitsData){
            const benefitsObj = benefitsData[i]
            if(Object.prototype.hasOwnProperty.call(benefitsObj, "rule_definition") && Object.prototype.hasOwnProperty.call(benefitsObj, "benefit_name")){
              results.push(
                match(
                  data,
                  benefitsObj.rule_definition,
                  benefitsObj.benefit_name,
                ),
              )
            }
          }
        }
        return results.filter((v) => typeof v !== "undefined")
      },
    )


}

const getProvincialBenefits = (data) => {
  return data.province ? 'province-' + data.province : false
}

const getAllBenefits = (featureFlags) => {
  const benefitList = []

  let ignore
  if (featureFlags.enableDtc) {
    ignore = ['province-*', 'dtc_*.njk']
  } else {
    ignore = ['province-*', 'dtc*.njk']
  }

  // Get a list of all the benefit cards
  // Ignore provincial benefits and the dtc variants
  const files = glob.sync('**/*.njk', {
    cwd: path.join(__dirname, '../../views/benefits'),
    ignore,
  })

  // Grab the benefit name portion of the filename
  files.forEach((file) => {
    const fileParts = file.split('-')
    benefitList.push(fileParts[0])
  })

  // We just the unique items in the list
  const benefitsFullList = benefitList.filter(function (item, pos) {
    return benefitList.indexOf(item) === pos
  })

  return benefitsFullList
}

module.exports = {
  getBenefits,
  getProvincialBenefits,
  getAllBenefits,
}
