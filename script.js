document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorDiv = document.getElementById('error');
    const invoicesTable = document.getElementById('invoicesTable');
    const invoiceLinesTable = document.getElementById('invoiceLinesTable');
    const usernameSpan = document.getElementById('username');
    const logoutButton = document.getElementById('logout');
    let products = [];

    // Clear username and password fields on page load
    if (loginForm) {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            sessionStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    function login(username, password) {
        fetch('https://bever-aca-assignment.azurewebsites.net/users')
            .then(response => response.json())
            .then(users => {
                console.log('Fetched Users:', users); // Log the users data for debugging
                const user = users.value.find(u => u.Name === username && u.Password === password);
                if (user) {
                    sessionStorage.setItem('user', JSON.stringify(user));
                    console.log('Login Successful:', user); 
                    window.location.href = 'invoices.html';
                } else {
                    errorDiv.textContent = 'Invalid username or password';
                    console.log('Login Failed: Invalid username or password'); 
                }
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    function loadInvoices() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        usernameSpan.textContent = user.Name;

        fetch('https://bever-aca-assignment.azurewebsites.net/products')
            .then(response => response.json())
            .then(data => {
                products = data.value; 
                console.log('Fetched Products:', products); 

                fetch('https://bever-aca-assignment.azurewebsites.net/invoices')
                    .then(response => response.json())
                    .then(invoices => {
                        console.log('Fetched Invoices:', invoices); 
                        const userInvoices = invoices.value.filter(invoice => invoice.UserId === user.UserId);
                        userInvoices.forEach(invoice => {
                            calculateTotalAmount(invoice.InvoiceId).then(totalAmount => {
                                const row = invoicesTable.insertRow();
                                row.innerHTML = `
                                    <td><input type="radio" name="invoice" value="${invoice.InvoiceId}"></td>
                                    <td>${invoice.Name}</td>
                                    <td>${new Date(invoice.PaidDate).toLocaleDateString()}</td>
                                    <td>${totalAmount}</td>
                                `;
                            }).catch(error => console.error('Error calculating total amount:', error));
                        });

                        invoicesTable.addEventListener('change', function (event) {
                            if (event.target.name === 'invoice') {
                                const invoiceId = event.target.value;
                                loadInvoiceLines(invoiceId);
                            }
                        });
                    })
                    .catch(error => console.error('Error fetching invoices:', error));
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    function calculateTotalAmount(invoiceId) {
        return fetch('https://bever-aca-assignment.azurewebsites.net/invoicelines')
            .then(response => response.json())
            .then(invoiceLines => {
                console.log('Fetched Invoice Lines for Total Calculation:', invoiceLines); // Log the invoice lines data for debugging
                const filteredLines = invoiceLines.value.filter(line => line.InvoiceId === invoiceId);
                console.log(`Filtered Lines for Invoice ${invoiceId}:`, filteredLines); // Log filtered lines for debugging

                const totalAmount = filteredLines.reduce((total, line) => {
                    const product = products.find(p => p.ProductId === line.ProductId);
                    if (product) {
                        const lineTotal = line.Quantity * product.Price;
                        console.log(`Adding Line Amount: Quantity=${line.Quantity}, Price=${product.Price}, Line Total=${lineTotal}`); // Log each line's quantity, price, and line total
                        return total + lineTotal;
                    } else {
                        console.error(`Product not found for ProductId: ${line.ProductId}`);
                        return total;
                    }
                }, 0);

                console.log(`Total Amount for Invoice ${invoiceId}:`, totalAmount); // Log the calculated total amount
                return totalAmount;
            })
            .catch(error => {
                console.error('Error fetching invoice lines for total calculation:', error);
                return 0;
            });
    }

    function loadInvoiceLines(invoiceId) {
        // Clear the previous invoice lines
        const tbody = invoiceLinesTable.querySelector('tbody');
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        fetch('https://bever-aca-assignment.azurewebsites.net/invoicelines')
            .then(response => response.json())
            .then(invoiceLines => {
                console.log('Fetched Invoice Lines:', invoiceLines); // Log the invoice lines data for debugging
                const filteredLines = invoiceLines.value.filter(line => line.InvoiceId === invoiceId);
                filteredLines.forEach(line => {
                    const product = products.find(p => p.ProductId === line.ProductId);
                    if (product) {
                        const totalAmount = line.Quantity * product.Price;
                        const row = tbody.insertRow();
                        row.innerHTML = `
                            <td>${product.Name}</td>
                            <td>${product.Price}</td>
                            <td>${line.Quantity}</td>
                            <td>${totalAmount}</td>
                        `;
                    } else {
                        console.error(`Product not found for ProductId: ${line.ProductId}`);
                    }
                });
            })
            .catch(error => console.error('Error fetching invoice lines:', error));
    }

    if (invoicesTable) {
        loadInvoices();
    }
});
