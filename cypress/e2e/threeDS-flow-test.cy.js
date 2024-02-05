import createPaymentBody from "../fixtures/create-payment-body.json";
import merchantCreateBody from "../fixtures/merchant-create-body.json";
import apiKeyCreateBody from "../fixtures/create-api-key-body.json";
import confirmBody from "../fixtures/confirm-body.json";
import createConnectorBody from "../fixtures/create-connector-body.json";
import * as TestCards from "../utils/TestCards";
describe("Card payment flow test", () => {
  it("merchant-create-call-test", () => {
    cy.merchantCreateCallTest(merchantCreateBody);
  });
  it("api-key-create-call-test", () => {
    cy.apiKeyCreateTest(apiKeyCreateBody);
  });
  it("connector-create-call-test", () => {
    cy.createConnectorCallTest(createConnectorBody);
  });
  it("create-payment-call-test", () => {
    cy.createPaymentIntentTest(createPaymentBody);
  });

  it("payment_methods-call-test", () => {
    cy.paymentMethodsCallTest();
  });

  it("confirm-call-test", () => {
    cy.confirmCallTest(confirmBody, TestCards.stripe3DSCard);
  });
});
