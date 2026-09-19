async function init() {
    injectTypeColorStyles();
    const basicList = await fetchPokemonBatch();
    const pokemonList = await fetchPokemonDetails(basicList);
    renderPokemonCards(pokemonList);
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
    const cardBackground = buildCardBackground(types);
    return cardMarkupTemplate({ id, name: pokemon.name, image, badges, cardBackground });
}

function renderPokemonCards(pokemonList) {
    const wrapper = document.getElementById('pokeCardsWrapper');
    wrapper.insertAdjacentHTML('beforeend', pokemonList.map(buildCardMarkup).join(''));
}

function injectTypeColorStyles() {
    const rules = Object.entries(typeColors)
        .map(([type, { shades }]) => `.pokemon-type-${type} { background-color: rgb(${shades[0]}); }`)
        .join('\n');
    const styleTag = document.createElement('style');
    styleTag.textContent = rules;
    document.head.appendChild(styleTag);
}

function buildCardBackground(types) {
    const rgba = t => `rgba(${typeColors[t].shades[0]}, ${CARD_ALPHA})`;
    if (types.length === 1) {
        return `linear-gradient(${rgba(types[0])}, ${rgba(types[0])})`;
    }
    const [a, b] = types;
    return `linear-gradient(135deg, ${rgba(a)}, ${rgba(b)})`;
}

