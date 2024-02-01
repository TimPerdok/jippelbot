import IGDBApi, { Game } from "../api/IGDBApi";

export function uniqueArray(array) {
    return array.filter((obj, index, self) =>
        index === self.findIndex((o) => o.key === obj.key)
    );
}


export function uppercaseFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function gameToValue(game: Game) {
    const date = new Date((game?.nextReleaseDate ?? 0) * 1000);
    const status = game?.currentReleaseStatus != undefined
        ? `(${IGDBApi.statusToString(game.currentReleaseStatus ?? 0)})`
        : "";
    return `- [${game.name}](${game.url}) ${status}
        ${game?.nextReleaseDate ?
            `<t:${Math.round(date.getTime() / 1000)}:R>`
            : ""}
            ${game?.userDescription ?
                `  - ${game.userDescription}` : ""}`
}