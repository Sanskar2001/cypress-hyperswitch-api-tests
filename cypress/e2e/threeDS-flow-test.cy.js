import createPaymentBody from "../fixtures/create-payment-body.json";
import confirmBody from "../fixtures/confirm-body.json";
import * as TestCards from "../utils/TestCards";
describe("Card payment flow test", () => {
  it("create-payment-call-test", () => {
    cy.createPaymentIntentTest(createPaymentBody);
  });

  it("payment_methods-call-test", () => {
    cy.paymentMethodsCallTest(createPaymentBody);
  });

  it("confirm-call-test", () => {
    cy.confirmCallTest(confirmBody, TestCards.stripeTestCard);
  });
});
