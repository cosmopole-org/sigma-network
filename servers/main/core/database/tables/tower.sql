create table tower (
    id bigserial not null constraint tower_pk primary key,
    name varchar(100) not null,
    avatar_id bigint,
    is_public boolean,
    creator_id bigint not null
);