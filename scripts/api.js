let offset = 0;
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const BATCH_SIZE = 20;

async function fetchPokemonBatch() {
    const res = await fetch(`${POKEAPI_BASE}/pokemon?limit=${BATCH_SIZE}&offset=${offset}`);
    if (!res.ok) throw new Error(`PokeAPI Fehler: ${res.status}`);
    const data = await res.json();
    offset += BATCH_SIZE;
    return { results: data.results, hasMore: data.next !== null };
}

async function fetchPokemonDetails(basicList) {
    const promises = basicList.map(p => fetch(p.url).then(r => r.json()));
    return Promise.all(promises);
}

async function fetchPokemonByType(typeName) {
    const res = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
    if (!res.ok) throw new Error(`Typ-Fetch Fehler: ${res.status}`);
    const data = await res.json();
    return data.pokemon.map(p => p.pokemon);
}

async function fetchPokemonByTypes(types) {
    if (types.length === 1) return fetchPokemonByType(types[0]);
    const [listA, listB] = await Promise.all(types.map(fetchPokemonByType));
    const namesB = new Set(listB.map(p => p.name));
    return listA.filter(p => namesB.has(p.name));
}

async function fetchTypeRelations(typeNames) {
    const requests = typeNames.map(name => fetch(`${POKEAPI_BASE}/type/${name}`).then(res => res.json()));
    const typeData = await Promise.all(requests);
    return typeData.map(data => data.damage_relations);
}

async function fetchAbilityDetails(abilityEntries) {
    const requests = abilityEntries.map(entry => fetch(entry.ability.url).then(res => res.json()));
    return Promise.all(requests);
}

async function fetchMoveDetails(move) {
    try {
        const response = await fetch(move.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return { name: move.name, type: data.type.name };        
    } catch (error) {
        console.warn(`Move ${move.name} konnte nicht geladen werden:`, error);
        return null;        
    }
}

async function fetchLevelUpMoves(pokemonMoves) {
    const levelUpMoves = pokemonMoves.filter(entry =>
        entry.version_group_details.some(detail =>
            detail.move_learn_method.name === 'level-up'
        )
    );
    const uniqueMoves = [... new Map(levelUpMoves.map(entry => [entry.move.name, entry.move])
    ).values()];
    const moves = await Promise.all(uniqueMoves.map(fetchMoveDetails));
    return moves.filter(Boolean);
}