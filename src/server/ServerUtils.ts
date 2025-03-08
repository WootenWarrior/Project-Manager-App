import config from './serverconfig.json';

// Server setup functions

export const getServerOrigin = (): string => {
    const environment = process.env.NODE_ENV || "development";
    return environment === "production" ? config["prod-origin"] : config["dev-origin"];
};

export const getServiceAccountOrigin = (): string => {
    const environment = process.env.NODE_ENV || "development";
    return environment === "production" ? config["prod-service-account"] : config["dev-service-account"];
};

export const getStaticFilePath = (): string => {
    const environment = process.env.NODE_ENV || "development";
    return environment === "production" ? config["prod-file-path"] : config["dev-file-path"];
};


// Server interfaces

export interface projectData {
    title: string,
    description: string,
    createdAt: Date,
    theme: string
}

export interface stageData {
    stageID: string;
    stageName: string;
    taskList: taskData[];
}

export interface taskData {
    taskID: string;
    stageID: string;
    name: string;
    completed: boolean;
}