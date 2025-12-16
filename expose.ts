import type { LevelEntry } from "./data";

declare global {
    interface Window {
        NavLevel: {
            Sorting: { [key: string]: string };
            sortingFunctions: { [key: string]: (a: LevelEntry, b: LevelEntry) => number };
            Grouping: { [key: string]: string };
            groupingFunctions: { [key: string]: (entries: LevelEntry[]) => { group: string, list: LevelEntry[] }[] };
            processPopup: (entry: LevelEntry, div: HTMLElement) => void;
        }
    }
}

function sameKeys(a: Record<string, any>, b: Record<string, any>): boolean {
    return Object.keys(a).every(key => b.hasOwnProperty(key));
}
export function init(
    Sorting,
    sortingFunctions,
    sortingPriority,
    Grouping,
    groupingFunctions
): (entry: LevelEntry, div: HTMLElement) => void {
    const callbacks: ((entry: LevelEntry, div: HTMLElement) => void)[] = [];
    if (window.NavLevel) {
        if (window.NavLevel.Sorting && window.NavLevel.sortingFunctions) {
            if (!sameKeys(window.NavLevel.sortingFunctions, window.NavLevel.Sorting)) {
                throw new Error("Sorting methods and functions do not match.")
            }
            Object.assign(Sorting, window.NavLevel.Sorting);
            Object.assign(sortingFunctions, window.NavLevel.sortingFunctions);
        }
        for (const sorting in Sorting) {
            if (!sortingPriority.includes(sorting)) {
                sortingPriority.push(sorting);
            }
        }
        if (window.NavLevel.Grouping && window.NavLevel.groupingFunctions) {
            if (!sameKeys(window.NavLevel.groupingFunctions, window.NavLevel.Grouping)) {
                throw new Error("Grouping methods and functions do not match.")
            }
            Object.assign(Grouping, window.NavLevel.Grouping);
            Object.assign(groupingFunctions, window.NavLevel.groupingFunctions);
        }
        if (window.NavLevel.processPopup) {
            callbacks.push(window.NavLevel.processPopup);
        }
        console.log("检测到window.NavLevel，已合并")
    }
    window.NavLevel = {
        Sorting,
        sortingFunctions,
        Grouping,
        groupingFunctions,
        set processPopup(callback: (entry: LevelEntry, div: HTMLElement) => void) {
            callbacks.push(callback);
        }
    };
    return (entry: LevelEntry, div: HTMLElement) => {
        callbacks.forEach(callback => callback(entry, div));
    }
}