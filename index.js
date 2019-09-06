const Alexa = require('ask-sdk-core');
const Alpaca = require('@alpacahq/alpaca-trade-api');

const keyId = "KEY_ID_HERE";
const secretKey = "SECRET_KEY_HERE";

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
    let sym = `${slots['sym_one'].value ? slots['sym_one'].value.split('.').join("") : ""}\
${slots['sym_two'].value ? slots['sym_two'].value.split('.').join("") : ""}\
${slots['sym_three'].value ? slots['sym_three'].value.split('.').join("") : ""}\
${slots['sym_four'].value ? slots['sym_four'].value.split('.').join("") : ""}\
${slots['sym_five'].value ? slots['sym_five'].value.split('.').join("") : ""}`.toUpperCase();
    if(slots['side'].value == "by") slots['side'].value = "buy";
    let tif = slots['time_in_force'].value.split(" ").join("").toLowerCase();
    

    // Submit the market order using the Alpaca trading api
    let resp = await api.createOrder({
      symbol: sym,
      qty: parseInt(slots['quantity'].value),
      side: slots['side'].value,
      type: 'market',
      time_in_force: tif,
    }).then((resp) => {
      return `Market order of ${slots['side'].value}, ${slots['quantity'].value}, ${sym.split("").join(", ")}, ${tif.split("").join(", ")}, sent.`;
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
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Format inputs
    let sym = `${slots['sym_one'].value ? slots['sym_one'].value.split('.').join("") : ""}\
${slots['sym_two'].value ? slots['sym_two'].value.split('.').join("") : ""}\
${slots['sym_three'].value ? slots['sym_three'].value.split('.').join("") : ""}\
${slots['sym_four'].value ? slots['sym_four'].value.split('.').join("") : ""}\
${slots['sym_five'].value ? slots['sym_five'].value.split('.').join("") : ""}`.toUpperCase();
    if(slots['side'].value == "by") slots['side'].value = "buy";
    let tif = slots['time_in_force'].value.split(" ").join("").toLowerCase();

    // Create stop/limit order with user inputs
    if(slots["type"].value == "limit") {
      let resp = await api.createOrder({
        symbol: sym,
        qty: parseInt(slots['quantity'].value),
        side: slots['side'].value,
        type: slots["type"].value,
        time_in_force: tif,
        limit_price: parseInt(slots['price'].value),
      }).then((resp) => {
        return `${slots["type"].value} order of ${slots['side'].value}, ${slots['quantity'].value}, ${sym.split("").join(", ")}, ${tif.split("").join(", ")}, at a ${slots["type"].value} price of ${slots['price'].value} sent.`;
      }).catch((err) => {
        return `Error: ${err.error.message}`;
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
        type: slots["type"].value,
        time_in_force: tif,
        stop_price: parseInt(slots['price'].value)
      }).then((resp) => {
        return `${slots["type"].value} order of ${slots['side'].value}, ${slots['quantity'].value}, ${sym.split("").join(", ")}, ${tif.split("").join(", ")}, at a ${slots['type'].value} price of ${slots['price'].value} sent.`;
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
  }
};
const StopLimitOrderIntentHandler = {
  // Triggers when user wants to execute a stop limit order
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StopLimitOrderIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Format inputs
    let sym = `${slots['sym_one'].value ? slots['sym_one'].value.split('.').join("") : ""}\
${slots['sym_two'].value ? slots['sym_two'].value.split('.').join("") : ""}\
${slots['sym_three'].value ? slots['sym_three'].value.split('.').join("") : ""}\
${slots['sym_four'].value ? slots['sym_four'].value.split('.').join("") : ""}\
${slots['sym_five'].value ? slots['sym_five'].value.split('.').join("") : ""}`.toUpperCase();
    if(slots['side'].value == "by") slots['side'].value = "buy";
    let tif = slots['time_in_force'].value.split(" ").join("").toLowerCase();

    // Create stop/limit order with user inputs
    if(slots["stop_limit"].value == "limit") {
      let resp = await api.createOrder({
        symbol: sym,
        qty: parseInt(slots['quantity'].value),
        side: slots['side'].value,
        type: "stop_limit",
        time_in_force: tif,
        limit_price: parseInt(slots['price_one'].value),
        stop_price: parseInt(slots['price_two'].value),
      }).then((resp) => {
        return `${slots["stop_limit"].value} order of ${slots['side'].value}, ${slots['quantity'].value}, ${sym.split("").join(", ")}, ${tif.split("").join(", ")}, at a limit price of ${slots['price_one'].value} and a stop price of ${slots['price_two'].value} sent.`;
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
  }
}
const OrdersIntentHandler = {
  // Triggers when user wants to look up orders
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' 
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'OrdersIntent';
  },
  async handle(handlerInput) {
    // Declare the Alpaca object
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Lookup orders using Alpaca trade API and craft a response
    let resp = await api.getOrders().then((orders) => {
      if(orders.length > 0) {
        var speakOutput = "Listing open orders. ";
        orders.forEach((order,i) => {
          let sym = order.symbol.split("").join(", ");
          speakOutput += `Order ${i + 1}: ${order.type} ${order.side}, ${sym}, ${order.filled_qty} out of ${order.qty} shares filled,  `;
        });
        return speakOutput;
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
    // Declare the Alpaca object
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Lookup positions and craft response
    let resp = await api.getPositions().then((positions) => {
      if(positions.length > 0) {
        var speakOutput = "Listing positions.  ";
        positions.forEach((position,i) => {
          let sym = position.symbol.split("").join(", ");
          speakOutput += `Position ${i + 1}: ${sym}, ${position.qty}, ${position.side} position, average entry price of ${parseFloat(position.avg_entry_price).toFixed(2)};`;
        });
        return speakOutput;
      }
      else {
        return "No open positions.";
      }
    }).catch((err) => {
      return `Error: ${err.error.message}`;
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
    // Declare the Alpaca object
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Get account from Alpaca trade API and craft response
    const account = await api.getAccount();
    const speakOutput = `Account info: current equity is ${account.equity} ${account.currency}, current cash is ${account.cash} ${account.currency}, buying power is ${account.buying_power} ${account.currency}, portfolio value is ${account.portfolio_value} ${account.currency}.`;
    
    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};
const GetPriceIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetPriceIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });
    
    let sym = `${slots['sym_one'].value ? slots['sym_one'].value.split('.').join("") : ""}\
${slots['sym_two'].value ? slots['sym_two'].value.split('.').join("") : ""}\
${slots['sym_three'].value ? slots['sym_three'].value.split('.').join("") : ""}\
${slots['sym_four'].value ? slots['sym_four'].value.split('.').join("") : ""}\
${slots['sym_five'].value ? slots['sym_five'].value.split('.').join("") : ""}`.toUpperCase();
    var price = await api.getBars('minute',sym,{
      limit: 1
    })
    price = price[sym][0].c
    const speakOutput = `Price of ${sym.split("").join(", ")} is ${price}`
    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
}
const ClearIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ClearIntent';
  },
  async handle(handlerInput) {
    // Get user inputs and declare the Alpaca object
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    // Clear all positions or orders
    var speakOutput = "";
    if(slots["position_order"].value == "positions") {
      await api.closeAllPositions()
      speakOutput = "Position clearing orders sent.";
    } else if (slots["position_order"].value == "orders"){
      await api.cancelAllOrders();
      speakOutput = "Order cancels sent.";
    }       

    // Send verbal response to user
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};
const CancelOrderIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CancelOrderIntent';
  },
  async handle(handlerInput) {
    // Declare the Alpaca object
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
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
      const speakOutput = "Order canceled.";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};
const PerformanceIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PerformanceIntent';
  },
  async handle(handlerInput) {
    // Declare the Alpaca object
    const api = new Alpaca({
      keyId: keyId,
      secretKey: secretKey,
      paper: true
    });

    let positions = await api.getPositions();

    let intra_pl = 0;
    let speakOutput = "";
    let account = await api.getAccount();
    positions.forEach((position) => {
      let pl = parseFloat(position.unrealized_intraday_pl).toFixed(2)
      speakOutput += `Asset: ${position.symbol.split("").join(",")}, ${(pl < 0 ? "loss of" : "gain of")} ${Math.abs(pl)} ${account.currency}; `
      intra_pl += parseFloat(position.unrealized_intraday_pl)
    })
    speakOutput += `Portfolio has ${(intra_pl < 0 ? "lost" : "gained")} ${intra_pl.toFixed(2)} ${account.currency} intraday, value currently at ${parseFloat(account.portfolio_value).toFixed(2)} ${account.currency}.`

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
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
    StopOrLimitOrderIntentHandler,
    StopLimitOrderIntentHandler,
    PositionsIntentHandler,
    OrdersIntentHandler,
    AccountIntentHandler,
    GetPriceIntentHandler,
    ClearIntentHandler,
    CancelOrderIntentHandler,
    PerformanceIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(
    ErrorHandler,
  )
  .lambda();