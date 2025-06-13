export const createButton = (id, text, { backgroundColor, color, fontSize }, onClick, assignTo) => {
    const btn = document.createElement('button');
    btn.id = id;
    btn.textContent = text;
    btn.addEventListener('click', onClick);

    Object.assign(btn.style, {
        alignItems: 'center',
        backgroundColor: backgroundColor || '#FFFFFF',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '.25rem',
        boxShadow: 'rgba(0, 0, 0, 0.08) 0 1px 3px 0',
        boxSizing: 'border-box',
        color: color || 'rgba(0, 0, 0, 0.85)',
        cursor: 'pointer',
        display: 'inline-flex',
        fontFamily: 'system-ui,-apple-system,system-ui,"Helvetica Neue",Helvetica,Arial,sans-serif',
        fontSize: fontSize || '16px',
        fontWeight: '600',
        justifyContent: 'center',
        lineHeight: '1.25',
        minHeight: '3rem',
        padding: 'calc(.875rem - 1px) calc(1.5rem - 1px)',
        textDecoration: 'none',
        transition: 'all 250ms',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        verticalAlign: 'baseline',
        width: 'auto'
    });

    btn.onmouseover = btn.onfocus = () => {
        btn.style.borderColor = 'rgba(0, 0, 0, 0.15)';
        btn.style.boxShadow = 'rgba(0, 0, 0, 0.1) 0 4px 12px';
        btn.style.color = 'rgba(0, 0, 0, 0.65)';
    };

    btn.onmouseleave = btn.onblur = () => {
        btn.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        btn.style.boxShadow = 'rgba(0, 0, 0, 0.02) 0 1px 3px 0';
        btn.style.color = 'rgba(0, 0, 0, 0.85)';
        btn.style.transform = 'translateY(0)';
    };

    btn.onmousedown = () => {
        btn.style.backgroundColor = '#F0F0F1';
        btn.style.boxShadow = 'rgba(0, 0, 0, 0.06) 0 2px 4px';
        btn.style.transform = 'translateY(0)';
    };

    btn.onmouseup = () => {
        btn.style.backgroundColor = backgroundColor || '#FFFFFF';
        btn.style.boxShadow = 'rgba(0, 0, 0, 0.08) 0 1px 3px 0';
        btn.style.transform = 'translateY(-1px)';
    };

    btn.onmouseover = () => btn.style.transform = 'translateY(-1px)';

    assignTo.appendChild(btn);

    return btn;
};

export default () => {
    console.log('[schoology-export] UI injection script initialized.');

    const materialsTopBar = document.querySelector('#main-inner .materials-top');
    if (!materialsTopBar)
        return console.warn('[schoology-export] Could not find the course materials top bar. The script may not be running on a course materials page.');

    materialsTopBar.style.height = 'auto';
    materialsTopBar.style.padding = '10px 0';

    // Create a wrapper for the UI elements.
    const wrapper = document.createElement('div');
    wrapper.id = 'schoology-export:ui-wrapper';

    const title = document.createElement('h2');
    title.innerText = 'schoology-export';

    // Create a container for the buttons, using flexbox for layout.
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.flexDirection = 'row';
    buttonContainer.style.padding = '10px 0';
    buttonContainer.style.gap = '8px';

    materialsTopBar.appendChild(wrapper);
    wrapper.appendChild(title);
    wrapper.appendChild(buttonContainer);
    
    // Create and append the buttons for each functionality.
    const buttonFontSize = '11px';

    const openAllFoldersButton = createButton('schoology-export:open-all-folders', 'Open All Folders', { fontSize: buttonFontSize }, e => {
        e.target.textContent = 'Opening Folders...';
        window.postMessage({ type: 'schoology-export:open-all-folders' }, '*');
    }, buttonContainer);

    const scrapeButton = createButton('schoology-export:scrape-trigger', 'Scrape Course Materials', { fontSize: buttonFontSize }, e => {
        e.target.textContent = 'Scraping...';
        window.postMessage({ type: 'schoology-export:scrape-trigger' }, '*');
    }, buttonContainer);

    const exportButton = createButton('schoology-export:export-trigger', 'Export Course Materials', { fontSize: buttonFontSize }, e => {
        e.target.textContent = 'Exporting...';
        window.postMessage({ type: 'schoology-export:export-trigger' }, '*');
    }, buttonContainer);

    [openAllFoldersButton, scrapeButton, exportButton].forEach(btn => {
        btn.setAttribute('original-text', btn.innerText);

        btn.addEventListener('click', e => {
            btn.disabled = true;

            // btn.style.backgroundColor = 'rgb(201 201 201)';
            // btn.style.color = 'rgb(114 114 114 / 85%)';
            btn.style.filter = 'brightness(0.8)';
        });
    });

    return {
        openAllFoldersButton,
        scrapeButton,
        exportButton
    };
};