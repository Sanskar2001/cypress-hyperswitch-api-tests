// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// commands.js or your custom support file
import globalState from "../utils/State";
import * as RequestBodyUtils from "../utils/RequestBodyUtils";
import { baseUrl } from "../utils/Constants";
const apiKey = Cypress.env("API_KEY");
const publishableKey = Cypress.env("PUBLISHABLE_KEY");
Cypress.Commands.add("createPaymentIntentTest", (request) => {
  cy.request({
    method: "POST",
    url: `${baseUrl}/payments`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: request,
  }).then((response) => {
    expect(response.headers["content-type"]).to.include("application/json");
    expect(response.body).to.have.property("client_secret");
    const clientSecret = response.body.client_secret;
    globalState.set("clientSecret", clientSecret);
    cy.log(clientSecret);
  });
});

Cypress.Commands.add("paymentMethodsCallTest", () => {
  const clientSecret = globalState.get("clientSecret");

  cy.request({
    method: "GET",
    url: `${baseUrl}/account/payment_methods?client_secret=${clientSecret}`,
    headers: {
      "Content-Type": "application/json",
      "api-key": publishableKey,
    },
  }).then((response) => {
    expect(response.headers["content-type"]).to.include("application/json");
    expect(response.body).to.have.property("redirect_url");
    expect(response.body).to.have.property("payment_methods");
    cy.log(response);
  });
});

Cypress.Commands.add("confirmCallTest", (confirmBody, testCardNo) => {
  const clientSecret = globalState.get("clientSecret");
  var paymentIntentID = clientSecret.split("_secret_")[0];

  RequestBodyUtils.setCardNo(confirmBody, testCardNo);
  RequestBodyUtils.setClientSecret(confirmBody, clientSecret);

  cy.request({
    method: "POST",
    url: `${baseUrl}/payments/${paymentIntentID}/confirm`,
    headers: {
      "Content-Type": "application/json",
      "api-key": publishableKey,
    },
    body: confirmBody,
  }).then((response) => {
    expect(response.headers["content-type"]).to.include("application/json");
    expect(response.body).to.have.property("next_action");
    expect(response.body)
      .to.have.property("next_action")
      .to.have.property("redirect_to_url");

    const nextActionUrl = response.body.next_action.redirect_to_url;
    cy.log(nextActionUrl);
    console.log(nextActionUrl);
    cy.window().invoke("open", nextActionUrl);
  });
});
