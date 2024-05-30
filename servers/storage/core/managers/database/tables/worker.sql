create table worker (
    id bigserial not null constraint worker_pk primary key,
    topic_id bigint not null,
    machine_id bigint not null,
    metadata text not null,
    origin text not null,
    user_origin text not null
);