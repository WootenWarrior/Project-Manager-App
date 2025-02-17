import config from './serverconfig.json';

export const getServerOrigin = (): string => {
    const environment = process.env.NODE_ENV || "development";
    return environment === "production" ? config["prod-origin"] : config["dev-origin"];
};

export const getServiceAccountOrigin = (): string => {
    const environment = process.env.NODE_ENV || "development";
    return environment === "production" ? config["prodSA"] : config["devSA"];
};