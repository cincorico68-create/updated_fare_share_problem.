let people = [];
let items = [];


document.getElementById('addNameField').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-input';
    input.placeholder = 'Name';
    document.getElementById('nameInputs').appendChild(input);
});


document.getElementById('startBtn').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.name-input');
    people = Array.from(inputs).map(i => i.value.trim()).filter(v => v !== "");

    if (people.length < 2) return alert("Please enter at least 2 names.");

    renderCheckboxes();
    renderDashboard();
    document.getElementById('setupScreen').style.display = 'none';
});


function renderCheckboxes() {
    const container = document.getElementById('participantCheckboxes');
    container.innerHTML = '';
    people.forEach(name => {
        const div = document.createElement('div');
        div.className = 'check-item';
        div.innerHTML = `<input type="checkbox" value="${name}" checked> ${name}`;
        container.appendChild(div);
    });
}


document.getElementById('addItem').addEventListener('click', () => {
    const nameInput = document.getElementById('itemName');
    const priceInput = document.getElementById('itemPrice');
    const price = parseFloat(priceInput.value);
    
   
    const selected = Array.from(document.querySelectorAll('#participantCheckboxes input:checked'))
                          .map(cb => cb.value);

    if (isNaN(price) || selected.length === 0) return alert("Enter price and select at least 1 person.");

    items.push({
        name: nameInput.value || "Item",
        price: price,
        participants: selected
    });

    nameInput.value = '';
    priceInput.value = '';
    updateUI();
});


function updateUI() {
    const list = document.getElementById('itemList');
    list.innerHTML = '';
    
   
    const totals = {};
    people.forEach(p => totals[p] = 0);

    items.forEach((item, index) => {
        const share = item.price / item.participants.length;
        item.participants.forEach(p => totals[p] += share);

        const li = document.createElement('li');
        li.className = 'item-row';
        li.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <span class="item-subtext">Split by: ${item.participants.join(', ')} ($${share.toFixed(2)} ea)</span>
            </div>
            <strong>$${item.price.toFixed(2)}</strong>
        `;
        list.appendChild(li);
    });

   
    people.forEach(p => {
        document.getElementById(`total-${p}`).innerText = `$${totals[p].toFixed(2)}`;
    });
}

function renderDashboard() {
    const dash = document.getElementById('dashBoard');
    dash.innerHTML = people.map(p => `
        <div class="dash-box">
            <small>${p}</small>
            <h3 id="total-${p}">$0.00</h3>
        </div>
    `).join('');
}


document.getElementById('resetBtn').addEventListener('click', () => {
    if(confirm("Start a new split?")) location.reload();
});


document.getElementById('printReceiptBtn').addEventListener('click', async () => {
    if (items.length === 0) return alert("No items to print or save yet!");

    // Generate plain text content for the file download
    let receiptText = `=== FARESHARE PRO RECEIPT ===\r\n\r\n`;
    receiptText += `ITEMS:\r\n`;
    
    const totals = {};
    people.forEach(p => totals[p] = 0);

    items.forEach(item => {
        const share = item.price / item.participants.length;
        item.participants.forEach(p => totals[p] += share);
        receiptText += `- ${item.name}: $${item.price.toFixed(2)} (Split by: ${item.participants.join(', ')} - $${share.toFixed(2)} each)\r\n`;
    });

    receiptText += `\r\n===INDIVIDUAL BREAKDOWN===\r\n`;
    people.forEach(p => {
        receiptText += `${p}: $${totals[p].toFixed(2)}\r\n`;
    });

    
    if ('showSaveFilePicker' in window) {
        try {
            const options = {
                suggestedName: 'fareshare-receipt.txt',
                types: [{
                    description: 'Text Files',
                    accept: { 'text/plain': ['.txt'] },
                }],
            };
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            await writable.write(receiptText);
            await writable.close();
        } catch (err) {
         
            console.log('Save process cancelled or unsupported:', err);
        }
    } else {
   
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'fareshare-receipt.txt';
        a.click();
    }

   
    window.print();
});