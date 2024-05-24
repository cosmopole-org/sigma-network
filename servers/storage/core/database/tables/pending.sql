create table pending (
    id bigserial not null constraint pending_pk primary key,
    email varchar(100) not null unique,
    verify_code varchar(100) not null,
    client_code varchar(100) not null,
    state varchar(100) not null
);
