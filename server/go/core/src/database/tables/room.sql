create table room (
    id bigserial not null constraint room_pk primary key,
    name varchar(100) not null,
    avatar_id bigint,
    tower_id bigint not null
);