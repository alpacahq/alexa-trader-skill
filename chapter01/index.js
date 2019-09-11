const Alexa = require('ask-sdk-core');
const Alpaca = require('@alpacahq/alpaca-trade-api');

const keyId = "KEY_ID_HERE";
const secretKey = "SECRET_KEY_HERE";

const stock_dict = [
  {"abbVie": "ABBV"},
  {"apple": "AAPL"},
  {"activision blizzard": "ATVI"},
  {"ak steel": "AKS"},
  {"alibaba": "BABA"},
  {"alphabet": "GOOGL"},
  {"amazon": "AMZN"},
  {"amd": "AMD"},
  {"aphria": "APHA"},
  {"at&t": "T"},
  {"acb": "ACB"},
  {"bank of america": "BAC"},
  {"berkshire hathaway": "BRK.B"},
  {"beyond meat": "BYND"},
  {"bilibili": "BILI"},
  {"boeing": "BA"},
  {"canopy growth": "CGC"},
  {"cara therapeutics": "CARA"},
  {"catalyst pharmaceuticals": "CPRX"},
  {"chesapeake energy": "CHK"},
  {"cisco": "CSCO"},
  {"coca-cola": "KO"},
  {"corbus pharmaceuticals": "CRBP"},
  {"costco": "COST"},
  {"crispr": "CRSP"},
  {"cronos group": "CRON"},
  {"cvs": "CVS"},
  {"denbury": "DNR"},
  {"disney": "DIS"},
  {"dropbox": "DBX"},
  {"enphase energy": "ENPH"},
  {"etfmg alternative harvest": "MJ"},
  {"facebook": "FB"},
  {"fitbit": "FIT"},
  {"ford": "F"},
  {"gE": "GE"},
  {"global x robotics & artificial intelligence etf": "BOTZ"},
  {"glu mobile": "GLUU"},
  {"gm": "GM"},
  {"gopro": "GPRO"},
  {"groupon": "GRPN"},
  {"hexo": "HEXO"},
  {"intel": "INTC"},
  {"iqiyi": "IQ"},
  {"jd dot com": "JD"},
  {"johnson and johnson": "JNJ"},
  {"jpmorgan chase": "JPM"},
  {"kraft foods": "KHC"},
  {"luckin coffee": "LK"},
  {"lyft": "LYFT"},
  {"micron technology": "MU"},
  {"microsoft": "MSFT"},
  {"neptune wellness": "NEPT"},
  {"netflix": "NFLX"},
  {"new residential investment": "NRZ"},
  {"nike": "NKE"},
  {"nintendo": "Nintendo"},
  {"nio": "NIO"},
  {"nokia": "NOK"},
  {"nvidia": "NVDA"},
  {"paypal": "PYPL"},
  {"pfizer": "PFE"},
  {"pg&e": "PCG"},
  {"pinterest": "PINS"},
  {"plug power": "PLUG"},
  {"qualcomm": "QCOM"},
  {"roku": "ROKU"},
  {"salesforce": "CRM"},
  {"shopify": "SHOP"},
  {"sirius xm": "SIRI"},
  {"snap": "SNAP"},
  {"sony": "SNE"},
  {"southwest airlines": "LUV"},
  {"spdr s&p 500 etf": "SPY"},
  {"spotify": "SPOT"},
  {"sprint": "S"},
  {"square": "SQ"},
  {"starbucks": "SBUX"},
  {"stitch fix": "SFIX"},
  {"sunpower": "SPWR"},
  {"target": "TGT"},
  {"tencent": "TCEHY"},
  {"tesla": "TSLA"},
  {"teva pharmaceutical": "TEVA"},
  {"tilray": "tlry"},
  {"twilio": "twlo"},
  {"twitter": "twtr"},
  {"uber": "UBER"},
  {"under armour": "UAA"},
  {"vanguard s&p 500 etf": "VOO"},
  {"vanguard total stock market etf": "VTI"},
  {"verizon": "VZ"},
  {"viking therapeutics": "VKTX"},
  {"visa": "V"},
  {"vivint solar": "VSLR"},
  {"walmart": "WMT"},
  {"yeti": "YETI"},
  {"zynga": "ZYNGA"}
]

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'The Alpaca skill has been initiated.  Tell me to do something!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
const MarketOrderIntentHandler = {
  // Triggers when user invokes a market order
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarketOrderIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    /// Format inputs
    let input_stock = slots['stock'].value.toLowerCase()
    let stock = ""

    for(let i = 0; i < stock_dict.length; i++) {
      if(stock_dict[i][input_stock]) {
        stock = stock_dict[i][input_stock]
      }
    }
    if(stock == "") {
      stock = input_stock.split(" ").join("").split(".").join("").toUpperCase()
    }
    
    let valid_stock = false
    for(let j = 0; j < stock_dict.length; j++) {
      for(let key in stock_dict[j]) {
        if(stock_dict[j][key] == stock) {
          valid_stock = true
          break
        }
      }
    }
    if(!valid_stock) {
      return handlerInput.responseBuilder
      .speak(`Error: Invalid stock.  Stock ${stock} is not able to be traded.`)
      .getResponse();
    }
    if(slots['side'].value == "by") slots['side'].value = "buy";

    // Submit the market order using the Alpaca trading api
    let resp = await api.createOrder({
      symbol: stock,
      qty: parseInt(slots['quantity'].value),
      side: slots['side'].value,
      type: 'market',
      time_in_force: "day",
    }).then((resp) => {
      return `Market order of ${slots['side'].value}, ${slots['quantity'].value}, ${stock.split("").join(", ")}, day, sent.`;
    }).catch((err) => {
      return `Error: ${err.error.message}`;
    }).then((resp) => {
      return handlerInput.responseBuilder
      .speak(resp)
      .getResponse();
    });

    // Send verbal response back to user
    return resp;
  }
};
// Out-of-box handlers
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Here are some of the things you can ask for: market orders, limit orders, account info, listing positions.';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Alpaca skill is closing.  Goodbye!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
      return true;
  },
  handle(handlerInput, error) {
    console.log(error);
    const speakOutput = "Error occurred.  Please try again.";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    MarketOrderIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(
    ErrorHandler,
  )
  .lambda()