// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize state
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let budget = parseFloat(localStorage.getItem('budget')) || 0;

    // Set default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();

    // Initialize the UI
    updateSummary();
    renderExpenses();
    updateChart();

    // Add event listeners
    document.getElementById('setBudget').addEventListener('click', setBudget);
    document.getElementById('addExpense').addEventListener('click', addExpense);

    function setBudget() {
        const budgetInput = document.getElementById('budget');
        const budgetValue = parseFloat(budgetInput.value);
        
        if (isNaN(budgetValue) || budgetValue < 0) {
            alert('Please enter a valid budget amount');
            return;
        }
        
        budget = budgetValue;
        localStorage.setItem('budget', budget);
        budgetInput.value = '';
        updateSummary();
    }

    function addExpense() {
        const nameInput = document.getElementById('expenseName');
        const amountInput = document.getElementById('expenseAmount');
        const categoryInput = document.getElementById('expenseCategory');
        const dateInput = document.getElementById('expenseDate');
        
        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;
        
        if (name === '' || isNaN(amount) || amount <= 0 || date === '') {
            alert('Please fill in all fields with valid values');
            return;
        }
        
        const expense = {
            id: Date.now(),
            name,
            amount,
            category,
            date
        };
        
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Clear form
        nameInput.value = '';
        amountInput.value = '';
        categoryInput.selectedIndex = 0;
        dateInput.valueAsDate = new Date();
        
        // Update UI
        updateSummary();
        renderExpenses();
        updateChart();
    }

    function deleteExpense(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Update UI
        updateSummary();
        renderExpenses();
        updateChart();
    }

    function updateSummary() {
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remainingBudget = budget - totalExpenses;
        
        document.querySelector('.total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
        document.querySelector('.total-budget').textContent = `₹${budget.toFixed(2)}`;
        document.querySelector('.remaining-budget').textContent = `₹${remainingBudget.toFixed(2)}`;
        
        // Change color based on remaining budget
        const remainingElement = document.querySelector('.remaining-budget');
        if (remainingBudget < 0) {
            remainingElement.style.color = 'var(--danger)';
        } else {
            remainingElement.style.color = 'var(--primary)';
        }
    }

    function renderExpenses() {
        const expensesList = document.getElementById('expensesList');
        
        if (expenses.length === 0) {
            expensesList.innerHTML = '<div class="no-expenses">No expenses added yet.</div>';
            return;
        }
        
        // Sort expenses by date (most recent first)
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        expensesList.innerHTML = '';
        sortedExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            
            const formattedDate = new Date(expense.date).toLocaleDateString();
            
            expenseItem.innerHTML = `
                <div class="expense-details">
                    <span class="expense-title">${expense.name}</span>
                    <span class="expense-category">${expense.category}</span>
                    <span class="expense-date">${formattedDate}</span>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="btn-delete" data-id="${expense.id}">Delete</button>
                </div>
            `;
            
            expensesList.appendChild(expenseItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExpense(id);
            });
        });
    }

    function updateChart() {
        const chartContainer = document.getElementById('expensesChart');
        
        if (expenses.length === 0) {
            chartContainer.innerHTML = '<div class="no-expenses">No data to display.</div>';
            return;
        }
        
        // Group expenses by category
        const categories = {};
        expenses.forEach(expense => {
            if (categories[expense.category]) {
                categories[expense.category] += expense.amount;
            } else {
                categories[expense.category] = expense.amount;
            }
        });
        
        // Create chart
        chartContainer.innerHTML = '';
        
        // Find maximum value for scaling
        const maxValue = Math.max(...Object.values(categories));
        
        // Create bars for each category
        Object.entries(categories).forEach(([category, amount]) => {
            const barHeight = (amount / maxValue) * 280; // 280px is the max height
            
            const chartBar = document.createElement('div');
            chartBar.className = 'chart-bar';
            
            chartBar.innerHTML = `
                <span class="chart-bar-amount">₹${amount.toFixed(0)}</span>
                <div class="chart-bar-fill" style="height: ${barHeight}px;"></div>
                <span class="chart-bar-label">${category}</span>
            `;
            
            chartContainer.appendChild(chartBar);
        });
    }
});