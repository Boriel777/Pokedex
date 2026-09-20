const darkTextTypes = new Set([
    'normal', 'grass', 'electric', 'ice', 'ground', 'flying', 'steel', 'fairy'
]);

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
    const animatedSprite = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default;
    const image = animatedSprite || pokemon.sprites.front_default || 'https://placehold.co/120x80';
    const types = pokemon.types.map(t => t.type.name);
    const badges = buildTypeBadges(types);
    const cardBackground = buildCardBackground(types);
    return cardMarkupTemplate({ id, name: pokemon.name, image, badges, cardBackground });
}

function renderPokemonCards(pokemonList) {
    const wrapper = document.getElementById('pokeCardsWrapper');
    wrapper.insertAdjacentHTML('beforeend', pokemonList.map(buildCardMarkup).join(''));
}

function getTypeTextColor(type) {
    return darkTextTypes.has(type) ? '#000' : '#fff'
}

function injectTypeColorStyles() {
    const rules = Object.keys(typeColors)
        .map(type => `.pokemon-type-${type} { background: ${typeGradient(type)}; color: ${getTypeTextColor(type)}; }`)
        .join('\n');
    const styleTag = document.createElement('style');
    styleTag.textContent = rules;
    document.head.appendChild(styleTag);
}

function buildCardBackground(types) {
    const colorGroups = types.map(t => {
        const c = typeColors[t].main;
        return c.length === 1 ? [c[0], c[0]] : c;
    });
    const colors = colorGroups.flat().map(c => `rgba(${c}, ${CARD_ALPHA})`);
    if (colors.length === 1) {
        return `linear-gradient(${colors[0]}, ${colors[0]})`;
    }
    return `linear-gradient(135deg, ${buildGradientStops(colors)})`;
}

function buildGradientStops(colors) {
    return colors.join(', ');
}