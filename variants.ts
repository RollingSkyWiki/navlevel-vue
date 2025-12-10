import { convByVar } from "./hanassist";

const variantedLevelNames = new Map<string, string>();

export function collectLevelVariants(links: HTMLAnchorElement[]) {
    for (const link of links) {
        const name = link.textContent.trim();
        const page = decodeURI(link.href.split("wiki/")[1]);
        variantedLevelNames.set(page, name);
        variantedLevelNames.set(name, name);
        variantedLevelNames.set(page.replace(/_/g, " "), name);
        variantedLevelNames.set(name.replace(/_/g, " "), name);
    }
}

export function getVariantedLevelName(name: string) {
    return variantedLevelNames.get(name) || name;
}

export function variantedType(type: "官方" | "共创") {
    if (type === "官方") {
        return "官方";
    } else {
        return convByVar({ hans: "共创", hant: "共創" });
    }
}