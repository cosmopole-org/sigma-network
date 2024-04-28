create table human (
    id bigserial not null constraint human_pk primary key,
    email varchar(100) not null unique,
    password varchar(100),
    first_name varchar(100) not null,
    last_name varchar(100) not null
);