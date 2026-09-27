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

function modalContentTemplate({ id, name, image }) {
    return `
        <div class="poke-preview-content" onclick="event.stopPropagation()">
            <button type="button" class="modal-close-btn" onclick="closePokeModal()">×</button>
            <img class="modal-image" src="${image}" alt="${name}">
            <h2>${name.toUpperCase()}</h2>
            <span>#${id}</span>
            <div class="modal-nav">
                <button id="modal-arrow-prev" type="button" onclick="navigatePokemon(-1)">‹</button>
                <button id="modal-arrow-next" type="button" onclick="navigatePokemon(1)">›</button>
            </div>
        </div>
    `;
}