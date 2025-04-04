export interface ProjectProps {
    title: string;
    description: string;
    theme: string;
}

export interface ButtonProps {
    text?: string;
    aftericon?: React.ReactNode;
    beforeicon?: React.ReactNode;
    onclick?: () => void;
    classname?: string;
    textcolor?: string;
    backgroundcolor?: string;
    highlightColor?: string;
    altIcon?: React.ReactNode;
    tooltip?: string;
}

export interface HiddenMenuProps {
    classname?: string;
    visible: boolean;
    close?: () => void;
    create?: () => void;
    createButtonText?: string;
    closeButtonText?: string;
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
    time: string;
    description?: string;
    onclick?: () => void;
    backgroundColor?: string;
}

export interface TaskProps {
    taskID: string;
    stageID: string;
    name: string;
    completed: boolean;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    description: string;
    x: number;
    y: number;
    onclick?: (stageID: string, taskID:string) => void;
    nextTask: string | null;
    prevTask: string | null;
    color?: string;
    selecting?: boolean;
    dragging: boolean;
}

export interface AttachmentProps {
    attachmentID: string;
    stageID: string;
    name: string;
    attachment?: string | null;
    mimeType?: string | null;
    x: number;
    y: number;
    onclick?: (stageID: string, attachmentID: string) => void;
}

export interface StageProps {
    stageID: string;
    stageName: string;
    taskList: TaskProps[];
    attachmentList: AttachmentProps[];
    showTaskMenu: (stageID: string) => void;
    showTaskEdit: (stageID: string, taskID: string) => void;
    showStageEdit: (stageID: string) => void;
    showAttachmentMenu: (stageID: string) => void;
    showAttachmentEdit: (stageID: string, attachmentID: string) => void;
    filterText?: string;
    color?: string;
    width: number;
    height: number;
}

export interface TextboxProps {
    classname?: string;
    backgroundcolour?: string;
    textcolor?: string;
    width?: string;
    height?: string;
    placeholder?: string;
    onchange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    text?: string;
    value?: string;
}

export interface TimeInputProps {
    id: string;
    onTimeChange: (time: string) => void;
    text?: string;
}

export interface DateInputProps {
    id: string;
    onDateChange: (date: string) => void;
    text?: string;
    displayDate?: string;
}

export interface ErrorPageProps {
    header?: string;
    message?: string;
}

export interface ConfirmationProps {
    onConfirm: () => void;
    text: string;
    visible: boolean;
}