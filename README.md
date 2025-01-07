# InvoicesApp
A web application enabling user login, personalized invoice viewing, and detailed invoice line item display through API integration.


The login.html page contains a form where users enter their credentials.
When the form is submitted, the login function in script.js fetches the list of users from the API and checks if the entered credentials match any user.
If the credentials are valid, the user is redirected to the invoices.html page.

On the invoices.html page, the loadInvoices function fetches the list of products and invoices from the API.
It filters the invoices to only show those belonging to the logged-in user.
For each invoice, it calculates the total amount by summing up the prices of the line items and displays the invoice in a table.

When an invoice is selected, the loadInvoiceLines function fetches the line items for the selected invoice from the API.
It clears any previously displayed line items and displays the new line items in a table, showing details such as product name, price, quantity, and total amount.
