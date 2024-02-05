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
const adminApiKey = Cypress.env("ADMIN_API_KEYS");

Cypress.Commands.add("merchantCreateCallTest", (merchantCreateBody) => {
  const clientSecret = globalState.get("clientSecret");
  var paymentIntentID = clientSecret.split("_secret_")[0];

  const randomMerchantId = RequestBodyUtils.generateRandomString();
  RequestBodyUtils.setMerchantId(merchantCreateBody, randomMerchantId);
  globalState.set("merchantId", randomMerchantId);

  cy.request({
    method: "POST",
    url: `${baseUrl}/accounts`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-feature": "router-custom",
      "api-key": adminApiKey,
    },
    body: merchantCreateBody,
  }).then((response) => {
    // Handle the response as needed
    console.log(response.body);
    globalState.set("publishableKey", response.body.publishable_key);
  });
});

Cypress.Commands.add("apiKeyCreateTest", (apiKeyCreateBody) => {
  cy.request({
    method: "POST",
    url: `${baseUrl}/api_keys/${globalState.get("merchantId")}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-feature": "router-custom",
      "api-key": adminApiKey,
    },
    body: apiKeyCreateBody,
  }).then((response) => {
    // Handle the response as needed
    console.log(response.body.api_key);
    globalState.set("apiKey", response.body.api_key);
  });
});

Cypress.Commands.add("createConnectorCallTest", (createConnectorBody) => {
  // RequestBodyUtils.setApiKey(createConnectorBody, globalState.get("apiKey"));
  const merchantId = globalState.get("merchantId");
  console.log("merchantid-------->" + merchantId);
  cy.request({
    method: "POST",
    url: `${baseUrl}/account/${merchantId}/connectors`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-feature": "router-custom",
      "api-key": adminApiKey,
    },
    body: createConnectorBody,
  }).then((response) => {
    // Handle the response as needed
    console.log(response.body);
  });
});

Cypress.Commands.add("createPaymentIntentTest", (request) => {
  cy.request({
    method: "POST",
    url: `${baseUrl}/payments`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": globalState.get("apiKey"),
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
      "api-key": globalState.get("publishableKey"),
    },
  }).then((response) => {
    console.log(response);
    expect(response.headers["content-type"]).to.include("application/json");
    expect(response.body).to.have.property("redirect_url");
    expect(response.body).to.have.property("payment_methods");
    cy.log(response);
  });
});

Cypress.Commands.add("confirmCallTest", (confirmBody, testCardNo) => {
  const clientSecret = globalState.get("clientSecret");
  var paymentIntentID = clientSecret.split("_secret_")[0];

  console.log("cl confirm------>" + clientSecret);

  RequestBodyUtils.setCardNo(confirmBody, testCardNo);
  RequestBodyUtils.setClientSecret(confirmBody, clientSecret);

  cy.request({
    method: "POST",
    url: `${baseUrl}/payments/${paymentIntentID}/confirm`,
    headers: {
      "Content-Type": "application/json",
      "api-key":  globalState.get("publishableKey"),
    },
    body: confirmBody,
  }).then((response) => {
    expect(response.headers["content-type"]).to.include("application/json");
    expect(response.body).to.have.property("next_action");
    expect(response.body)
      .to.have.property("next_action")
      .to.have.property("redirect_to_url");
    console.log(response.body);
    const nextActionUrl = response.body.next_action.redirect_to_url;
    cy.log(response.body)
    cy.log(nextActionUrl);
    console.log(nextActionUrl);
    // cy.visit(nextActionUrl);
    // cy.wait(14000);
    // cy.contains('button', 'Complete').click();
    cy.window().invoke("open", nextActionUrl);
  });
});
