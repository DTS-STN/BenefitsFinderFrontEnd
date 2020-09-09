require("node-fetch")
require("cross-fetch/polyfill")

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
          throw new Error("Rules endpoint returned an invalid response")
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

const getAllBenefits = (locale = "en") => {
  /* eslint-disable-next-line no-undef */
  return fetch(process.env.STRAPI_ENDPOINT + "/benefits").then(
    (response) => {
      if(response.ok){
        return response.json()
      }
      else{
        throw new Error("Benefits endpoint returned an invalid response")
      }
    },
  ).then(
    (json) => {
      const benefitObj = {}
      if(Array.isArray(json) && json.length > 0){
        for(let i in json){
          i = json[i]
          if( i.benefit_id){
            benefitObj[i.benefit_id] = {
              id: i.benefit_id,
              header: i[`title_${locale}`],
              link: i[`info_link_${locale}`],
              linkText: i[`info_link_text_${locale}`],
              description: i[`description_${locale}`],
              features: Array.isArray(i.benefit_features) ? i.benefit_features.map(
                (feature) => {
                  return feature[`feature_name_${locale}`]
                },
              ): [],
            }
          }
        }
      }
      return benefitObj
    },
  )
}

module.exports = {
  getBenefits,
  getAllBenefits,
}
