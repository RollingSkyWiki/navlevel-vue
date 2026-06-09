import { t } from "./locale";

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

export function variantedType(type: "官方" | "共创" | "饭制" | "活动") {
    if (type === "官方") {
        return t('type.official');
    } else {
        return {
            "共创": t('type.cocreation'),
            "饭制": t('type.fanmade'),
            "活动": t('type.event')
        }[type];
    }
}