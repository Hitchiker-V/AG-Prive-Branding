document.addEventListener('DOMContentLoaded', () => {
    const htmlFileInput = document.getElementById('htmlFileInput');
    const newsletterForm = document.getElementById('newsletterForm');
    const outputContainer = document.getElementById('outputContainer');
    const generateBtn = document.getElementById('generateBtn');
    let sourceDoc = null;

    // --- 1. FILE INPUT AND PARSING ---
    htmlFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const parser = new DOMParser();
            sourceDoc = parser.parseFromString(content, 'text/html');
            populateForm(sourceDoc);
            newsletterForm.classList.remove('hidden');
            outputContainer.classList.add('hidden');
        };
        reader.readAsText(file);
    });

    // --- 2. POPULATING THE UI FORM ---
    function populateForm(doc) {
        const allH2s = [...doc.querySelectorAll('h2.heading-font')];

        // --- Intro Section ---
        const newsletterTitleEl = doc.querySelector('p.sc-heading-font');
        if (newsletterTitleEl) {
            document.getElementById('newsletterTitle').value = newsletterTitleEl.innerText;
            const newsletterDateEl = newsletterTitleEl.nextElementSibling;
            if (newsletterDateEl) document.getElementById('newsletterDate').value = newsletterDateEl.innerText;
        }
        const introHeadingEl = doc.querySelector('h1.heading-font');
        if (introHeadingEl) {
            document.getElementById('introHeading').value = introHeadingEl.innerText;
            const introContentEl = introHeadingEl.nextElementSibling;
            if (introContentEl) {
                document.getElementById('introContent').value = introContentEl.innerHTML.replace(/<br\s*\/?\?>/gi, '\n').trim();
            }
        }

        // --- Chart of the Week ---
        const chartHeadingEl = allH2s.find(h => h.innerText.includes('Chart of the Week'));
        if (chartHeadingEl) {
            document.getElementById('chartHeading').value = chartHeadingEl.innerText;
            const chartTable = chartHeadingEl.nextElementSibling;
            if (chartTable) {
                const chartImage = chartTable.querySelector('img.img-responsive');
                if (chartImage) document.getElementById('chartImageUrl').value = chartImage.src;
                const insightDiv = chartTable.nextElementSibling;
                if (insightDiv) {
                    const insightP = insightDiv.querySelector('p.body-font');
                    if (insightP) document.getElementById('chartInsight').value = insightP.innerText.trim();
                }
            }
        }

        // --- Market Watch ---
        const marketWatchHeading = allH2s.find(h => h.innerText.includes('Market Watch'));
        if (marketWatchHeading) {
            const tableContainerDiv = marketWatchHeading.nextElementSibling;
            if (tableContainerDiv) {
                const originalTable = tableContainerDiv.querySelector('table');
                populateEditableTable(originalTable, '#marketWatchTable');
                const paragraphs = tableContainerDiv.querySelectorAll('p.body-font');
                if (paragraphs.length >= 2) {
                    document.getElementById('marketWatchDate').value = paragraphs[0].innerText;
                    document.getElementById('marketWatchSources').value = paragraphs[1].innerText;
                }
            }
        }

        // --- Broad Market View ---
        const broadMarketViewHeading = allH2s.find(h => h.innerText.includes('Broad Market View'));
        if (broadMarketViewHeading) {
            document.getElementById('marketViewHeading').value = broadMarketViewHeading.innerText;
            const marketViewContentEl = broadMarketViewHeading.nextElementSibling;
            if (marketViewContentEl) {
                document.getElementById('marketViewContent').value = marketViewContentEl.innerHTML.replace(/<br\s*\/?\?>/gi, '\n').trim();
            }
        }
        
        // --- Commodity Corner ---
        const commodityCornerHeading = allH2s.find(h => h.innerText.includes('Commodity Corner'));
        if (commodityCornerHeading) {
            const table1 = commodityCornerHeading.nextElementSibling;
            const table2 = table1.nextElementSibling;
            populateCommodityTable([table1, table2], '#commodityCornerTable');
            const dateP = table2.nextElementSibling;
            if(dateP) document.getElementById('commodityCornerDate').value = dateP.innerText;
            const sourceP = dateP.nextElementSibling;
            if(sourceP) document.getElementById('commodityCornerSources').value = sourceP.innerText;
        }

        // --- Theme of the Week ---
        const themeHeading = allH2s.find(h => h.innerText.includes('Theme of the Week'));
        if(themeHeading) {
            document.getElementById('themeHeading').value = themeHeading.innerText;
            const themeContent = themeHeading.nextElementSibling;
            if(themeContent) document.getElementById('themeContent').value = themeContent.innerHTML.replace(/<br\s*\/?\?>/gi, '\n').trim();
            const themeSources = themeContent.nextElementSibling;
            if(themeSources) document.getElementById('themeSources').value = themeSources.innerText;
        }

        // --- Deals Under Watch ---
        const dealsHeading = doc.querySelector('h2[style*="color:#BA9851"]');
        if(dealsHeading) {
            const dealsList = dealsHeading.nextElementSibling;
            if (dealsList) {
                populateDealsList(dealsList, '#dealsWatchList');
                const dealsSource = dealsList.nextElementSibling;
                if(dealsSource) document.getElementById('dealsWatchSources').value = dealsSource.innerText;
            }
        }

        // --- Weekly Reading List ---
        const readingListHeading = allH2s.find(h => h.innerText.includes('Weekly Reading List'));
        if(readingListHeading){
            const parent = readingListHeading.parentElement;
            populateReadingList(parent, '#readingList');
        }
    }

    function populateEditableTable(originalTable, containerId) {
        const tableContainer = document.querySelector(containerId);
        tableContainer.innerHTML = '';
        if (!originalTable) return;

        const newTable = document.createElement('table');
        const rows = originalTable.querySelectorAll('tr');
        rows.forEach((row) => {
            const newRow = newTable.insertRow();
            const cells = row.querySelectorAll('td, th');
            cells.forEach(cell => {
                const newCell = newRow.insertCell();
                if (cell.tagName === 'TH' || (row.parentElement.tagName === 'TBODY' && row.rowIndex === 0) ) {
                    newCell.outerHTML = `<th>${cell.innerText}</th>`;
                } else {
                    newCell.innerHTML = `<input type="text" value="${cell.innerText.trim()}">`;
                }
            });
        });
        tableContainer.appendChild(newTable);
    }
    
    function populateCommodityTable(tables, containerId) {
        const tableContainer = document.querySelector(containerId);
        tableContainer.innerHTML = '';
        const newTable = document.createElement('table');
        newTable.innerHTML = `<thead><tr><th>Commodity</th><th>Value</th><th>Change</th><th>Unit</th></tr></thead>`;
        const tbody = document.createElement('tbody');

        tables.forEach(table => {
            const commDivs = table.querySelectorAll('.col-split > div');
            commDivs.forEach(commDiv => {
                const row = tbody.insertRow();
                const name = commDiv.querySelector('h3').innerText;
                const pElements = commDiv.querySelectorAll('p.body-font');
                const valueFull = pElements[0] ? pElements[0].innerText : '';
                const unit = pElements[1] ? pElements[1].innerText : '';
                
                const valueMatch = valueFull.match(/^(.*?)\s*\((.*?)\)$/);
                const value = valueMatch ? valueMatch[1].trim() : valueFull;
                const change = valueMatch ? `(${valueMatch[2].trim()})` : '';

                row.insertCell().innerHTML = `<input type="text" value="${name}">`;
                row.insertCell().innerHTML = `<input type="text" value="${value}">`;
                row.insertCell().innerHTML = `<input type="text" value="${change}">`;
                row.insertCell().innerHTML = `<input type="text" value="${unit}">`;
            });
        });
        newTable.appendChild(tbody);
        tableContainer.appendChild(newTable);
    }

    function populateDealsList(listElement, containerId) {
        const container = document.querySelector(containerId);
        container.innerHTML = '';
        const listItems = listElement.querySelectorAll('li');
        listItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `<textarea rows="4">${item.innerHTML.replace(/<br\s*\/?\?>/gi, '\n').trim()}</textarea>`;
            container.appendChild(div);
        });
    }

    function populateReadingList(parent, containerId) {
        const container = document.querySelector(containerId);
        container.innerHTML = '';
        const items = parent.querySelectorAll('a[target="_blank"]');
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'list-item';
            const url = item.href;
            const title = item.innerText;
            const description = item.nextElementSibling ? item.nextElementSibling.innerText : '';
            div.innerHTML =
                `<label>URL:</label><input type="url" value="${url}">` +
                `<label>Title:</label><input type="text" value="${title}">` +
                `<label>Description:</label><textarea rows="2">${description}</textarea>`;
            container.appendChild(div);
        });
    }

    // --- 3. GENERATE BUTTON CLICK ---
    generateBtn.addEventListener('click', () => {
        if (!sourceDoc) {
            alert("Please upload an HTML file first.");
            return;
        }

        let newDoc = sourceDoc.cloneNode(true);
        updateDoc(newDoc);
        
        const finalHtml = '<!DOCTYPE html>\n' + newDoc.documentElement.outerHTML;
        document.getElementById('outputHtml').value = finalHtml;
        outputContainer.classList.remove('hidden');
    });

    // --- 4. UPDATING THE Cloned Document ---
    function updateDoc(doc) {
        // --- Update Intro ---
        const newsletterTitleEl = doc.querySelector('p.sc-heading-font');
        if (newsletterTitleEl) {
            newsletterTitleEl.innerText = document.getElementById('newsletterTitle').value;
            const newsletterDateEl = newsletterTitleEl.nextElementSibling;
            if (newsletterDateEl) newsletterDateEl.innerText = document.getElementById('newsletterDate').value;
        }
        const introHeadingEl = doc.querySelector('h1.heading-font');
        if (introHeadingEl) {
            introHeadingEl.innerText = document.getElementById('introHeading').value;
            const introContentEl = introHeadingEl.nextElementSibling;
            if (introContentEl) {
                introContentEl.innerHTML = document.getElementById('introContent').value.replace(/\n/g, '<br>');
            }
        }
        
        // --- Update Chart ---
        const allH2s = [...doc.querySelectorAll('h2.heading-font')];
        const chartHeadingEl = allH2s.find(h => h.innerText.includes('Chart of the Week'));
        if (chartHeadingEl) {
            chartHeadingEl.innerText = document.getElementById('chartHeading').value;
            const chartTable = chartHeadingEl.nextElementSibling;
            if (chartTable) {
                const chartImage = chartTable.querySelector('img.img-responsive');
                if (chartImage) chartImage.src = document.getElementById('chartImageUrl').value;
                const insightDiv = chartTable.nextElementSibling;
                if (insightDiv) {
                    const insightP = insightDiv.querySelector('p.body-font');
                    if (insightP) insightP.innerHTML = document.getElementById('chartInsight').value.replace(/\n/g, '<br>');
                }
            }
        }

        // --- Update Market Watch ---
        const marketWatchHeading = allH2s.find(h => h.innerText.includes('Market Watch'));
        if (marketWatchHeading) {
            const tableContainerDiv = marketWatchHeading.nextElementSibling;
            const originalTable = tableContainerDiv.querySelector('table');
            const uiTable = document.querySelector('#marketWatchTable table');
            if (originalTable && uiTable) {
                const newTbody = document.createElement('tbody');
                const uiRows = uiTable.querySelectorAll('tr');
                 uiRows.forEach((uiRow, index) => {
                    if (index === 0) return; // Skip header
                    const newTr = newTbody.insertRow();
                    const uiCells = uiRow.querySelectorAll('input');
                    uiCells.forEach(uiCell => {
                        const newTd = newTr.insertCell();
                        newTd.innerText = uiCell.value;
                        // Copy styles and attributes from original
                        const originalCell = originalTable.querySelector(`tr:nth-child(${index + 1}) td:nth-child(${newTr.cells.length})`);
                        if(originalCell) {
                           newTd.setAttribute('style', originalCell.getAttribute('style'));
                           newTd.setAttribute('class', originalCell.getAttribute('class'));
                        }
                    });
                });
                originalTable.querySelector('tbody').innerHTML = newTbody.innerHTML;
            }
            const paragraphs = tableContainerDiv.querySelectorAll('p.body-font');
            if (paragraphs.length >= 2) {
                paragraphs[0].innerText = document.getElementById('marketWatchDate').value;
                paragraphs[1].innerText = document.getElementById('marketWatchSources').value;
            }
        }

        // --- Update Broad Market View ---
        const broadMarketViewHeading = allH2s.find(h => h.innerText.includes('Broad Market View'));
        if (broadMarketViewHeading) {
            broadMarketViewHeading.innerText = document.getElementById('marketViewHeading').value;
            const marketViewContentEl = broadMarketViewHeading.nextElementSibling;
            if (marketViewContentEl) {
                marketViewContentEl.innerHTML = document.getElementById('marketViewContent').value.replace(/\n/g, '<br>');
            }
        }
        
        // --- Update Commodity Corner ---
        const commodityCornerHeading = allH2s.find(h => h.innerText.includes('Commodity Corner'));
        if(commodityCornerHeading){
            const uiTable = document.querySelector('#commodityCornerTable table');
            const commDivs = [...doc.querySelectorAll('.col-split > div')];
            const uiRows = uiTable.querySelectorAll('tbody tr');

            uiRows.forEach((uiRow, index) => {
                const commDiv = commDivs[index];
                if (!commDiv) return;
                const inputs = uiRow.querySelectorAll('input');
                commDiv.querySelector('h3').innerText = inputs[0].value;
                const pValue = commDiv.querySelector('h3 + p');
                if (pValue) pValue.innerHTML = `${inputs[1].value} <span style="font-size:14px; color: ${inputs[2].value.includes('-') ? '#d9534f' : '#5cb85c'};">${inputs[2].value}</span>`;
                const pUnit = commDiv.querySelector('h3 + p + p');
                if (pUnit) pUnit.innerText = inputs[3].value;
            });
            const dateP = commodityCornerHeading.nextElementSibling.nextElementSibling.nextElementSibling;
            if(dateP) dateP.innerText = document.getElementById('commodityCornerDate').value;
            const sourceP = dateP.nextElementSibling;
            if(sourceP) sourceP.innerText = document.getElementById('commodityCornerSources').value;
        }

        // --- Update Theme of the Week ---
         const themeHeading = allH2s.find(h => h.innerText.includes('Theme of the Week'));
        if(themeHeading) {
            themeHeading.innerText = document.getElementById('themeHeading').value;
            const themeContent = themeHeading.nextElementSibling;
            if(themeContent) themeContent.innerHTML = document.getElementById('themeContent').value.replace(/\n/g, '<br>');
            const themeSources = themeContent.nextElementSibling;
            if(themeSources) themeSources.innerText = document.getElementById('themeSources').value;
        }
        
        // --- Update Deals ---
        const dealsHeading = doc.querySelector('h2[style*="color:#BA9851"]');
        if(dealsHeading) {
            const dealsList = dealsHeading.nextElementSibling;
            if (dealsList) {
                const uiTextareas = document.querySelectorAll('#dealsWatchList textarea');
                dealsList.innerHTML = [...uiTextareas].map(t => `<li style="margin-bottom:10px;">${t.value.replace(/\n/g, '<br>')}</li>`).join('');
                 const dealsSource = dealsList.nextElementSibling;
                if(dealsSource) dealsSource.innerText = document.getElementById('dealsWatchSources').value;
            }
        }

        // --- Update Reading List ---
        const readingListHeading = allH2s.find(h => h.innerText.includes('Weekly Reading List'));
        if (readingListHeading) {
            const parent = readingListHeading.parentElement;
            const uiItems = document.querySelectorAll('#readingList .list-item');
            const originalLinks = parent.querySelectorAll('a[target="_blank"]');
            
            uiItems.forEach((uiItem, index) => {
                const inputs = uiItem.querySelectorAll('input, textarea');
                const originalLink = originalLinks[index];
                if(originalLink) {
                    originalLink.href = inputs[0].value;
                    originalLink.innerHTML = `&#10148; ${inputs[1].value}`;
                    const descSpan = originalLink.nextElementSibling;
                    if(descSpan) descSpan.innerText = inputs[2].value;
                }
            });
        }
    }
});