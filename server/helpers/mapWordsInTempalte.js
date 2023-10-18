 const mapWordsInTempalte = (template,data) =>{
  console.log("mapWordsInTempalte obj sent --->>>>",data);
    let templateMsg;
    var mapObj = {
      "%name": data.userName,
      "%date": data.bookingDate,
      "%time" : data.bookingTime,
      "%bookingType": data.booking_type,
      "%otp": data.otp,
      // "{#var#}": data.otp,
      "%tags":data.tags,
      "%phonenumber":18002588121,
      "%link": data.meetingLink
    };
    templateMsg = template.replace(/%name|%date|%bookingType|%time|%otp|%tags|%link|%phonenumber/gi, function (
      matched
    ) {
      return mapObj[matched];
    });
    return templateMsg;
}

module.exports = mapWordsInTempalte;
