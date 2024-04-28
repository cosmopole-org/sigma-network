create table servers (
    id bigserial not null constraint servers_pk primary key,
    tag text unique not null,
    host text not null,
    port integer not null
);