// Adds a new custom category row to the interface
function addCategoryRow(name = '', amount = 0) {
    var container = document.getElementById('category-list');
    var row = document.createElement('div');
    row.className = 'category-row';

    row.innerHTML = '<input type="text" class="cat-name" value="' + name + '" placeholder="Category Name" oninput="saveData()">' +
                    '<input type="number" class="cat-amount" value="' + amount + '" min="0" placeholder="Amount" oninput="calculateBudget(); saveData()">' +
                    '<button class="btn btn-del" onclick="removeCategoryRow(this)">×</button>';

    container.appendChild(row);
}

// Removes a specific category row
function removeCategoryRow(button) {
    button.parentElement.remove();
    calculateBudget();
    saveData();
}

// Packages and saves all data into the browser's localStorage memory
function saveData() {
    var income = document.getElementById('income').value;
    var categories = [];

    var rows = document.querySelectorAll('.category-row');
    rows.forEach(function(row) {
        var name = row.querySelector('.cat-name').value;
        var amount = row.querySelector('.cat-amount').value;
        categories.push({ name: name, amount: amount });
    });

    var budgetData = {
        income: income,
        categories: categories
    };

    localStorage.setItem('cozyBudgetData', JSON.stringify(budgetData));
}

// Generates a formatted text file and triggers a browser download
function downloadReport() {
    var income = parseFloat(document.getElementById('income').value) || 0;
    var totalExpenses = 0;

    // Header for the text document
    var textContent = "========================================\n" +
                      "         COZY PLANT BUDGET REPORT       \n" +
                      "========================================\n\n" +
                      "Date Generated: " + new Date().toLocaleDateString() + "\n" +
                      "Monthly Income: $" + income.toLocaleString() + "\n\n" +
                      "----------------------------------------\n" +
                      " EXPENSE CATEGORIES\n" +
                      "----------------------------------------\n";

    var rows = document.querySelectorAll('.category-row');
    rows.forEach(function(row) {
        var name = row.querySelector('.cat-name').value || "Unnamed Category";
        var amount = parseFloat(row.querySelector('.cat-amount').value) || 0;
        totalExpenses += amount;

        // Pad spacing to make it look clean like a real financial statement
        var paddedName = name.padEnd(25, '.');
        textContent += paddedName + " $" + amount.toLocaleString() + "\n";
    });

    var remaining = income - totalExpenses;
    var utilization = income > 0 ? Math.round((totalExpenses / income) * 100) : 0;

    textContent += "\n----------------------------------------\n" +
                   " FINANCIAL SUMMARY\n" +
                   "----------------------------------------\n" +
                   "Total Budget Spent:....... $" + totalExpenses.toLocaleString() + "\n" +
                   "Remaining Balance:........ $" + remaining.toLocaleString() + "\n" +
                   "Plant Height Capacity:.... " + utilization + "%\n\n";

    // Dynamic concluding remark based on budget safety status
    if (remaining < 0) {
        textContent += "Budget Status: NIGHTMARE! Your plant is wilting.\n" +
                       "Action Required: Reduce expenses to balance your soil.\n";
    } else {
        textContent += "Budget Status: COZY & SAFE! Your plant is growing strong.\n" +
                       "Keep up the great work sustaining your garden environment!\n";
    }

    textContent += "========================================\n";

    // Create a virtual file element in memory to handle browser downloading safely
    var blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cozy-budget-report.txt";

    // Force link triggers to execute automatic filesystem system download prompt
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Completely resets the calculator and clears the storage history
function clearAllData() {
    if (confirm("Are you sure you want to clear your data and reset the calculator?")) {
        localStorage.removeItem('cozyBudgetData');
        document.getElementById('income').value = 0;
        document.getElementById('category-list').innerHTML = '';
        calculateBudget();
    }
}

// Loads saved data from the browser memory on startup
function loadData() {
    var savedData = localStorage.getItem('cozyBudgetData');
    var container = document.getElementById('category-list');

    container.innerHTML = '';

    if (savedData) {
        var data = JSON.parse(savedData);
        document.getElementById('income').value = data.income;

        data.categories.forEach(function(cat) {
            addCategoryRow(cat.name, cat.amount);
        });
    } else {
        document.getElementById('income').value = 3000;
        addCategoryRow('Rent', 1000);
        addCategoryRow('Groceries', 400);
    }

    calculateBudget();
}

// Calculates totals and updates plant growth visualization
function calculateBudget() {
    var income = parseFloat(document.getElementById('income').value) || 0;
    var totalExpenses = 0;

    var amountInputs = document.querySelectorAll('.cat-amount');
    amountInputs.forEach(function(input) {
        totalExpenses += parseFloat(input.value) || 0;
    });

    var remaining = income - totalExpenses;
    var stem = document.getElementById('plant-stem');
    var plantStatus = document.getElementById('plant-status');
    var leafL1 = document.getElementById('leaf-l1');
    var leafR2 = document.getElementById('leaf-r2');
    var bud = document.getElementById('flower-bud');

    var totalExpVal = document.getElementById('total-expenses-val');
    var remainingVal = document.getElementById('remaining-val');
    var percentVal = document.getElementById('percent-val');

    totalExpVal.innerText = '$' + totalExpenses.toLocaleString();
    remainingVal.innerText = '$' + remaining.toLocaleString();

    if (income === 0) {
        percentVal.innerText = '0%';
        stem.style.height = '0%';
        plantStatus.innerText = "Empty Soil";
        leafL1.style.opacity = 0;
        leafR2.style.opacity = 0;
        bud.style.opacity = 0;
        return;
    }

    var expensePercent = (totalExpenses / income) * 100;
    var visualPercent = Math.min(Math.max(expensePercent, 0), 100);
    percentVal.innerText = Math.round(expensePercent) + '%';

    if (remaining < 0) {
        stem.style.height = '80%';
        stem.classList.add('wilted');
        remainingVal.classList.add('wilted-text');
        percentVal.classList.add('wilted-text');
        plantStatus.innerText = "Overspent! Plant is Wilting!";
        bud.style.opacity = 0;
    } else {
        stem.style.height = visualPercent + '%';
        stem.classList.remove('wilted');
        remainingVal.classList.remove('wilted-text');
        percentVal.classList.remove('wilted-text');

        leafL1.style.opacity = (visualPercent >= 30) ? 1 : 0;
        leafR2.style.opacity = (visualPercent >= 60) ? 1 : 0;

        if (visualPercent >= 90) {
            bud.style.opacity = 1;
            bud.style.transform = 'scale(1)';
        } else {
            bud.style.opacity = 0;
            bud.style.transform = 'scale(0)';
        }

        if (expensePercent <= 30) {
            plantStatus.innerText = "Fresh Sprout";
        } else if (expensePercent <= 70) {
            plantStatus.innerText = "Growing Strong";
        } else if (expensePercent <= 99) {
            plantStatus.innerText = "Healthy Leaves!";
        } else {
            plantStatus.innerText = "In Full Bloom!";
        }
    }
}

document.getElementById('income').addEventListener('input', saveData);
loadData();
