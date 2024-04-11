
const isIdEmpty = (id: string) => {
    return id === undefined || id === null || id.length === 0;
};

const isReadOffsetEmpty = (offset: number) => {
    return offset <= 0;
};

const isReadCountEmpty = (count: number) => {
    return count <= 0 || count === undefined || count === null;
};

const isReadCountInvalid = (count: number) => {
    return count > 100;
};

export {
    isIdEmpty,
    isReadCountEmpty,
    isReadCountInvalid,
    isReadOffsetEmpty
}
