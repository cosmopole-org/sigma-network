create table message (
    id bigserial not null constraint message_pk primary key,
    data text not null,
    time bigint not null,
    author_id bigint not null,
    space_id bigint not null
);