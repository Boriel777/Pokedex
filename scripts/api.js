const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
let offset = 0;
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