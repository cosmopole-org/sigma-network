create table worker (
    id bigserial not null constraint worker_pk primary key,
    room_Id bigint not null,
    machine_id bigint not null,
    metadata text not null
);