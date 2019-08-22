const Alexa = require('ask-sdk-core');
const Alpaca = require('@alpacahq/alpaca-trade-api');
const request = require('./node_modules/request-promise');

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
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    // Lookup symbol by company name using Tradier Developer sandbox API (rate limited to 60 reqs per minute, unfortunately)
    let sym = "";
    await request.get({
      url: "https://sandbox.tradier.com/v1/markets/search",
      qs: { 'q': slots['stock'].value },
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer AUTH_TOKEN"
      },
      method: "get"
    }).then((resp) => {
      resp = JSON.parse(resp);
      if(resp.securities == null){
        sym = null;
      }
      else{
        let security = resp.securities.security;
        if(Array.isArray(security)){
          sym = security[0].symbol;
        } else {
          sym = security.symbol;
        }
      }
    });
    if(sym == null){
      return handlerInput.responseBuilder
        .speak("Symbol could not be found.  Please try again.")
        .getResponse();
    }
    // Submit the market order using the Alpaca trading api
    let resp = await api.createOrder({
      symbol: sym,
      qty: parseInt(slots['quantity'].value),
      side: slots['side'].value,
      type: 'market',
      time_in_force: slots['time_in_force'].value,
    }).then((resp) => {
      return `Market order of ${slots['side'].value}, ${slots['quantity'].value}, ${slots['stock'].value} sent.`;
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
const StopOrLimitOrderIntentHandler = {
  // Triggers when the user invokes either a stop or limit order
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StopOrLimitOrderIntent';
  },
  async handle(handlerInput) {
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }

    // Get user inputs and declare Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    // Lookup symbol by company name using Tradier Developer sandbox API (rate limited to 60 reqs per minute, unfortunately)
    let sym = "";
    await request.get({
      url: "https://sandbox.tradier.com/v1/markets/search",
      qs: { 'q': slots['stock'].value },
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer AUTH_TOKEN"
      },
      method: "get"
    }).then((resp) => {
      resp = JSON.parse(resp);
      if(resp.securities == null){
        sym = null;
      }
      else{
        let security = resp.securities.security;
        if(Array.isArray(security)){
          sym = security[0].symbol;
        } else {
          sym = security.symbol;
        }
      }
    });
    if(sym == null){
      return handlerInput.responseBuilder
        .speak("Symbol could not be found.  Please try again.")
        .getResponse();
    }
    // Create stop/limit order with user inputs
    if(slots["stop_limit"].value == "limit") {
      let resp = await api.createOrder({
        symbol: sym,
        qty: parseInt(slots['quantity'].value),
        side: slots['side'].value,
        type: slots["stop_limit"].value,
        time_in_force: slots["time_in_force"].value,
        limit_price: parseInt(slots['stop_limit_price'].value),
      }).then((resp) => {
        return `${slots["stop_limit"].value} order of ${slots['side'].value}, ${slots['quantity'].value}, ${slots['stock'].value} at a price of ${slots['stop_limit_price'].value} sent.`;
      }).catch((err) => {
        return `Error: ${err.error.message}`
      }).then((resp) => {
        return handlerInput.responseBuilder
        .speak(resp)
        .getResponse();
      });
      
      // Send verbal response back to user
      return resp;
    } else {
      let resp = await api.createOrder({
        symbol: sym,
        qty: parseInt(slots['quantity'].value),
        side: slots['side'].value,
        type: slots["stop_limit"].value,
        time_in_force: slots["time_in_force"].value,
        stop_price: parseInt(slots['stop_limit_price'].value)
      }).then((resp) => {
        return `${slots["stop_limit"].value} order of ${slots['side'].value}, ${slots['quantity'].value}, ${slots['stock'].value} at a price of ${slots['stop_limit_price'].value} sent.`;
      }).catch((err) => {
        return `Error: ${err.error.message}`
      }).then((resp) => {
        return handlerInput.responseBuilder
        .speak(resp)
        .getResponse();
      });
      
      // Send verbal response back to user
      return resp;
    }
  }
};
const OrdersIntentHandler = {
  // Triggers when user wants to look up orders
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrdersIntent';
  },
  async handle(handlerInput) {
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }

    // Declare Alpaca object
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    // Lookup orders using Alpaca trade API and craft a response
    let resp = await api.getOrders().then((orders) => {
      console.log(orders);
      if(orders.length > 0) {
        var speakOutput = "Listing open orders. ";
        orders.forEach((order,i) => {
          let sym = order.symbol.split("").join(", ");
          speakOutput += `Order ${i + 1}: ${sym}, ${order.qty}, ${order.type} order, ${order.side}, ${order.filled_qty} shares filled.  `;
        });
        return speakOutput
      }
      else {
        return "No open orders.";
      }
    }).catch((err) => {
      return `Error: ${err.error.message}`;
    }).then((resp) => {
      // Send verbal response back to user
      return handlerInput.responseBuilder
        .speak(resp)
        .getResponse();
    });

    return resp;
  }
};
const PositionsIntentHandler = {
  // Triggers when user wants to look up positions
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PositionsIntent';
  },
  async handle(handlerInput) {
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }

    // Declare Alpaca object
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    // Lookup positions and craft response
    let resp = await api.getPositions().then((positions) => {
      if(positions.length > 0) {
        var speakOutput = "Listing positions.  ";
        positions.forEach((position,i) => {
          let sym = position.symbol.split("").join(", ");
          speakOutput += `Position ${i + 1}: ${sym}, ${position.qty}, ${position.side} position, average entry price of ${parseFloat(position.avg_entry_price).toFixed(2)}.  `
        })
        return speakOutput;
      }
      else {
        return "No open positions.";
      }
    }).catch((err) => {
      return `Error: ${err.error.message}`
    }).then((resp) => {
      // Send verbal response to user
      return handlerInput.responseBuilder
        .speak(resp)
        .getResponse();
    });

    return resp;
  }
};
const AccountIntentHandler = {
  // Triggers when user wants to lookup account info
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AccountIntent';
  },
  async handle(handlerInput) {
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }

    // Declare Alpaca object
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    // Get account from Alpaca trade API and craft response
    const account = await api.getAccount();
    const speakOutput = `Account info: current equity is ${account.equity}, current cash is ${account.cash}, buying power is ${account.buying_power}, portfolio value is ${account.portfolio_value}, currency is ${account.currency}.`
    
    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};
