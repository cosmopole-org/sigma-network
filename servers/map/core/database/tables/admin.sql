create table admin (
    id bigserial not null constraint admin_pk primary key,
    human_id bigint not null,
    password varchar(100) not null
);