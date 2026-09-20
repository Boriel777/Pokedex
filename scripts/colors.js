const typeColors = {
    normal:   { main: ['164, 172, 175'] },
    fire:     { main: ['253, 125, 36'] },
    water:    { main: ['69, 146, 196'] },
    electric: { main: ['238, 213, 53'] },
    grass:    { main: ['155, 204, 80'] },
    ice:      { main: ['81, 196, 231'] },
    fighting: { main: ['213, 103, 35'] },
    poison:   { main: ['185, 127, 201'] },
    ground:   { main: ['247, 222, 63', '171, 152, 66'] },
    flying:   { main: ['61, 199, 239', '189, 185, 184'] },
    psychic:  { main: ['243, 102, 185'] },
    bug:      { main: ['114, 159, 63'] },
    rock:     { main: ['163, 140, 33'] },
    ghost:    { main: ['123, 98, 163'] },
    dragon:   { main: ['83, 164, 207', '241, 110, 87'] },
    dark:     { main: ['112, 112, 112'] },
    steel:    { main: ['158, 183, 184'] },
    fairy:    { main: ['253, 185, 233'] },
};

function typeGradient(type, angle = 180) {
    const [c1, c2 = c1] = typeColors[type].main;
    return `linear-gradient(${angle}deg, rgb(${c1}) 50%, rgb(${c2}) 50%)`;
}
const CARD_ALPHA = 0.75;