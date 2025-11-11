export const sampleArray = (array, count) => {

    const random = [...array];

    for (let i = random.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [random[i], random[j]] = [random[j], random[i]];
    }

    return random.slice(0, count);
};