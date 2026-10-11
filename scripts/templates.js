function cardMarkupTemplate({ id, paddedId, name, image, badges, cardBackground }) {
    return `
        <li class="pokemon-card" data-id="card-${id}" style="--card-bg: ${cardBackground};">
            <button class="pokemon-card-button" type="button" aria-label="Open information about ${name}" data-id="card" onclick="openPokeModal(${id})">
                <div class="pokemon-card-content">
                    <span class="pokemon-card-id">#${paddedId}</span>
                    <h2 class="pokemon-card-name">${name.toUpperCase()}</h2>
                    <div class="poke-img-wrapper"><img class="pokemon-card-image" src="${image}" alt="${name}" data-id="card-image"></div>
                    <div class="pokemon-card-types">${badges}</div>
                </div>
            </button>
        </li>
    `;
}

function typeBadgesTemplate(t) {
    return `
    <span class="pokemon-type pokemon-type-${t}">${t}</span>
    `;
}

function modalContentTemplate(data) {
    return `
        <div class="poke-preview-content" data-id="modal-content" onclick="event.stopPropagation()">
            <button type="button" class="modal-close-btn" data-id="modal-close" onclick="closePokeModal()">×</button>
            ${modalHeaderTemplate(data)}
            ${modalInfoWrapperTemplate(data)}
            <div class="poke-moves-section" data-id="modal-moves">Gefilterte Moves-Liste – Platzhalter</div>
            <div class="poke-evolution-section" data-id="modal-evolution">Evolution Chain – Platzhalter</div>
            ${modalNavTemplate()}
        </div>
    `;
}

function modalHeaderTemplate({ id, name }) {
    return `
        <div class="poke-header" data-id="modal-header">
            <h2 data-id="modal-name">${name.toUpperCase()}</h2>
            <span class="poke-dex-number" data-id="modal-dex-number">#${id}</span>
        </div>
    `;
}

function modalInfoWrapperTemplate(data) {
    return `
        <div class="pokemon-info-wrapper" data-id="modal-info-wrapper">
            <div class="pokemon-info-container" data-id="modal-info-container">
                ${modalImageColumnTemplate(data)}
                ${modalAbilitiesColumnTemplate(data)}
            </div>
            <div id="poke-info-overlay" class="poke-info-overlay hidden" data-id="modal-info-overlay" onclick="event.stopPropagation()"></div>
        </div>
    `;
}

function modalImageColumnTemplate({ name, image, typeBadgesMarkup }) {
    return `
        <div class="poke-image-column" data-id="modal-image-column">
            <img class="modal-image" data-id="modal-image" src="${image}" alt="${name}">
            <span class="poke-label type-label">Type</span>
            <div class="poke-type-badges" data-id="modal-types">${typeBadgesMarkup}</div>
            <div class="poke-weaknesses" data-id="modal-weaknesses">
                <span class="poke-label weakness-label">Weaknesses</span>
                <div class="weakness-icons" data-id="modal-weakness-icons">Platzhalter</div>
            </div>
        </div>
    `;
}

function modalAbilitiesColumnTemplate(data) {
    return `
        <div class="poke-abilities-column" data-id="modal-abilities-column">
            <p class="poke-flavor-text" data-id="modal-flavor-text">${data.flavorText}</p>
            <div class="poke-stats" data-id="modal-stats">${data.statsMarkup}</div>
            ${modalMetaGridTemplate(data)}
        </div>
    `;
}

function modalMetaGridTemplate(data) {
    return `
        <div class="poke-meta-grid" data-id="modal-meta-grid">
            ${metaItemTemplate('modal-height', 'Height', data.heightMeters + ' m ' + infoButtonTemplate('height'), '')}
            ${metaItemTemplate('modal-weight', 'Weight', data.weightKg + ' kg', '')}
            ${metaItemTemplate('modal-gender', 'Gender', data.genderText, '')}
            ${metaItemTemplate('modal-category', 'Category', data.category, '')}
            ${metaItemTemplate('modal-abilities', 'Abilities', 'Platzhalter ' + infoButtonTemplate('abilities'), 'meta-item--full')}
        </div>
    `;
}

function metaItemTemplate(dataId, label, value, extraClass) {
    return `
        <div class="meta-item ${extraClass}" data-id="${dataId}">
            <span class="poke-label meta-label">${label}</span>
            <span class="meta-value">${value}</span>
        </div>
    `;
}

function infoButtonTemplate(type) {
    return `<button class="info-btn" data-id="modal-${type}-info" onclick="openInfoOverlay('${type}')">?</button>`;
}

function modalNavTemplate() {
    return `
        <div class="modal-nav" data-id="modal-nav">
            <button id="modal-arrow-prev" type="button" data-id="modal-prev" onclick="navigatePokemon(-1)">‹</button>
            <button id="modal-arrow-next" type="button" data-id="modal-next" onclick="navigatePokemon(1)">›</button>
        </div>
    `;
}

function statRowTemplate({ label, percent }) {
    return `
        <div class="stat-row">
            <span class="stat-label">${label}</span>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${percent}%"></div>
            </div>
        </div>
    `;
}