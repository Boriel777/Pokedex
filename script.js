async function init() {
    const basicList = await fetchPokemonBatch();
    const pokemonList = await fetchPokemonDetails(basicList);
    renderPokemonCards(pokemonList);
    injectTypeColorStyles();
}

function buildTypeBadges(types) {
    return types
        .map(t => typeBadgesTemplate(t))
        .join('');
}

function buildCardMarkup(pokemon) {
    const id = String(pokemon.id).padStart(3, '0');
    const image = pokemon.sprites.front_default || 'https://placehold.co/120x80';
    const types = pokemon.types.map(t => t.type.name);
    const badges = buildTypeBadges(types);
    return cardMarkupTemplate({ id, name: pokemon.name, image, badges });
}

function renderPokemonCards(pokemonList) {
    const wrapper = document.getElementById('pokeCardsWrapper');
    wrapper.insertAdjacentHTML('beforeend', pokemonList.map(buildCardMarkup).join(''));
}

function injectTypeColorStyles() {
    const rules = Object.entries(typeColors)
        .map(([type, { main }]) => `.pokemon-type-${type} { background-color: ${main}; }`)
        .join('\n');
    const styleTag = document.createElement('style');
    styleTag.textContent = rules;
    document.head.appendChild(styleTag);
}