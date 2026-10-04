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

function modalContentTemplate({ id, name, image, heightMeters, weightKg, statsMarkup }) {
    return `
        <div class="poke-preview-content" data-id="modal-content" onclick="event.stopPropagation()">
            <button type="button" class="modal-close-btn" data-id="modal-close" onclick="closePokeModal()">×</button>
            <div class="poke-header" data-id="modal-header">
                <h2 data-id="modal-name">${name.toUpperCase()}</h2>
                <span class="poke-dex-number" data-id="modal-dex-number">#${id}</span>
            </div>

            <div class="pokemon-info-wrapper" data-id="modal-info-wrapper">
                <div class="pokemon-info-container" data-id="modal-info-container">

                    <div class="poke-image-column" data-id="modal-image-column">
                        <img class="modal-image" data-id="modal-image" src="${image}" alt="${name}">
                        <span class="poke-label type-label">Type</span>
                        <div class="poke-type-badges" data-id="modal-types">
                            <span class="pokemon-type pokemon-type-grass">Grass</span>
                            <span class="pokemon-type pokemon-type-poison">Poison</span>
                        </div>
                        <div class="poke-weaknesses" data-id="modal-weaknesses">
                            <span class="poke-label weakness-label">Weaknesses</span>
                            <div class="weakness-icons" data-id="modal-weakness-icons">
                                <span class="pokemon-type pokemon-type-fire">Fire</span>
                                <span class="pokemon-type pokemon-type-ice">Ice</span>
                                <span class="pokemon-type pokemon-type-flying">Flying</span>
                                <span class="pokemon-type pokemon-type-psychic">Psychic</span>
                            </div>
                        </div>
                    </div>

                    <div class="poke-abilities-column" data-id="modal-abilities-column">
                        <p class="poke-flavor-text" data-id="modal-flavor-text">
                            Platzhalter Flavor Text.
                        </p>

                        <div class="poke-stats" data-id="modal-stats">${statsMarkup}</div>

                        <div class="poke-meta-grid" data-id="modal-meta-grid">
                            <div class="meta-item" data-id="modal-height">
                                <span class="poke-label meta-label">Height</span>
                                <span class="meta-value">${heightMeters} m <button class="info-btn" data-id="modal-height-info" onclick="openInfoOverlay('height')">?</button></span>
                            </div>
                            <div class="meta-item" data-id="modal-weight">
                                <span class="poke-label meta-label">Weight</span>
                                <span class="meta-value">${weightKg} kg</span>
                            </div>
                            <div class="meta-item" data-id="modal-gender">
                                <span class="poke-label meta-label">Gender</span>
                                <span class="meta-value">Platzhalter</span>
                            </div>
                            <div class="meta-item" data-id="modal-category">
                                <span class="poke-label meta-label">Category</span>
                                <span class="meta-value">Platzhalter</span>
                            </div>
                            <div class="meta-item meta-item--full" data-id="modal-abilities">
                                <span class="poke-label meta-label">Abilities</span>
                                <span class="meta-value">Platzhalter <button class="info-btn" data-id="modal-abilities-info" onclick="openInfoOverlay('abilities')">?</button></span>
                            </div>
                        </div>
                    </div>

                </div>
                <div id="poke-info-overlay" class="poke-info-overlay hidden" data-id="modal-info-overlay" onclick="event.stopPropagation()"></div>
            </div>

            <div class="poke-moves-section" data-id="modal-moves">Gefilterte Moves-Liste – Platzhalter</div>
            <div class="poke-evolution-section" data-id="modal-evolution">Evolution Chain – Platzhalter</div>

            <div class="modal-nav" data-id="modal-nav">
                <button id="modal-arrow-prev" type="button" data-id="modal-prev" onclick="navigatePokemon(-1)">‹</button>
                <button id="modal-arrow-next" type="button" data-id="modal-next" onclick="navigatePokemon(1)">›</button>
            </div>
        </div>
    `;
}

function statRowTemplate({ label, percent}) {
    return `
        <div class="stat-row">
            <span class="stat-label">${label}</span>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${percent}%"></div>
            </div>
        </div>
    `;
}