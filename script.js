const darkTextTypes = new Set(['normal', 'grass', 'electric', 'ice', 'ground', 'flying', 'steel', 'fairy']);
let isLoading = false;
let currentPokemonId = null;
let currentCryAudio = null;
let currentCryUrl = null;
const TRAINER_HEIGHT_M = 1.7;

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
    const typeNames = pokemon.types.map(t => t.type.name);
    const relations = await fetchTypeRelations(typeNames);
    const abilityDetails = await fetchAbilityDetails(pokemon.abilities);
    const moves = await fetchLevelUpMoves(pokemon.moves);
    const evolutionChain = await fetchEvolutionChain(species.evolution_chain.url, pokemon);
    return { pokemon, species, relations, abilityDetails, moves, evolutionChain };
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
        heightImage: null,
        heightMeters: (pokemon.height / 10).toFixed(1),
        weightKg: (pokemon.weight / 10).toFixed(1),
        statsMarkup: buildStatsMarkup(buildStatsData(pokemon.stats)),
        typeBadgesMarkup: buildTypeBadges(types)
    }
}

function multiplyDamage(multipliers, typeName, factor) {
    if (multipliers[typeName] === undefined) multipliers[typeName] = 1;
    multipliers[typeName] = multipliers[typeName] * factor;
}

function applyRelations(multipliers, relation) {
    relation.double_damage_from.forEach(t => multiplyDamage(multipliers, t.name, 2));
    relation.half_damage_from.forEach(t => multiplyDamage(multipliers, t.name, 0.5));
    relation.no_damage_from.forEach(t => multiplyDamage(multipliers, t.name, 0));
}

function calculateWeaknesses(relations) {
    const multipliers = {};
    relations.forEach(relation => applyRelations(multipliers, relation));
    const weak = Object.keys(typeColors).filter(typeName => multipliers[typeName] > 1);
    return weak.sort((a, b) => multipliers[b] - multipliers[a]);
}

function addWeaknessData(modalData, relations) {
    const weaknesses = calculateWeaknesses(relations);
    modalData.weaknessMarkup = buildTypeBadges(weaknesses);
}

