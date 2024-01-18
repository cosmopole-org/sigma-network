create table invite (
    id bigserial not null constraint invite_pk primary key,
    human_id bigint not null,
    tower_id bigint not null,
    unique (human_id, tower_id)
);