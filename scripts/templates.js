function cardMarkupTemplate({ id, name, image, badges }) {
    return `
        <li class="pokemon-card" data-id="card-${id}">
            <button class="pokemon-card-button" type="button"
                aria-label="Open information about ${name}" data-id="card">
                <div class="pokemon-card-content">
                    <span class="pokemon-card-id">#${id}</span>
                    <h2 class="pokemon-card-name">${name.toUpperCase()}</h2>
                    <img class="pokemon-card-image" src="${image}" alt="${name}" data-id="card-image">
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