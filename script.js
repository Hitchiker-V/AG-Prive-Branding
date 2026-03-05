document.addEventListener('DOMContentLoaded', () => {
    const htmlFileInput = document.getElementById('htmlFileInput');
    const newsletterForm = document.getElementById('newsletterForm');
    const outputContainer = document.getElementById('outputContainer');
    const generateBtn = document.getElementById('generateBtn');
    let sourceDoc = null;

    // =========================================================================
    // RICH-TEXT EDITOR HELPER
    // =========================================================================
    /**
     * Creates a contenteditable rich-text editor with a mini toolbar (Bold + Line Break).
     * Returns a wrapper div element containing the toolbar and the editable area.
     * @param {string} initialHtml - The initial HTML content for the editor.
     * @param {string} id - A unique id to assign to the editable div.
     * @param {number} [minHeight=80] - Minimum height in px.
     * @returns {HTMLDivElement} The wrapper element.
     */
    function createRichTextEditor(initialHtml, id, minHeight) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rich-text-wrapper';

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'rich-text-toolbar';

        const boldBtn = document.createElement('button');
        boldBtn.type = 'button';
        boldBtn.innerHTML = '<b>B</b>';
        boldBtn.title = 'Bold';
        boldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editor.focus();
            document.execCommand('bold', false, null);
        });

        const brBtn = document.createElement('button');
        brBtn.type = 'button';
        brBtn.textContent = '¶';
        brBtn.title = 'Insert Line Break';
        brBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editor.focus();
            document.execCommand('insertHTML', false, '<br>');
        });

        toolbar.appendChild(boldBtn);
        toolbar.appendChild(brBtn);

        // Editable area
        const editor = document.createElement('div');
        editor.className = 'rich-text-editor';
        editor.contentEditable = 'true';
        editor.id = id;
        editor.innerHTML = initialHtml;
        if (minHeight) editor.style.minHeight = minHeight + 'px';

        wrapper.appendChild(toolbar);
        wrapper.appendChild(editor);
        return wrapper;
    }

    // =========================================================================
    // TREND ARROW PICKER HELPER
    // =========================================================================
    /**
     * Creates a trend picker widget with ▲/▼ buttons and a text input.
     * @param {string} currentArrow - '▲' or '▼'
     * @param {string} currentLabel - e.g. 'Bullish', 'Bearish'
     * @returns {HTMLDivElement}
     */
    function createTrendPicker(currentArrow, currentLabel) {
        const picker = document.createElement('div');
        picker.className = 'trend-picker';

        const upBtn = document.createElement('button');
        upBtn.type = 'button';
        upBtn.className = 'arrow-btn up' + (currentArrow === '▲' ? ' selected' : '');
        upBtn.textContent = '▲';
        upBtn.title = 'Up (Bullish)';

        const downBtn = document.createElement('button');
        downBtn.type = 'button';
        downBtn.className = 'arrow-btn down' + (currentArrow === '▼' ? ' selected' : '');
        downBtn.textContent = '▼';
        downBtn.title = 'Down (Bearish)';

        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.value = currentLabel;
        labelInput.placeholder = 'Bullish / Bearish';

        upBtn.addEventListener('click', () => {
            upBtn.classList.add('selected');
            downBtn.classList.remove('selected');
        });
        downBtn.addEventListener('click', () => {
            downBtn.classList.add('selected');
            upBtn.classList.remove('selected');
        });

        picker.appendChild(upBtn);
        picker.appendChild(downBtn);
        picker.appendChild(labelInput);
        return picker;
    }

    // =========================================================================
    // 1. FILE INPUT AND PARSING
    // =========================================================================
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

    // =========================================================================
    // 2. POPULATING THE UI FORM
    // =========================================================================
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
                // Replace the plain textarea with a rich-text editor
                const container = document.getElementById('introContent').parentElement;
                const oldTextarea = document.getElementById('introContent');
                const richEditor = createRichTextEditor(introContentEl.innerHTML.trim(), 'introContent', 120);
                container.replaceChild(richEditor, oldTextarea);
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
                    if (insightP) {
                        // Replace textarea with rich-text editor
                        const container = document.getElementById('chartInsight').parentElement;
                        const oldTextarea = document.getElementById('chartInsight');
                        const richEditor = createRichTextEditor(insightP.innerHTML.trim(), 'chartInsight', 100);
                        container.replaceChild(richEditor, oldTextarea);
                    }
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
                // Replace textarea with rich-text editor
                const container = document.getElementById('marketViewContent').parentElement;
                const oldTextarea = document.getElementById('marketViewContent');
                const richEditor = createRichTextEditor(marketViewContentEl.innerHTML.trim(), 'marketViewContent', 120);
                container.replaceChild(richEditor, oldTextarea);
            }
        }

        // --- Commodity Corner ---
        const commodityCornerHeading = allH2s.find(h => h.innerText.includes('Commodity Corner'));
        if (commodityCornerHeading) {
            const table1 = commodityCornerHeading.nextElementSibling;
            const table2 = table1.nextElementSibling;
            populateCommodityTable([table1, table2], '#commodityCornerTable');
            const dateP = table2.nextElementSibling;
            if (dateP) document.getElementById('commodityCornerDate').value = dateP.innerText;
            const sourceP = dateP.nextElementSibling;
            if (sourceP) document.getElementById('commodityCornerSources').value = sourceP.innerText;
        }

        // --- Theme of the Week ---
        const themeHeading = allH2s.find(h => h.innerText.includes('Theme of the Week'));
        if (themeHeading) {
            document.getElementById('themeHeading').value = themeHeading.innerText;
            const themeContent = themeHeading.nextElementSibling;
            if (themeContent) {
                // Replace textarea with rich-text editor
                const container = document.getElementById('themeContent').parentElement;
                const oldTextarea = document.getElementById('themeContent');
                const richEditor = createRichTextEditor(themeContent.innerHTML.trim(), 'themeContent', 160);
                container.replaceChild(richEditor, oldTextarea);
            }
            const themeSources = themeHeading.nextElementSibling?.nextElementSibling;
            if (themeSources) document.getElementById('themeSources').value = themeSources.innerText;
        }

        // --- Deals Under Watch ---
        const dealsHeading = doc.querySelector('h2[style*="color:#BA9851"]');
        if (dealsHeading) {
            const dealsList = dealsHeading.nextElementSibling;
            if (dealsList) {
                populateDealsList(dealsList, '#dealsWatchList');
                const dealsSource = dealsList.nextElementSibling;
                if (dealsSource) document.getElementById('dealsWatchSources').value = dealsSource.innerText;
            }
        }

        // --- Expert's Opinion ---
        const expertHeading = allH2s.find(h => h.innerText.includes("Expert's Opinion"));
        if (expertHeading) {
            const expertParent = expertHeading.parentElement;
            const expertPs = expertParent.querySelectorAll('p.body-font');
            // expertPs[0] = heading line (Q&A with...)
            // expertPs[1] = Q1, expertPs[2] = A1
            // expertPs[3] = Q2, expertPs[4] = A2
            if (expertPs.length >= 1) {
                const headingStrong = expertPs[0].querySelector('strong');
                document.getElementById('expertHeading').value = headingStrong ? headingStrong.innerText : '';
            }
            if (expertPs.length >= 2) {
                const q1Span = expertPs[1].querySelector('span');
                document.getElementById('expertQ1').value = q1Span ? q1Span.innerText : '';
            }
            if (expertPs.length >= 3) {
                document.getElementById('expertA1').value = expertPs[2].innerText;
            }
            if (expertPs.length >= 4) {
                const q2Span = expertPs[3].querySelector('span');
                document.getElementById('expertQ2').value = q2Span ? q2Span.innerText : '';
            }
            if (expertPs.length >= 5) {
                document.getElementById('expertA2').value = expertPs[4].innerText;
            }
        }

        // --- Weekly Reading List ---
        const readingListHeading = allH2s.find(h => h.innerText.includes('Weekly Reading List'));
        if (readingListHeading) {
            const parent = readingListHeading.parentElement;
            populateReadingList(parent, '#readingList');
        }
    }

    // =========================================================================
    // MARKET WATCH TABLE — with Trend Arrow Picker
    // =========================================================================
    function populateEditableTable(originalTable, containerId) {
        const tableContainer = document.querySelector(containerId);
        tableContainer.innerHTML = '';
        if (!originalTable) return;

        const newTable = document.createElement('table');
        const rows = originalTable.querySelectorAll('tr');
        const headerCells = rows[0] ? rows[0].querySelectorAll('td, th') : [];
        const trendColIndex = [...headerCells].findIndex(c => c.innerText.trim().toLowerCase() === 'trend');

        rows.forEach((row, rowIdx) => {
            const newRow = newTable.insertRow();
            const cells = row.querySelectorAll('td, th');
            cells.forEach((cell, colIdx) => {
                const newCell = newRow.insertCell();
                // Header row
                if (rowIdx === 0) {
                    newCell.outerHTML = `<th>${cell.innerText}</th>`;
                }
                // Trend column — use arrow picker
                else if (colIdx === trendColIndex && trendColIndex !== -1) {
                    const trendText = cell.innerText.trim();
                    const arrow = trendText.startsWith('▲') ? '▲' : '▼';
                    const label = trendText.replace(/^[▲▼]\s*/, '');
                    const picker = createTrendPicker(arrow, label);
                    newCell.appendChild(picker);
                }
                // Regular columns — plain input
                else {
                    newCell.innerHTML = `<input type="text" value="${cell.innerText.trim()}">`;
                }
            });
        });
        tableContainer.appendChild(newTable);
    }

    // =========================================================================
    // COMMODITY CORNER TABLE — with value/change split & auto-color
    // =========================================================================
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

                // Hardened regex: handle large whitespace gaps inside parentheses
                const valueMatch = valueFull.match(/^(.*?)\s*\(\s*(.*?)\s*\)$/);
                const value = valueMatch ? valueMatch[1].trim() : valueFull;
                const change = valueMatch ? `(${valueMatch[2].trim()})` : '';

                // Determine color class for change
                const changeColorClass = change.includes('-') ? 'change-negative' : 'change-positive';

                row.insertCell().innerHTML = `<input type="text" value="${name}">`;
                row.insertCell().innerHTML = `<input type="text" value="${value}">`;
                const changeCell = row.insertCell();
                const changeInput = document.createElement('input');
                changeInput.type = 'text';
                changeInput.value = change;
                changeInput.className = changeColorClass;
                // Auto-update color on edit
                changeInput.addEventListener('input', function () {
                    this.className = this.value.includes('-') ? 'change-negative' : 'change-positive';
                });
                changeCell.appendChild(changeInput);
                row.insertCell().innerHTML = `<input type="text" value="${unit}">`;
            });
        });
        newTable.appendChild(tbody);
        tableContainer.appendChild(newTable);
    }

    // =========================================================================
    // DEALS UNDER WATCH — with rich-text editors
    // =========================================================================
    function populateDealsList(listElement, containerId) {
        const container = document.querySelector(containerId);
        container.innerHTML = '';
        const listItems = listElement.querySelectorAll('li');
        listItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            const label = document.createElement('label');
            label.textContent = `Deal ${index + 1}:`;
            div.appendChild(label);
            const richEditor = createRichTextEditor(item.innerHTML.trim(), `deal_${index}`, 60);
            div.appendChild(richEditor);
            container.appendChild(div);
        });
    }

    // =========================================================================
    // WEEKLY READING LIST — with rich-text description & ➤ dedup fix
    // =========================================================================
    function populateReadingList(parent, containerId) {
        const container = document.querySelector(containerId);
        container.innerHTML = '';
        const items = parent.querySelectorAll('a[target="_blank"]');
        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            const url = item.href;
            // Strip leading ➤ (and its whitespace) to prevent double-icon in output
            const rawTitle = item.innerText;
            const title = rawTitle.replace(/^➤\s*/, '').replace(/^➤\s*/, '').trim();
            const descSpan = item.parentElement ? item.parentElement.querySelector('span') : null;
            const description = descSpan ? descSpan.innerHTML.trim() : '';

            const urlLabel = document.createElement('label');
            urlLabel.textContent = 'URL:';
            const urlInput = document.createElement('input');
            urlInput.type = 'url';
            urlInput.value = url;

            const titleLabel = document.createElement('label');
            titleLabel.textContent = 'Title:';
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = title;

            const descLabel = document.createElement('label');
            descLabel.textContent = 'Description:';

            div.appendChild(urlLabel);
            div.appendChild(urlInput);
            div.appendChild(titleLabel);
            div.appendChild(titleInput);
            div.appendChild(descLabel);
            const richEditor = createRichTextEditor(description, `reading_desc_${index}`, 50);
            div.appendChild(richEditor);
            container.appendChild(div);
        });
    }

    // =========================================================================
    // HTML SANITIZER — strips Google Docs / paste artifacts
    // =========================================================================
    /**
     * Cleans HTML from contenteditable rich-text editors before writing
     * into the newsletter template. Removes Google Docs spans, unwanted
     * inline styles (font-family, font-size, etc.) and converts <div>
     * wrappers into <br> tags. Preserves <b>, <strong>, <i>, <em>, <br>.
     */
    function sanitizeRichTextHtml(html) {
        // Create a temporary container to work with the DOM
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // 1. Convert <div> blocks to <br> + inline content (divs inside <p> break HTML)
        temp.querySelectorAll('div').forEach(div => {
            const br = document.createElement('br');
            div.before(br);
            while (div.firstChild) {
                div.before(div.firstChild);
            }
            div.remove();
        });

        // 2. Remove <font> elements, keep their children
        temp.querySelectorAll('font').forEach(font => {
            while (font.firstChild) {
                font.before(font.firstChild);
            }
            font.remove();
        });

        // 3. Strip unwanted inline styles from <span> elements
        temp.querySelectorAll('span').forEach(span => {
            if (span.style.length > 0) {
                // Remove properties that override newsletter fonts
                const propsToRemove = [];
                for (let i = 0; i < span.style.length; i++) {
                    const prop = span.style[i];
                    if (prop.startsWith('font-family') ||
                        prop.startsWith('font-size') ||
                        prop.startsWith('font-variant') ||
                        prop === 'white-space-collapse' ||
                        prop === 'vertical-align' ||
                        prop === 'background-color') {
                        propsToRemove.push(prop);
                    }
                }
                propsToRemove.forEach(p => span.style.removeProperty(p));

                // If no styles remain, unwrap the span entirely
                if (span.style.length === 0) {
                    while (span.firstChild) {
                        span.before(span.firstChild);
                    }
                    span.remove();
                } else {
                    // Also remove the id attribute (Google Docs IDs)
                    span.removeAttribute('id');
                }
            } else {
                // No styles — unwrap
                while (span.firstChild) {
                    span.before(span.firstChild);
                }
                span.remove();
            }
        });

        // 4. Remove Google Docs internal guid spans by id
        temp.querySelectorAll('[id^="docs-internal-guid"]').forEach(el => {
            while (el.firstChild) {
                el.before(el.firstChild);
            }
            el.remove();
        });

        // 5. Clean up multiple consecutive <br> tags (max 2)
        let result = temp.innerHTML;
        result = result.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
        // Remove leading <br>
        result = result.replace(/^(\s*<br\s*\/?>\s*)+/, '');

        return result;
    }

    // =========================================================================
    // 3. GENERATE BUTTON CLICK
    // =========================================================================
    generateBtn.addEventListener('click', () => {
        if (!sourceDoc) {
            alert("Please upload an HTML file first.");
            return;
        }

        let newDoc = sourceDoc.cloneNode(true);
        updateDoc(newDoc);

        let finalHtml = '<!DOCTYPE html>\n' + newDoc.documentElement.outerHTML;
        // Fix DOMParser double-encoding of & inside href attributes (breaks Google Fonts URL)
        finalHtml = finalHtml.replace(/href="([^"]*)"/g, (match, url) => {
            return 'href="' + url.replace(/&amp;/g, '&') + '"';
        });
        document.getElementById('outputHtml').value = finalHtml;
        outputContainer.classList.remove('hidden');

        // Automatic Download
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'newsletter.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    });

    // =========================================================================
    // 4. UPDATING THE CLONED DOCUMENT
    // =========================================================================
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
                introContentEl.innerHTML = sanitizeRichTextHtml(document.getElementById('introContent').innerHTML);
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
                    if (insightP) insightP.innerHTML = sanitizeRichTextHtml(document.getElementById('chartInsight').innerHTML);
                }
            }
        }

        // --- Update Market Watch (with Trend Arrow support) ---
        const marketWatchHeading = allH2s.find(h => h.innerText.includes('Market Watch'));
        if (marketWatchHeading) {
            const tableContainerDiv = marketWatchHeading.nextElementSibling;
            const originalTable = tableContainerDiv.querySelector('table');
            const uiTable = document.querySelector('#marketWatchTable table');
            if (originalTable && uiTable) {
                const uiRows = uiTable.querySelectorAll('tr');
                const headerCells = uiRows[0] ? uiRows[0].querySelectorAll('th') : [];
                const trendColIndex = [...headerCells].findIndex(c => c.innerText.trim().toLowerCase() === 'trend');
                const oneWColIndex = [...headerCells].findIndex(c => c.innerText.trim().toLowerCase().includes('1w'));
                const oneMColIndex = [...headerCells].findIndex(c => c.innerText.trim().toLowerCase().includes('1m'));

                uiRows.forEach((uiRow, index) => {
                    if (index === 0) return; // Skip header
                    const originalRow = originalTable.querySelector(`tr:nth-child(${index + 1})`);
                    if (!originalRow) return;
                    const originalCells = originalRow.querySelectorAll('td');
                    const uiCells = uiRow.querySelectorAll('td');

                    uiCells.forEach((uiCell, colIdx) => {
                        const originalCell = originalCells[colIdx];
                        if (!originalCell) return;

                        // Trend column — read from picker
                        if (colIdx === trendColIndex && trendColIndex !== -1) {
                            const picker = uiCell.querySelector('.trend-picker');
                            if (picker) {
                                const selectedUp = picker.querySelector('.arrow-btn.up.selected');
                                const arrow = selectedUp ? '▲' : '▼';
                                const color = selectedUp ? '#5cb85c' : '#d9534f';
                                const label = picker.querySelector('input').value;
                                originalCell.innerHTML = `${arrow} ${label}`;
                                const currentStyle = originalCell.getAttribute('style') || "";
                                originalCell.setAttribute('style', currentStyle.replace(/color:\s*#[a-fA-F0-9]{6}/, `color:${color}`));
                            }
                        } else {
                            // Regular column
                            const input = uiCell.querySelector('input');
                            if (input) {
                                originalCell.innerText = input.value;

                                // Auto-color for percentage columns (1W% and 1M%)
                                if (colIdx === oneWColIndex || colIdx === oneMColIndex) {
                                    const val = input.value.trim();
                                    const color = val.startsWith('-') ? '#d9534f' : '#5cb85c';
                                    const currentStyle = originalCell.getAttribute('style') || '';
                                    originalCell.setAttribute('style',
                                        currentStyle.replace(/color:\s*#[a-fA-F0-9]{6}/, `color:${color}`)
                                    );
                                }
                            }
                        }
                    });
                });
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
                marketViewContentEl.innerHTML = sanitizeRichTextHtml(document.getElementById('marketViewContent').innerHTML);
            }
        }

        // --- Update Commodity Corner (with auto-color) ---
        const commodityCornerHeading = allH2s.find(h => h.innerText.includes('Commodity Corner'));
        if (commodityCornerHeading) {
            const uiTable = document.querySelector('#commodityCornerTable table');
            const commDivs = [...doc.querySelectorAll('.col-split > div')];
            const uiRows = uiTable.querySelectorAll('tbody tr');

            uiRows.forEach((uiRow, index) => {
                const commDiv = commDivs[index];
                if (!commDiv) return;
                const inputs = uiRow.querySelectorAll('input');
                commDiv.querySelector('h3').innerText = inputs[0].value;
                const pValue = commDiv.querySelector('h3 + p');
                const changeVal = inputs[2].value;
                const changeColor = changeVal.includes('-') ? '#d9534f' : '#5cb85c';
                if (pValue) pValue.innerHTML = `${inputs[1].value} <span style="font-size:14px; color: ${changeColor};">${changeVal}</span>`;
                const pUnit = commDiv.querySelector('h3 + p + p');
                if (pUnit) pUnit.innerText = inputs[3].value;
            });
            const dateP = commodityCornerHeading.nextElementSibling.nextElementSibling.nextElementSibling;
            if (dateP) dateP.innerText = document.getElementById('commodityCornerDate').value;
            const sourceP = dateP.nextElementSibling;
            if (sourceP) sourceP.innerText = document.getElementById('commodityCornerSources').value;
        }

        // --- Update Theme of the Week ---
        const themeHeading = allH2s.find(h => h.innerText.includes('Theme of the Week'));
        if (themeHeading) {
            themeHeading.innerText = document.getElementById('themeHeading').value;
            const themeContent = themeHeading.nextElementSibling;
            if (themeContent) themeContent.innerHTML = sanitizeRichTextHtml(document.getElementById('themeContent').innerHTML);
            const themeSources = themeContent.nextElementSibling;
            if (themeSources) themeSources.innerText = document.getElementById('themeSources').value;
        }

        // --- Update Deals (with rich-text) ---
        const dealsHeading = doc.querySelector('h2[style*="color:#BA9851"]');
        if (dealsHeading) {
            const dealsList = dealsHeading.nextElementSibling;
            if (dealsList) {
                const uiEditors = document.querySelectorAll('#dealsWatchList .rich-text-editor');
                dealsList.innerHTML = [...uiEditors].map(ed => `<li style="margin-bottom:10px;">${sanitizeRichTextHtml(ed.innerHTML)}</li>`).join('');
                const dealsSource = dealsList.nextElementSibling;
                if (dealsSource) dealsSource.innerText = document.getElementById('dealsWatchSources').value;
            }
        }

        // --- Update Expert's Opinion ---
        const expertOpinionHeading = allH2s.find(h => h.innerText.includes("Expert's Opinion"));
        if (expertOpinionHeading) {
            const expertParent = expertOpinionHeading.parentElement;
            const expertPs = expertParent.querySelectorAll('p.body-font');

            // Update heading
            if (expertPs.length >= 1) {
                const headingStrong = expertPs[0].querySelector('strong');
                if (headingStrong) headingStrong.innerText = document.getElementById('expertHeading').value;
            }
            // Update Q1
            if (expertPs.length >= 2) {
                const q1Span = expertPs[1].querySelector('span');
                if (q1Span) q1Span.innerText = document.getElementById('expertQ1').value;
            }
            // Update A1
            if (expertPs.length >= 3) {
                expertPs[2].innerText = document.getElementById('expertA1').value;
            }
            // Update Q2
            if (expertPs.length >= 4) {
                const q2Span = expertPs[3].querySelector('span');
                if (q2Span) q2Span.innerText = document.getElementById('expertQ2').value;
            }
            // Update A2
            if (expertPs.length >= 5) {
                expertPs[4].innerText = document.getElementById('expertA2').value;
            }
            // Remove extra Q&A pairs beyond Q2/A2 (template may have 3+ pairs)
            for (let i = expertPs.length - 1; i >= 5; i--) {
                expertPs[i].remove();
            }
        }

        // --- Update Reading List (with rich-text description, single ➤) ---
        const readingListHeading = allH2s.find(h => h.innerText.includes('Weekly Reading List'));
        if (readingListHeading) {
            const parent = readingListHeading.parentElement;
            const uiItems = document.querySelectorAll('#readingList .list-item');
            const originalLinks = parent.querySelectorAll('a[target="_blank"]');

            uiItems.forEach((uiItem, index) => {
                const urlInput = uiItem.querySelector('input[type="url"]');
                const titleInput = uiItem.querySelector('input[type="text"]');
                const descEditor = uiItem.querySelector('.rich-text-editor');
                const originalLink = originalLinks[index];
                if (originalLink) {
                    originalLink.href = urlInput.value;
                    // Only add ➤ here — the UI title is clean (no icon)
                    originalLink.innerHTML = `➤ ${titleInput.value}`;
                    const descSpan = originalLink.parentElement.querySelector('span');
                    if (descSpan) descSpan.innerHTML = sanitizeRichTextHtml(descEditor.innerHTML);
                }
            });
        }
    }
});