import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildUpiUri, generateUpiIntentLinks } from "../src/lib/upi.ts";

describe("Homemart4u UPI Payload & VPA Compliance Suite", () => {
  describe("1. NPCI RFC 3986 URL Encoding & Parameter Hygiene", () => {
    it("encodes spaces as %20 instead of '+' in payeeName and note", () => {
      const uri = buildUpiUri({
        vpa: "customer@upi",
        payeeName: "Homemart4u Store",
        amountRupees: 350.0,
        orderNumber: "FC-2001",
        note: "Order FC-2001 Payment",
      });

      assert.ok(uri.includes("pn=Homemart4u%20Store"), "Payee name spaces must be encoded as %20");
      assert.ok(!uri.includes("pn=Homemart4u+Store"), "Payee name must NOT contain '+' encoding");
      assert.ok(uri.includes("tn=Order%20FC-2001%20Payment"), "Note spaces must be encoded as %20");
      assert.ok(!uri.includes("tn=Order+FC-2001+Payment"), "Note must NOT contain '+' encoding");
    });

    it("sanitizes '#' from order note to protect URI fragment boundaries", () => {
      const uri = buildUpiUri({
        vpa: "test@axisbank",
        payeeName: "Homemart4u",
        amountRupees: 199.0,
        orderNumber: "FC-2002",
        note: "Payment for Order #FC-2002",
      });

      assert.ok(!uri.includes("#"), "URI must never contain unencoded '#' hash symbol");
      assert.ok(uri.includes("tn=Payment%20for%20Order%20FC-2002"), "Hash symbol must be stripped cleanly");
    });

    it("formats amount with exact two-decimal precision in INR", () => {
      const uri1 = buildUpiUri({
        vpa: "test@upi",
        payeeName: "Homemart4u",
        amountRupees: 250,
        orderNumber: "FC-2003",
      });
      assert.ok(uri1.includes("am=250.00"), "Integer amount must have .00 precision");
      assert.ok(uri1.includes("cu=INR"), "Currency must be INR");

      const uri2 = buildUpiUri({
        vpa: "test@upi",
        payeeName: "Homemart4u",
        amountRupees: 149.75,
        orderNumber: "FC-2004",
      });
      assert.ok(uri2.includes("am=149.75"), "Paise amount must match exact two decimals");
    });

    it("enforces maximum 35-character alphanumeric transaction reference", () => {
      const uri = buildUpiUri({
        vpa: "test@upi",
        payeeName: "Homemart4u",
        amountRupees: 100.0,
        orderNumber: "FC-2005",
        transactionRef: "TXN_VERY_LONG_TRANSACTION_REFERENCE_NUMBER_1234567890",
      });

      const match = uri.match(/tr=([^&]+)/);
      assert.ok(match, "tr parameter must exist");
      assert.ok(match[1].length <= 35, "Transaction reference must not exceed 35 characters");
    });
  });

  describe("2. Personal vs Merchant VPA Differentiation (Root Cause Prevention)", () => {
    it("omits 'url' parameter for personal/standard VPAs even if callbackUrl is provided", () => {
      // Personal handle: no 'mc' configured
      const uri = buildUpiUri({
        vpa: "syedroshanriyan@okaxis",
        payeeName: "Homemart4u",
        amountRupees: 250.0,
        orderNumber: "FC-2006",
        callbackUrl: "https://homemart4u.vercel.app/order-success?orderId=123",
      });

      assert.ok(!uri.includes("url="), "Must NOT append 'url' parameter to personal VPA to prevent PSP rejection");
      assert.ok(!uri.includes("mc="), "Must NOT invent 'mc' for unconfigured account");
      assert.ok(uri.includes("pa=syedroshanriyan%40okaxis"), "Payee VPA must be encoded");
    });

    it("includes 'mc' and 'url' ONLY when an authentic 4-digit Merchant Category Code is provided", () => {
      const uri = buildUpiUri({
        vpa: "homemart4u@axisbank",
        payeeName: "Homemart4u Store",
        amountRupees: 500.0,
        orderNumber: "FC-2007",
        mc: "5411", // Grocery Stores / Supermarkets
        callbackUrl: "https://homemart4u.vercel.app/order-success?orderId=123",
      });

      assert.ok(uri.includes("mc=5411"), "MCC must be included when officially provided");
      assert.ok(uri.includes("url=https%3A%2F%2Fhomemart4u.vercel.app%2Forder-success%3ForderId%3D123"), "URL may be included for verified merchant with MCC");
    });

    it("correctly generates verified payload for Google Pay for Business: Fresh Chicken Centre (7975137618@okbizaxis, MCC 5422)", () => {
      const uri = buildUpiUri({
        vpa: "7975137618@okbizaxis",
        payeeName: "Fresh Chicken Centre",
        amountRupees: 350.0,
        orderNumber: "FC-3001",
        mc: "5422",
        transactionRef: "TXN_FC-3001_1729000000",
        note: "Order FC-3001 Fresh Chicken",
      });

      assert.ok(uri.startsWith("upi://pay?"), "Must use upi://pay scheme");
      assert.ok(uri.includes("pa=7975137618%40okbizaxis"), "Must encode Google Pay for Business VPA");
      assert.ok(uri.includes("pn=Fresh%20Chicken%20Centre"), "Must encode display name with %20 spaces");
      assert.ok(uri.includes("mc=5422"), "Must include official poultry/meat provisioners MCC 5422");
      assert.ok(uri.includes("am=350.00"), "Must include exact amount");
      assert.ok(uri.includes("cu=INR"), "Must include INR currency");
      assert.ok(uri.includes("tr=TXN_FC-3001_1729000000"), "Must include transaction reference");
    });

    it("ignores malformed or non-4-digit MCC to prevent bank rejection", () => {
      const uri = buildUpiUri({
        vpa: "test@bank",
        payeeName: "Homemart4u",
        amountRupees: 100.0,
        orderNumber: "FC-2008",
        mc: "INVALID_MCC",
        callbackUrl: "https://homemart4u.vercel.app/order-success",
      });

      assert.ok(!uri.includes("mc="), "Malformed MCC must be excluded");
      assert.ok(!uri.includes("url="), "URL must be excluded if MCC is invalid");
    });
  });

  describe("3. Intent Links & App Launch Schemes", () => {
    it("generates correct clean intent schemes for GPay, PhonePe, Paytm, and BHIM", () => {
      const links = generateUpiIntentLinks({
        vpa: "merchant@upi",
        payeeName: "Homemart4u",
        amountRupees: 250.0,
        orderNumber: "FC-2009",
      });

      assert.ok(links.gpayUrl.startsWith("gpay://upi/pay?"), "GPay URL must use gpay:// scheme");
      assert.ok(links.phonepeUrl.startsWith("phonepe://pay?"), "PhonePe URL must use phonepe:// scheme");
      assert.ok(links.paytmUrl.startsWith("paytmmp://pay?"), "Paytm URL must use paytmmp:// scheme");
      assert.ok(links.bhimUrl.startsWith("upi://pay?"), "BHIM URL must use upi:// scheme");
      assert.ok(links.androidGpayIntent?.includes("package=com.google.android.apps.nbu.paisa.user"), "Android GPay package must match");
      assert.ok(links.androidPhonePeIntent?.includes("package=com.phonepe.app"), "Android PhonePe package must match");
      assert.ok(links.androidPaytmIntent?.includes("package=net.one97.paytm"), "Android Paytm package must match");
    });
  });

  describe("4. Input Validation & Error Handling", () => {
    it("throws an error when VPA is missing or empty", () => {
      assert.throws(
        () => buildUpiUri({ vpa: "", payeeName: "Store", amountRupees: 100, orderNumber: "FC-1" }),
        /UPI VPA \(pa\) is mandatory/
      );
    });

    it("throws an error when payeeName is missing or empty", () => {
      assert.throws(
        () => buildUpiUri({ vpa: "test@upi", payeeName: "   ", amountRupees: 100, orderNumber: "FC-1" }),
        /UPI Payee Name \(pn\) is mandatory/
      );
    });

    it("throws an error when amount is zero or negative", () => {
      assert.throws(
        () => buildUpiUri({ vpa: "test@upi", payeeName: "Store", amountRupees: 0, orderNumber: "FC-1" }),
        /UPI Amount \(am\) must be a positive number greater than zero/
      );
      assert.throws(
        () => buildUpiUri({ vpa: "test@upi", payeeName: "Store", amountRupees: -50, orderNumber: "FC-1" }),
        /UPI Amount \(am\) must be a positive number greater than zero/
      );
    });
  });
});
