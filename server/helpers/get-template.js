/**
 * Created by sandeep on 23/02/21.
 */
const Template = require("../template/template.model");

const getTemplate = (type, appId) =>{
  console.log("type--->>>>",type)
  console.log("appId--->>>>",appId)
  return new Promise((resolve, reject) => {
    const condition = {$and: [{ type: type }, { appId: { $in: [appId] } }]}
    Template.getTemplate(condition)
      .then((templateResponse) => {
        console.log("templateResponse -> templateResponse -> template", templateResponse)
        if (templateResponse && templateResponse.length !== 0)
          //console.log(templateResponse+"**template response**");
          resolve(templateResponse);
        else reject("No template found");
      })
      .catch((e) => reject(e));
  });
};

module.exports = getTemplate;
