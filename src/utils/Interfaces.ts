export interface ButtonProps {
    text?: string;
    aftericon?: React.ReactNode;
    beforeicon?: React.ReactNode;
    onclick?: () => void;
    classname?: string;
    textcolor?: string;
    backgroundcolor?: string;
}

export interface MenuProps {
    classname?: string;
    visible: boolean;
    close: () => void;
    create: () => void;
    children?: React.ReactNode;
}

export interface InputProps {
    visible?: boolean;
    icon?: React.ReactNode;
    alternateIcon?: React.ReactNode;
    name?: string;
    placeholder?: string;
    value?: string | number;
    onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    textcolor?: string;
    width?: string;
    select?: boolean;
}

export interface OptionProps {
    id: number;
    width?: string;
    height?: string;
    title?: string;
    url?: string;
    description?: string;
    onclick?: () => void;
}

export interface TaskProps {
    taskID: string;
    stageID: string;
    name: string;
    completed: boolean;
    onclick?: (id:string) => void;
}

export interface StageProps {
    stageID: string;
    stageName: string;
    taskList: TaskProps[];
    showTaskMenu: (stageID: string) => void;
}

export interface TextboxProps {
    classname?: string;
    backgroundcolour?: string;
    textcolor?: string;
    width?: string;
    height?: string;
    placeholder?: string;
    onchange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}