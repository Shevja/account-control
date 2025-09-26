export interface Tag {
    text: string;
}

export interface Account {
    id: number,
    login: string,
    password: string | null,
    tags: Tag[],
    recordType: string,
    loginError?: boolean,
    passwordError?: boolean,
}

export interface RecordType {
    label: string,
    value: string,
}