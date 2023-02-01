/// <reference types="cypress" />

describe("search view tests", () => {
  it("can select the table view and back to the list view", () => {
    cy.visit("/");
    cy.get("[data-testid=users]").click();
    cy.get("[data-testid^=search-list-item-]")
      .its("length")
      .should("be.gte", 1);
    cy.get(`[aria-label="Pagination"]`).should("exist");
    cy.get(`[data-testid="form-select"]`).should("exist");

    cy.get(`[label="Select report view"]`).click();
    cy.get("[data-testid^=search-list-item-]").should("not.exist");
    cy.get("[role=table]").should("exist");
    cy.get("[role=columnheader]").its("length").should("be.gte", 1);
    cy.get("[role=cell]").its("length").should("be.gte", 1);

    cy.get(`[label="Select list view"]`).click();
    cy.get("[data-testid^=search-list-item-]")
      .its("length")
      .should("be.gte", 1);
    cy.get("[role=table]").should("not.exist");
    cy.get("[role=columnheader]").should("not.exist");
    cy.get("[role=cell]").should("not.exist");
  });

  it("lets the user hide and show columns through the modal", () => {
    cy.visit("/");
    cy.get("[data-testid=labs]").click();
    cy.get(`[label="Select report view"]`).click();
    cy.get("[role=table]").should("exist");

    cy.contains("Columns").click();
    cy.get("[id^=headlessui-dialog-panel-]").should("exist");

    cy.get("[role=columnheader]").contains("Award").should("exist");
    cy.get("input[name=awards]").uncheck();
    cy.get("[role=columnheader]").contains("Award").should("not.exist");
    cy.get("input[name=awards]").check();
    cy.get("[role=columnheader]").contains("Award").should("exist");
    cy.get("input[name=aliases]").uncheck();
    cy.get("[role=columnheader]").contains("Aliases").should("not.exist");

    cy.contains("Close").click();
    cy.get("[id^=headlessui-dialog-panel-]").should("not.exist");

    cy.contains("Columns").click();
    cy.contains("Hide All").click();
    cy.get("[role=columnheader]").should("have.length", 1);
    cy.get("[role=columnheader]").contains("ID").should("exist");
    cy.get("fieldset input[type=checkbox]").each((checkbox) => {
      expect(checkbox[0].checked).to.equal(false);
    });

    cy.contains("Show All").click();
    cy.get("[role=columnheader]").should("have.length.greaterThan", 1);
    cy.get("fieldset input[type=checkbox]").each((checkbox) => {
      expect(checkbox[0].checked).to.equal(true);
    });

    cy.contains("Close").click();
    cy.get("[id^=headlessui-dialog-panel-]").should("not.exist");
  });

  it("lets the user choose the number of items per page", () => {
    cy.visit("/");
    cy.get("[data-testid=users]").click();

    cy.get(`[data-testid="search-list"]`).find("li").should("have.length", 25);
    cy.get(`[name="items-per-page"]`).select("100");
    cy.get(`[data-testid="search-list"]`).find("li").should("have.length", 100);

    cy.get(`[label="Select report view"]`).click();
    cy.get("[role=table]").should("exist");
    cy.get("[role=table]").find(`[role=cell]`).should("have.length", 500);

    cy.get(`[label="Select list view"]`).click();
    cy.get(`[data-testid="search-list"]`).find("li").should("have.length", 100);
    cy.get(`[name="items-per-page"]`).select("300");
    cy.get(`[data-testid="search-list"]`)
      .find("li")
      .should("have.length.gte", 101);
    cy.get(`[name="items-per-page"]`).select("25");
    cy.url().should("not.include", "limit=");
  });
});
