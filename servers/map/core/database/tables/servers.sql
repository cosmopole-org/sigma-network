create table servers (
    id bigserial not null constraint servers_pk primary key,
    tag varchar(100) unique not null,
    address varchar(100) not null
);