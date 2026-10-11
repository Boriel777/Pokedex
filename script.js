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

function buildStatsMarkup(stats) {
    return stats.map(statRowTemplate).join('');
}

async function fetchModalData(id) {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
    if (!res.ok) return null;
    const pokemon = await res.json();
    const speciesRes = await fetch(pokemon.species.url);
    const species = await speciesRes.json();
    return { pokemon, species };
}

function getModalImage(sprites) {
    const officialArt = sprites.other['official-artwork'].front_default;
    const homeSprite = sprites.other.home.front_default;
    return officialArt || homeSprite || sprites.front_default || 'https://placehold.co/300x300';
}

function buildPokemonData(pokemon) {
    const types = pokemon.types.map(t => t.type.name);
    return {
        id: String(pokemon.id).padStart(4, '0'),
        name: pokemon.name,
        image: getModalImage(pokemon.sprites),
        heightMeters: (pokemon.height / 10).toFixed(1),
        weightKg: (pokemon.weight / 10).toFixed(1),
        statsMarkup: buildStatsMarkup(buildStatsData(pokemon.stats)),
        typeBadgesMarkup: buildTypeBadges(types)
    }
}

function addSpeciesData(modalData, species) {
    modalData.genderText = buildGenderText(species.gender_rate);
    modalData.category = buildCategoryText(species.genera);
    modalData.flavorText = buildFlavorText(species.flavor_text_entries);
}

async function renderModalContent(id) {
    const data = await fetchModalData(id);
    if (!data) return;
    currentPokemonId = data.pokemon.id;
    const modalData = buildPokemonData(data.pokemon);
    addSpeciesData(modalData, data.species);
    document.getElementById('poke-card-modal').innerHTML = modalContentTemplate(modalData);
    await updateNavButtons(data.pokemon.id);
}

function buildStatsData(statsArray) {
    const statMap = {
        hp: 'HP', attack: 'ATK', defense: 'DEF', 'special-attack': 'SP.ATK', 'special-defense': 'SP.DEF', speed: 'SPD'
    };
    return statsArray.map(s => ({
        label: statMap[s.stat.name] || s.stat.name.toUpperCase(),
        value: s.base_stat,
        percent: Math.round((s.base_stat / 255) * 100)
    }));
}

function buildGenderText(genderRate) {
    if (genderRate === -1) return 'Genderless';
    const femalePercent = (genderRate / 8) * 100;
    const malePercent = 100 - femalePercent;
    return `♂ ${malePercent}% / ♀ ${femalePercent}%`;
}

function buildCategoryText(genera) {
    const entry = genera.find(g => g.language.name === 'en');
    return entry ? entry.genus : 'Unknown';
}

function buildFlavorText(flavorTextEntries) {
    const entry = flavorTextEntries.find(f => f.language.name === 'en');
    if (!entry) return '';
    return entry.flavor_text.replace(/[\n\f]/g, ' ');
}

async function updateNavButtons(id) {
    const nextRes = await fetch(`${POKEAPI_BASE}/pokemon/${id + 1}`);
    document.getElementById('modal-arrow-prev').classList.toggle('hidden', id <= 1);
    document.getElementById('modal-arrow-next').classList.toggle('hidden', !nextRes.ok);
}

async function navigatePokemon(direction) {
    await renderModalContent(currentPokemonId + direction);
}

function handleModalKeydown(event) {
    if (event.key === 'ArrowRight') navigatePokemon(1);
    if (event.key === 'ArrowLeft') navigatePokemon(-1);
}

function closePokeModal() {
    document.getElementById('poke-card-modal').close();
}

function openInfoOverlay(type) {
    const overlay = document.getElementById('poke-info-overlay');
    overlay.className = `poke-info-overlay poke-info-overlay--${type}`;
    overlay.innerHTML = type === 'height' ? heightOverlayTemplate(/*...*/) : abilityOverlayTemplate(/*...*/);
    overlay.classList.remove('hidden');
}