function addSpeciesData(modalData, species) {
    modalData.genderText = buildGenderText(species.gender_rate);
    modalData.category = buildCategoryText(species.genera);
    modalData.flavorText = buildFlavorText(species.flavor_text_entries);
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

function formatAbilityName(name) {
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getAbilityEffect(details) {
    const entry = details.effect_entries.find(e => e.language.name === 'en');
    if (entry) return entry.short_effect;
    const flavor = details.flavor_text_entries.find(f => f.language.name === 'en');
    return flavor ? flavor.flavor_text.replace(/[\n\f]/g, ' ') : 'No description available.';
}

function buildAbilityData(entry, details) {
    return {
        name: formatAbilityName(entry.ability.name),
        hiddenLabel: entry.is_hidden ? ' (Hidden)' : '',
        effect: getAbilityEffect(details)
    };
}

function addAbilitiesData(modalData, data) {
    const entries = data.pokemon.abilities;
    const abilities = entries.map((entry, i) => buildAbilityData(entry, data.abilityDetails[i]));
    modalData.abilitiesText = abilities.map(a => a.name + a.hiddenLabel).join(', ');
    modalData.abilityItemsMarkup = buildAbilityItems(abilities);
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

function getCryUrl(cries) {
    if (!cries) return null;
    return cries.latest || cries.legacy || null;
}

function stopPokemonCry() {
    if (!currentCryAudio) return;
    currentCryAudio.pause();
    currentCryAudio.currentTime = 0;
}

function playPokemonCry() {
    stopPokemonCry();
    if (!currentCryUrl) return;
    currentCryAudio = new Audio(currentCryUrl);
    currentCryAudio.play().catch(error => console.error('Could not play Pokémon cry:', error));
}

async function renderModalContent(id) {
    const data = await fetchModalData(id);
    if (!data) return;
    currentPokemonId = data.pokemon.id;
    currentCryUrl = getCryUrl(data.pokemon.cries);
    stopPokemonCry();
    const modalData = buildPokemonData(data.pokemon);
    const evolutionPath = findEvolutionPath(data.evolutionChain, data.pokemon.id);
    modalData.evolutionMarkup = evolutionChainTemplate(buildEvolutionMarkup(data.evolutionChain, data.pokemon.id, evolutionPath));
    addDetailData(modalData, data);
    await prepareHeightImage(modalData);
    document.getElementById('poke-card-modal').innerHTML = modalContentTemplate(modalData);
    await updateNavButtons(data.pokemon.id);
}

function addDetailData(modalData, data) {
    addSpeciesData(modalData, data.species);
    addWeaknessData(modalData, data.relations);
    addAbilitiesData(modalData, data);
    addHeightData(modalData, data.pokemon);
    addMovesData(modalData, data.moves);
}

function addHeightData(modalData, pokemon) {
    const heightM = (pokemon.height || 1) / 10;
    const stageM = Math.max(heightM, TRAINER_HEIGHT_M);
    const step = getRulerStep(stageM);
    modalData.pokemonScale = (heightM / stageM).toFixed(3);
    modalData.redScale = (TRAINER_HEIGHT_M / stageM).toFixed(3);
    modalData.tickGap = ((step / stageM) * 100).toFixed(2);
    modalData.rulerStep = step;
    modalData.trainerHeight = TRAINER_HEIGHT_M;
}

async function prepareHeightImage(modalData) {
    try {
        const result = await getVisibleImageBounds(modalData.image);
        modalData.heightImage = result.src;
    } catch (error) {
        console.warn('Height image cropping failed:', error);
        modalData.heightImage = modalData.image;
    }
}

function buildAbilityItems(abilities) {
    return abilities.map(a => abilityItemTemplate(a)).join('');
}

function setInfoOverlay(type) {
    document.getElementById('poke-info-wrapper').setAttribute('data-overlay', type);
}

function getRulerStep(heightM) {
    const steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];
    return steps.find(step => heightM / step <= 6) || 100;
}

function addMovesData(modalData, moves) {
    modalData.movesMarkup = buildMovesMarkup(moves);
}

function buildMovesMarkup(moves) {
    return moves.map(move => moveItemTemplate({
        name: formatMoveName(move.name),
        type: move.type
    })).join('');
}

function formatMoveName(name) {
    return name.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function toggleMovesList(button) {
    const movesList = document.getElementById('poke-moves-list');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const arrow = button.querySelector('span:last-child');
    movesList.hidden = isExpanded;
    button.setAttribute('aria-expanded', !isExpanded);
    button.querySelector('.moves-toggle-text').textContent = isExpanded ? 'Show all moves' : 'Hide moves';
    arrow.className = isExpanded ? 'moves-arrow--down' : 'moves-arrow--up'
}

async function buildEvolutionNode(node, currentPokemon) {
    const id = Number(node.species.url.split('/').filter(Boolean).pop());
    const pokemon = id === currentPokemon.id ? currentPokemon : await fetchPokemonById(id);
    const evolvesTo = await Promise.all(node.evolves_to.map(next => buildEvolutionNode(next, currentPokemon)));
    return {
        id, name: pokemon.name,
        image: pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default,
        types: pokemon.types.map(entry => entry.type.name),
        evolvesTo
    };
}


function findEvolutionPath(pokemon, currentId) {
    if (pokemon.id === currentId) return [pokemon.id];
    for (const next of pokemon.evolvesTo) {
        const path = findEvolutionPath(next, currentId);
        if (path) return [pokemon.id, ...path];
    }
    return null;
}



function buildEvolutionMarkup(pokemon, currentId, path) {
    const isCurrent = pokemon.id === currentId;
    const isPrevious = path.indexOf(pokemon.id) < path.indexOf(currentId)
        && path.includes(pokemon.id);
    const status = isCurrent ? 'current' : isPrevious ? 'previous' : 'next';
    const currentClass = ` evolution-node--${status}`;
    const types = pokemon.types.map(type => typeBadgesTemplate(type)).join('');
    const children = pokemon.evolvesTo.map(next =>
        buildEvolutionMarkup(next, currentId, path)
    ).join('');
    const branchClass = pokemon.evolvesTo.length > 1 ? ' evolution-next--branch' : '';
    const nextMarkup = children
        ? `<div class="evolution-next${branchClass}"><span class="evolution-arrow">›</span><div class="evolution-children">${children}</div></div>`
        : '';
    return evolutionNodeTemplate(pokemon, currentClass, types, nextMarkup);
}