/* Doesn't work yet, will be functional once oauth works for data api
const GetPriceIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetPriceIntent';
  },
  async handle(handlerInput) {
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }

    // Get user inputs and declare Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    // Lookup symbol by company name using Tradier Developer sandbox API (rate limited to 60 reqs per minute, unfortunately)
    let sym = "";
    await request.get({
      url: "https://sandbox.tradier.com/v1/markets/search",
      qs: { 'q': slots['stock'].value },
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer AUTH_TOKEN"
      },
      method: "get"
    }).then((resp) => {
      resp = JSON.parse(resp);
      if(resp.securities == null){
        sym = null;
      }
      else{
        let security = resp.securities.security;
        if(Array.isArray(security)){
          sym = security[0].symbol;
        } else {
          sym = security.symbol;
        }
      }
    });
    if(sym == null){
      return handlerInput.responseBuilder
        .speak("Symbol could not be found.  Please try again.")
        .getResponse();
    }

    var price = await api.getBars('minute',sym,{
      limit: 1
    })
    price = price[sym][0].c
    const speakOutput = `Price of ${sym.split("").join(" ")} is ${price}`
    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
} */
const ClearIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClearIntent';
  },
  async handle(handlerInput) {
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }

    // Get user inputs and declare Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    // Clear all positions or orders
    var speakOutput = "";
    if(slots["position_order"].value == "positions") {
      let positions = await api.getPositions();
      positions.forEach((position) => {
        api.createOrder({
          symbol: position.symbol,
          qty: position.qty,
          side: (position.side == "long" ? "sell" : "buy"),
          type: "market",
          time_in_force: "day",
        })
      });
      speakOutput = "Position clearing orders sent.";
    } else if (slots["position_order"].value == "orders"){
      await api.cancelAllOrders();
      speakOutput = "Order cancels sent."
    }       

    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
}
const CancelOrderIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CancelOrderIntent';
  },
  async handle(handlerInput) {
    // Check for OAuth access token
    const accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined){
      var speechText = "You must have an Alpaca account to continue.";        
      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .getResponse();
    }

    // Declare Alpaca object
    const api = new Alpaca({
      oauth: accessToken,
      paper: true
    });

    const orders = await api.getOrders({
      status: "open",
      limit: 1,
    });

    // Get the most recent order and cancel it
    if(orders.length == 0){
      return handlerInput.responseBuilder
      .speak("No orders to cancel.")
      .getResponse();
    } else {
      await api.cancelOrder(orders[0].id);

      // Send verbal response to user
      const speakOutput = "Order canceled."
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
}
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
    StopOrLimitOrderIntentHandler,
    PositionsIntentHandler,
    OrdersIntentHandler,
    AccountIntentHandler,
    /*GetPriceIntentHandler,*/
    ClearIntentHandler,
    CancelOrderIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(
    ErrorHandler,
  )
  .lambda();