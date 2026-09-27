const darkTextTypes = new Set(['normal', 'grass', 'electric', 'ice', 'ground', 'flying', 'steel', 'fairy']);
let isLoading = false;
let currentPokemonId = null;


async function init() {
    injectTypeColorStyles();
    await loadMorePokemon();
}

function buildTypeBadges(types) {
    return types
        .map(t => typeBadgesTemplate(t))
        .join('');
}

function buildCardMarkup(pokemon) {
    const paddedId = String(pokemon.id).padStart(4, '0');
    const animatedSprite = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default;
    const homeSprite = pokemon.sprites.other.home.front_default;
    const image = animatedSprite || pokemon.sprites.front_default || homeSprite || 'https://placehold.co/120x80';
    const types = pokemon.types.map(t => t.type.name);
    const badges = buildTypeBadges(types);
    const cardBackground = buildCardBackground(types);
    return cardMarkupTemplate({ id: pokemon.id, paddedId, name: pokemon.name, image, badges, cardBackground });
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

function setLoadMoreState(isLoadingState) {
    const btn = document.getElementById('load-more-btn');
    btn.disabled = isLoadingState;
    btn.textContent = isLoadingState ? 'Loading...' : 'Load more Pokémon';
}

async function loadMorePokemon() {
    if (isLoading) return;
    isLoading = true;
    setLoadMoreState(true);

    const { results, hasMore } = await fetchPokemonBatch();
    const pokemonList = await fetchPokemonDetails(results);
    renderPokemonCards(pokemonList);

    hasMore ? setLoadMoreState(false) : document.getElementById('load-more-btn').remove();
    isLoading = false;
}

async function openPokeModal(id) {
    currentPokemonId = id;
    await renderModalContent(id);
    document.getElementById('poke-card-modal').showModal();
}

async function renderModalContent(id) {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
    if (!res.ok) return;
    const pokemon = await res.json();
    const paddedId = String(pokemon.id).padStart(4, '0');
    const name = pokemon.name;
    const officialArt = pokemon.sprites.other['official-artwork'].front_default;
    const homeSprite = pokemon.sprites.other.home.front_default;
    const image = officialArt || homeSprite || pokemon.sprites.front_default || 'https://placehold.co/300x300';
    document.getElementById('poke-card-modal').innerHTML = modalContentTemplate({ id: paddedId, name: name, image: image });
    await updateNavButtons(pokemon.id);
}

async function updateNavButtons(id) {
    const nextRes = await fetch(`${POKEAPI_BASE}/pokemon/${id + 1}`);
    document.getElementById('modal-arrow-prev').classList.toggle('hidden', id <= 1);
    document.getElementById('modal-arrow-next').classList.toggle('hidden', !nextRes.ok);
}

async function navigatePokemon(direction) {
    const newId = currentPokemonId + direction;
    await renderModalContent(newId);
}

function handleModalKeydown(event) {
    if (event.key === 'ArrowRight') navigatePokemon(1);
    if (event.key === 'ArrowLeft') navigatePokemon(-1);
}

function closePokeModal() {
    document.getElementById('poke-card-modal').close();
}