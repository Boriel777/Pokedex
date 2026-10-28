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
            <section class="poke-moves-section" data-id="modal-moves">${movesSectionTemplate(data.movesMarkup, (data.movesMarkup.match(/<li\b/g) || []).length)}</section>
            <section class="poke-evolution-section" data-id="modal-evolution">${data.evolutionMarkup}</section>
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
        <div id="poke-info-wrapper" class="pokemon-info-wrapper" data-id="modal-info-wrapper" data-overlay="none">
            <div class="pokemon-info-container" data-id="modal-info-container">
                ${modalImageColumnTemplate(data)}
                ${modalAbilitiesColumnTemplate(data)}
            </div>
        </div>
    `;
}

function modalImageColumnTemplate({ name, image, typeBadgesMarkup, weaknessMarkup }) {
    return `
        <div class="poke-image-column" data-id="modal-image-column">
            <img class="modal-image" data-id="modal-image" src="${image}" alt="${name}">
            <div class="poke-cry-wrapper" data-id="modal-cry-wrapper">
                <h3 class="poke-label type-label">Type</h3>
                <button id="poke-cry" type="button" data-id="modal-cry-btn" aria-label="Play Pokémon cry" onclick="playPokemonCry()">
                    <img class="poke-sound-img" src="./assets/img/sound.svg" alt="sound">
                </button>
            </div>
            <div class="poke-type-badges" data-id="modal-types">${typeBadgesMarkup}</div>
            <div class="poke-weaknesses" data-id="modal-weaknesses">
                <h3 class="poke-label weakness-label">Weaknesses</h3>
                <div class="weakness-icons" data-id="modal-weakness-icons">${weaknessMarkup}</div>
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
            ${metaItemTemplate('modal-abilities', 'Abilities', data.abilitiesText + ' ' + infoButtonTemplate('abilities'), 'meta-item--full')}
            ${heightOverlayTemplate(data)}
            ${abilityOverlayTemplate(data.abilityItemsMarkup)}
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
    return `<button class="info-btn" data-id="modal-${type}-info" onclick="setInfoOverlay('${type}')">?</button>`;
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

function abilityItemTemplate({ name, hiddenLabel, effect }) {
    return `
        <li class="ability-item" data-id="ability-item">
            <strong>${name}${hiddenLabel}</strong>
            <p>${effect}</p>
        </li>
    `;
}

function abilityOverlayTemplate(itemsMarkup) {
    return `
        <div class="poke-info-overlay poke-info-overlay--abilities" data-id="modal-abilities-overlay">
            <div class="poke-info-overlay--title">
                <button type="button" class="info-close-btn" data-id="abilities-overlay-close" onclick="setInfoOverlay('none')">×</button>
                <h3 data-id="overlay-title">Abilities</h3>
            </div>
            <ul class="ability-list" data-id="ability-list">${itemsMarkup}</ul>
        </div>
    `;
}

function heightOverlayTemplate(data) {
    return `
        <div class="poke-info-overlay poke-info-overlay--height" data-id="modal-height-overlay"
            style="--pokemon-scale: ${data.pokemonScale}; --red-scale: ${data.redScale}; --tick-gap: ${data.tickGap}%;">
            <button type="button" class="info-close-btn" data-id="height-overlay-close" onclick="setInfoOverlay('none')">×</button>
            <h3 data-id="height-overlay-title">Height comparison</h3>
            ${heightSceneTemplate(data)}
            ${heightLegendTemplate(data.name)}
            <p class="height-caption" data-id="height-caption">1 mark = ${data.rulerStep} m</p>
        </div>
    `;
}

function heightSceneTemplate(data) {
    return `
        <div class="height-scene" data-id="height-scene">
            <div class="height-marks" data-id="height-marks">
                <span class="height-mark height-mark--red" data-id="height-mark-red">${data.trainerHeight} m</span>
                <span class="height-mark height-mark--pokemon" data-id="height-mark-pokemon">${data.heightMeters} m</span>
            </div>
            <div class="height-ruler" data-id="height-ruler"></div>
            ${heightStageTemplate(data)}
        </div>
    `;
}

function heightStageTemplate({ name, heightImage }) {
    return `
        <div class="height-stage" data-id="height-stage">
            <span class="height-line height-line--red"></span>
            <span class="height-line height-line--pokemon"></span>
            <img class="height-silhouette height-silhouette--pokemon"
                data-id="height-pokemon" src="${heightImage}" alt="${name} silhouette">
            <img class="height-silhouette height-silhouette--red"
                data-id="height-red" src="./assets/img/Red.png" alt="Red silhouette">
        </div>
    `;
}

function heightLegendTemplate(name) {
    return `
        <p class="height-legend" data-id="height-legend">
            <span class="height-swatch height-swatch--red"></span>Red
            <span class="height-swatch height-swatch--pokemon"></span>${name.toUpperCase()}
        </p>
    `;
}


function movesSectionTemplate(movesMarkup, moveCount) {
    return `
        <div class="poke-moves-header">
            <h3 class="poke-label">Moves<br><span>(${moveCount} Level-up-moves)</span></h3>
            <button class="poke-moves-toggle" type="button" aria-expanded="false" onclick="toggleMovesList(this)">
                <span class="moves-toggle-text">Show all moves </span>
                <span class="moves-arrow--down">›</span>
            </button>
        </div>
        <ul id="poke-moves-list" data-id="moves-list" hidden>
            ${movesMarkup}
        </ul>
    `;
}

function moveItemTemplate({ name, type }) {
    return `
        <li class="poke-move-item" data-id="move-item">
            <span class="poke-move-name">${name}</span>
            <span class="pokemon-type pokemon-type-${type}">${type}</span>
        </li>
    `;
}

function evolutionChainTemplate(chainMarkup) {
    return `
        <h3 class="poke-label">Evolution Chain</h3>
        <div class="evolution-chain">${chainMarkup}</div>
    `
}


function evolutionNodeTemplate(pokemon, currentClass, types, children) {
    return `
        <div class="evolution-node${currentClass}">
            <button class="evolution-pokemon" type="button"
                onclick="openPokeModal(${pokemon.id})">
                <span class="evolution-image-circle"><img src="${pokemon.image}" alt="${pokemon.name}"class="evolution-image"></span>
                <span class="evolution-name">${pokemon.name}</span>
                <span class="evolution-number">#${String(pokemon.id).padStart(4, '0')}</span>
                <span class="evolution-types">${types}</span>
            </button>
            ${children}
        </div>
    `;
}